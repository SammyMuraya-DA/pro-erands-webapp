import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, pickupLat, pickupLng } = await req.json();

    if (!orderId) throw new Error('orderId is required');

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) throw new Error('Order not found');

    // Cancel any existing pending dispatch requests for this order
    await supabase
      .from('dispatch_requests')
      .update({ status: 'cancelled' })
      .eq('order_id', orderId)
      .eq('status', 'pending');

    // Get all available riders with location
    const { data: riders, error: ridersError } = await supabase
      .from('riders')
      .select('*')
      .eq('status', 'available');

    if (ridersError) throw new Error('Failed to fetch riders');

    if (!riders || riders.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No available riders' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get riders who have already declined this order
    const { data: declinedRequests } = await supabase
      .from('dispatch_requests')
      .select('rider_id')
      .eq('order_id', orderId)
      .in('status', ['declined', 'expired']);

    const declinedRiderIds = new Set((declinedRequests || []).map(r => r.rider_id));

    // Calculate distances and sort, excluding declined riders
    let pickupLatNum = pickupLat;
    let pickupLngNum = pickupLng;

    // If no coordinates provided, try to geocode
    if (!pickupLatNum || !pickupLngNum) {
      const mapsKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
      if (mapsKey) {
        try {
          const geocodeRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(order.pickup_address)}&key=${mapsKey}`
          );
          const geocodeData = await geocodeRes.json();
          if (geocodeData.results?.[0]) {
            pickupLatNum = geocodeData.results[0].geometry.location.lat;
            pickupLngNum = geocodeData.results[0].geometry.location.lng;
          }
        } catch (e) {
          console.error('Geocoding failed:', e);
        }
      }
    }

    const ridersWithDistance = riders
      .filter(r => !declinedRiderIds.has(r.id))
      .map(rider => {
        let distance: number | null = null;
        if (pickupLatNum && pickupLngNum && rider.current_latitude && rider.current_longitude) {
          distance = calculateDistance(pickupLatNum, pickupLngNum, Number(rider.current_latitude), Number(rider.current_longitude));
        }
        return { ...rider, distance };
      })
      .sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

    if (ridersWithDistance.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'All riders have declined or are unavailable' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Pick the nearest rider
    const nearestRider = ridersWithDistance[0];

    // Create dispatch request
    const { data: dispatchRequest, error: dispatchError } = await supabase
      .from('dispatch_requests')
      .insert({
        order_id: orderId,
        rider_id: nearestRider.id,
        status: 'pending',
        distance_km: nearestRider.distance,
        expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 min expiry
      })
      .select()
      .single();

    if (dispatchError) throw new Error('Failed to create dispatch request');

    // Update order status to searching
    await supabase
      .from('orders')
      .update({ status: 'searching' })
      .eq('id', orderId);

    // Send WhatsApp notification to rider
    const apiwapKey = Deno.env.get('APIWAP_API_KEY');
    if (apiwapKey) {
      let phone = nearestRider.phone.replace(/\D/g, '');
      if (!phone.startsWith('254')) {
        phone = phone.startsWith('0') ? '254' + phone.substring(1) : '254' + phone;
      }

      const portalUrl = `${req.headers.get('origin') || 'https://id-preview--fee3472d-e340-4722-a787-2002c2469284.lovable.app'}/rider?token=${nearestRider.auth_token}`;

      const message = `🚀 *New Delivery Request*

Hi ${nearestRider.name}!

You have a new delivery request.

📦 *Order:* ${order.order_number}
📍 *Pickup:* ${order.pickup_address}
🏠 *Delivery:* ${order.delivery_address}
📏 *Distance:* ${nearestRider.distance ? nearestRider.distance.toFixed(1) + 'km' : 'Unknown'}

⏰ *Respond within 2 minutes*

✅ Accept or ❌ Decline here:
${portalUrl}`;

      try {
        await fetch('https://api.apiwap.com/api/v1/whatsapp/send-message', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiwapKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: `+${phone}`, message, type: 'text' }),
        });
      } catch (e) {
        console.error('WhatsApp notification failed:', e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      dispatchRequest,
      rider: { id: nearestRider.id, name: nearestRider.name, distance: nearestRider.distance },
      remainingRiders: ridersWithDistance.length - 1,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Auto-dispatch error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
