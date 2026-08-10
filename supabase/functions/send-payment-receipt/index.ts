import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReceiptRequest {
  orderId: string;
  customerEmail: string;
  customerName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail, customerName }: ReceiptRequest = await req.json();

    // Validate required fields
    if (!orderId || !customerEmail) {
      throw new Error("Missing required fields: orderId and customerEmail");
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message || "Unknown error"}`);
    }

    // Format payment method
    const paymentMethodMap: Record<string, string> = {
      mpesa: "M-Pesa",
      cash: "Cash",
      card: "Credit/Debit Card",
      bank_transfer: "Bank Transfer",
    };
    const paymentMethod = paymentMethodMap[order.payment_method] || order.payment_method || "N/A";

    // Format service type
    const serviceTypeMap: Record<string, string> = {
      "same-day-delivery": "Same Day Delivery",
      "pickup-dropoff": "Pickup & Dropoff",
      "shopping": "Shopping Assistance",
      "bills": "Bill Payments",
      "corporate": "Corporate Services",
      "concierge": "Concierge",
    };
    const serviceType = serviceTypeMap[order.service_type] || order.service_type;

    // Format amount
    const amount = order.total_amount ? `KES ${order.total_amount.toLocaleString()}` : "N/A";

    // Format dates
    const paidAt = order.paid_at ? new Date(order.paid_at).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    }) : "N/A";

    const createdAt = new Date(order.created_at).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Generate receipt HTML
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${order.order_number}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Payment Receipt</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Thank you for your payment!</p>
            </td>
          </tr>

          <!-- Success Badge -->
          <tr>
            <td style="padding: 32px 32px 0; text-align: center;">
              <div style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 8px 20px; border-radius: 9999px; font-weight: 600; font-size: 14px;">
                ✓ Payment Confirmed
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 24px; border-bottom: 1px solid #e4e4e7;">
                    <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                    <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: 600; font-family: monospace;">${order.order_number}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="vertical-align: top;">
                          <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Service Type</p>
                          <p style="margin: 0; color: #18181b; font-size: 14px;">${serviceType}</p>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                          <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</p>
                          <p style="margin: 0; color: #18181b; font-size: 14px;">${paymentMethod}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 0; border-top: 1px solid #e4e4e7; border-bottom: 1px solid #e4e4e7;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Pickup Address</p>
                          <p style="margin: 0; color: #18181b; font-size: 14px;">${order.pickup_address}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px;">
                          <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</p>
                          <p style="margin: 0; color: #18181b; font-size: 14px;">${order.delivery_address}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${order.package_description ? `
                <tr>
                  <td style="padding: 24px 0; border-bottom: 1px solid #e4e4e7;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Package Description</p>
                    <p style="margin: 0; color: #18181b; font-size: 14px;">${order.package_description}</p>
                  </td>
                </tr>
                ` : ""}

                <!-- Amount -->
                <tr>
                  <td style="padding: 24px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; padding: 16px;">
                      <tr>
                        <td style="padding: 16px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <p style="margin: 0; color: #92400e; font-size: 14px;">Total Amount Paid</p>
                              </td>
                              <td style="text-align: right;">
                                <p style="margin: 0; color: #92400e; font-size: 24px; font-weight: 700;">${amount}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Timestamps -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
                          <p style="margin: 0; color: #18181b; font-size: 13px;">${createdAt}</p>
                        </td>
                        <td width="50%">
                          <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Date</p>
                          <p style="margin: 0; color: #18181b; font-size: 13px;">${paidAt}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${order.payment_reference ? `
                <tr>
                  <td style="padding-top: 16px;">
                    <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Reference</p>
                    <p style="margin: 0; color: #18181b; font-size: 13px; font-family: monospace;">${order.payment_reference}</p>
                  </td>
                </tr>
                ` : ""}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                Questions about your order? Contact us anytime.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                PikiExpress Delivery Services<br>
                Nairobi, Kenya
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "PikiExpress <noreply@resend.dev>",
      to: [customerEmail],
      subject: `Payment Receipt - Order ${order.order_number}`,
      html: receiptHtml,
    });

    console.log("Payment receipt email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment receipt sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-payment-receipt function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
