import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface NotificationRequest {
  riderId: string;
  orderNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('APIWAP_API_KEY')
    if (!apiKey) {
      throw new Error('APIWAP_API_KEY not configured')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { riderId, orderNumber, pickupAddress, deliveryAddress }: NotificationRequest = await req.json()

    if (!riderId || !orderNumber) {
      throw new Error('Missing required fields: riderId and orderNumber')
    }

    // Get rider details
    const { data: rider, error: riderError } = await supabase
      .from('riders')
      .select('name, phone')
      .eq('id', riderId)
      .single()

    if (riderError || !rider) {
      throw new Error('Rider not found')
    }

    // Format phone number (ensure it has country code)
    let phone = rider.phone.replace(/\D/g, '')
    if (!phone.startsWith('254')) {
      // Add Kenya country code if not present
      if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1)
      } else {
        phone = '254' + phone
      }
    }

    // Compose WhatsApp message
    const message = `🚀 *New Order Assignment*

Hi ${rider.name}!

You have been assigned a new delivery order.

📦 *Order:* ${orderNumber}
📍 *Pickup:* ${pickupAddress}
🏠 *Delivery:* ${deliveryAddress}

Please proceed to the pickup location as soon as possible.

Thank you! 🙏`

    // Send WhatsApp message via APIWAP
    // API docs: https://docs.apiwap.com/messaging/textmsg
    // Base URL: https://api.apiwap.com/api/v1
    const apiwapResponse = await fetch('https://api.apiwap.com/api/v1/whatsapp/send-message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: `+${phone}`,
        message: message,
        type: 'text',
      }),
    })

    const apiwapResult = await apiwapResponse.json()

    if (!apiwapResponse.ok) {
      console.error('APIWAP error:', apiwapResult)
      throw new Error(`WhatsApp notification failed: ${JSON.stringify(apiwapResult)}`)
    }

    console.log('WhatsApp notification sent successfully:', apiwapResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        rider: rider.name 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Notification error:', message)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
