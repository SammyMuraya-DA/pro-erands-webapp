import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, dispatchRequestId, riderToken, latitude, longitude } = await req.json();

    // Authenticate rider by token
    if (!riderToken) throw new Error('Rider token required');

    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('*')
      .eq('auth_token', riderToken)
      .single();

    if (riderError || !rider) throw new Error('Invalid rider token');

    // Handle different actions
    if (action === 'get-profile') {
      // Get rider profile and pending dispatch requests
      const { data: pendingRequests } = await supabase
        .from('dispatch_requests')
        .select('*, orders(*)')
        .eq('rider_id', rider.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Get rider's active orders (accepted, assigned)
      const { data: activeOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('assigned_rider_id', rider.id)
        .in('status', ['assigned', 'picked_up', 'in_transit'])
        .order('created_at', { ascending: false });

      // Get completed orders
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('assigned_rider_id', rider.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({
        success: true,
        rider: { id: rider.id, name: rider.name, phone: rider.phone, status: rider.status, vehicle_type: rider.vehicle_type, rating: rider.rating, total_deliveries: rider.total_deliveries },
        pendingRequests: pendingRequests || [],
        activeOrders: activeOrders || [],
        completedOrders: completedOrders || [],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'accept') {
      if (!dispatchRequestId) throw new Error('dispatchRequestId required');

      // Get the dispatch request
      const { data: request, error: reqError } = await supabase
        .from('dispatch_requests')
        .select('*')
        .eq('id', dispatchRequestId)
        .eq('rider_id', rider.id)
        .single();

      if (reqError || !request) throw new Error('Dispatch request not found');
      if (request.status !== 'pending') throw new Error('Request already responded to');

      // Check if expired
      if (new Date(request.expires_at) < new Date()) {
        await supabase.from('dispatch_requests').update({ status: 'expired', responded_at: new Date().toISOString() }).eq('id', dispatchRequestId);
        throw new Error('Request has expired');
      }

      // Accept: update dispatch request
      await supabase.from('dispatch_requests').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', dispatchRequestId);

      // Assign rider to order
      const estimatedDelivery = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await supabase.from('orders').update({
        assigned_rider_id: rider.id,
        status: 'assigned',
        estimated_delivery_at: estimatedDelivery,
      }).eq('id', request.order_id);

      // Update rider status to busy
      await supabase.from('riders').update({ status: 'busy' }).eq('id', rider.id);

      return new Response(JSON.stringify({ success: true, message: 'Order accepted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'decline') {
      if (!dispatchRequestId) throw new Error('dispatchRequestId required');

      // Decline
      await supabase.from('dispatch_requests').update({ status: 'declined', responded_at: new Date().toISOString() }).eq('id', dispatchRequestId);

      // Get the dispatch request to find the order
      const { data: request } = await supabase
        .from('dispatch_requests')
        .select('order_id')
        .eq('id', dispatchRequestId)
        .single();

      if (request) {
        // Auto-dispatch to next nearest rider
        const origin = req.headers.get('origin') || '';
        try {
          const autoDispatchUrl = `${supabaseUrl}/functions/v1/auto-dispatch`;
          await fetch(autoDispatchUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Origin': origin,
            },
            body: JSON.stringify({ orderId: request.order_id }),
          });
        } catch (e) {
          console.error('Failed to re-dispatch:', e);
        }
      }

      return new Response(JSON.stringify({ success: true, message: 'Order declined, finding next rider...' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update-location') {
      if (latitude === undefined || longitude === undefined) throw new Error('latitude and longitude required');

      await supabase.from('riders').update({
        current_latitude: latitude,
        current_longitude: longitude,
        location_updated_at: new Date().toISOString(),
      }).eq('id', rider.id);

      return new Response(JSON.stringify({ success: true, message: 'Location updated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update-order-status') {
      const { orderId, status } = await req.json();
      if (!orderId || !status) throw new Error('orderId and status required');

      const updateData: Record<string, string> = { status };
      if (status === 'picked_up') updateData.picked_up_at = new Date().toISOString();
      if (status === 'in_transit') { /* no extra field needed */ }
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
        // Set rider back to available
        await supabase.from('riders').update({ status: 'available' }).eq('id', rider.id);
      }

      await supabase.from('orders').update(updateData).eq('id', orderId).eq('assigned_rider_id', rider.id);

      return new Response(JSON.stringify({ success: true, message: `Order status updated to ${status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'go-online' || action === 'go-offline') {
      const newStatus = action === 'go-online' ? 'available' : 'offline';
      await supabase.from('riders').update({ status: newStatus }).eq('id', rider.id);

      return new Response(JSON.stringify({ success: true, status: newStatus }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Rider respond error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error instanceof Error && message.includes('token') ? 401 : 400,
    });
  }
});
