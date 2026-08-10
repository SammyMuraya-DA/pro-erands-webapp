 import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 }
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders })
   }
 
   try {
     const apiKey = Deno.env.get('INTASEND_API_KEY')
     const publishableKey = Deno.env.get('INTASEND_PUBLISHABLE_KEY')
     
     if (!apiKey || !publishableKey) {
       throw new Error('IntaSend API keys not configured')
     }
 
     const { phone_number, amount, plan_name, email, first_name, last_name } = await req.json()
     
     if (!phone_number || !amount) {
       throw new Error('Phone number and amount are required')
     }
 
     // Format phone number for M-Pesa (ensure 254 prefix)
     let formattedPhone = phone_number.replace(/\s+/g, '').replace(/^0/, '254').replace(/^\+/, '')
     if (!formattedPhone.startsWith('254')) {
       formattedPhone = '254' + formattedPhone
     }
 
     console.log('Initiating M-Pesa STK Push for:', { phone: formattedPhone, amount, plan_name })
 
     // IntaSend STK Push API
     const response = await fetch('https://payment.intasend.com/api/v1/payment/mpesa-stk-push/', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${apiKey}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         public_key: publishableKey,
         phone_number: formattedPhone,
         amount: amount,
         currency: 'KES',
         api_ref: `${plan_name}-${Date.now()}`,
         narrative: `Pro Errands ${plan_name} Subscription`,
         email: email || undefined,
         first_name: first_name || undefined,
         last_name: last_name || undefined,
       }),
     })
 
     const data = await response.json()
     console.log('IntaSend response:', data)
 
     if (!response.ok) {
       throw new Error(data.message || data.error || 'Payment initiation failed')
     }
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         data: {
           invoice_id: data.invoice?.invoice_id || data.id,
           state: data.invoice?.state || data.state,
           checkout_id: data.id,
         }
       }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     )
   } catch (error) {
     console.error('M-Pesa payment error:', error)
     return new Response(
     JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
       { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     )
   }
 })