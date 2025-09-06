import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Order {
  id: string;
  phone_e164: string;
  first_name: string;
  code_suivi: string;
  order_total: number;
  lang: string;
}

interface WhatsAppTemplate {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: {
    name: string;
    language: {
      code: string;
    };
    components: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

const validateMoroccoPhone = (phone: string): boolean => {
  // Accept +212[5-7]xxxxxxxx format
  return /^\+212[5-7]\d{8}$/.test(phone);
};

const buildWhatsAppPayload = (order: Order, templateName: string): WhatsAppTemplate => {
  return {
    messaging_product: "whatsapp",
    to: order.phone_e164.replace('+', ''),
    type: "template",
    template: {
      name: templateName,
      language: {
        code: order.lang === 'ar' ? 'ar' : 'fr'
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: order.first_name || 'Client'
            },
            {
              type: "text", 
              text: order.code_suivi
            },
            {
              type: "text",
              text: order.order_total.toString()
            }
          ]
        }
      ]
    }
  };
};

const logToWhatsApp = async (supabase: any, data: any) => {
  const { error } = await supabase
    .from('whatsapp_logs')
    .insert(data);
    
  if (error) {
    console.error('Failed to log to whatsapp_logs:', error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if auto-confirm is enabled
    const autoConfirmEnabled = Deno.env.get('AUTO_CONFIRM_ENABLED') === 'true';
    if (!autoConfirmEnabled) {
      console.log('Auto-confirm disabled, skipping');
      return new Response(JSON.stringify({ 
        message: 'Auto-confirm disabled',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const delayMinutes = parseInt(Deno.env.get('DELAY_MINUTES') || '120');
    const templateName = Deno.env.get('WA_TEMPLATE_NAME') || 'order_confirm';
    const isDryRun = Deno.env.get('DRY_RUN') === 'true';
    const waToken = Deno.env.get('WA_TOKEN');
    const waPhoneNumberId = Deno.env.get('WA_PHONE_NUMBER_ID');

    console.log(`Processing orders with ${delayMinutes} minute delay, dry run: ${isDryRun}`);

    // Calculate cutoff time
    const cutoffTime = new Date(Date.now() - delayMinutes * 60 * 1000).toISOString();

    // Get due orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, phone_e164, first_name, code_suivi, order_total, lang, client_nom, client_phone')
      .eq('status', 'nouvelle')
      .eq('whatsapp_confirm_sent', false)
      .lte('created_at', cutoffTime)
      .limit(200);

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    console.log(`Found ${orders?.length || 0} orders due for confirmation`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0
    };

    for (const order of orders || []) {
      results.processed++;

      // Ensure we have phone_e164, fallback to client_phone if needed
      let phone_e164 = order.phone_e164;
      if (!phone_e164 && order.client_phone) {
        // Try to convert client_phone to E.164 format
        let phone = order.client_phone.replace(/\s+/g, '');
        if (phone.startsWith('0')) {
          phone = '+212' + phone.substring(1);
        } else if (!phone.startsWith('+')) {
          phone = '+212' + phone;
        }
        phone_e164 = phone;
      }

      // Ensure first_name, fallback to client_nom
      const first_name = order.first_name || order.client_nom?.split(' ')[0] || 'Client';

      if (!phone_e164 || !validateMoroccoPhone(phone_e164)) {
        console.log(`Skipping order ${order.id}: invalid phone ${phone_e164}`);
        await logToWhatsApp(supabase, {
          order_id: order.id,
          phone_e164: phone_e164,
          locale: order.lang || 'fr',
          template_name: templateName,
          direction: 'outbound',
          error_text: 'Invalid phone number format',
          response_status: 0
        });
        results.skipped++;
        continue;
      }

      const orderData: Order = {
        id: order.id,
        phone_e164,
        first_name,
        code_suivi: order.code_suivi,
        order_total: order.order_total,
        lang: order.lang || 'fr'
      };

      const payload = buildWhatsAppPayload(orderData, templateName);

      if (isDryRun) {
        console.log('DRY RUN - Would send:', JSON.stringify(payload, null, 2));
        await logToWhatsApp(supabase, {
          order_id: order.id,
          phone_e164: orderData.phone_e164,
          locale: orderData.lang,
          template_name: templateName,
          direction: 'outbound',
          payload: payload,
          response_status: 200,
          wa_message_id: 'dry_run_' + Date.now()
        });
        results.sent++;
        continue;
      }

      if (!waToken || !waPhoneNumberId) {
        console.log('Missing WhatsApp credentials, skipping actual send');
        await logToWhatsApp(supabase, {
          order_id: order.id,
          phone_e164: orderData.phone_e164,
          locale: orderData.lang,
          template_name: templateName,
          direction: 'outbound',
          error_text: 'Missing WhatsApp credentials'
        });
        results.failed++;
        continue;
      }

      try {
        // Send WhatsApp message
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/v20.0/${waPhoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${waToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }
        );

        const responseData = await whatsappResponse.json();
        
        if (whatsappResponse.ok) {
          // Update order
          await supabase
            .from('orders')
            .update({
              whatsapp_confirm_sent: true,
              whatsapp_confirm_at: new Date().toISOString(),
              phone_e164: orderData.phone_e164,
              first_name: orderData.first_name
            })
            .eq('id', order.id);

          // Log success
          await logToWhatsApp(supabase, {
            order_id: order.id,
            phone_e164: orderData.phone_e164,
            locale: orderData.lang,
            template_name: templateName,
            direction: 'outbound',
            payload: payload,
            response_status: whatsappResponse.status,
            response_body: responseData,
            wa_message_id: responseData.messages?.[0]?.id
          });

          results.sent++;
          console.log(`Sent confirmation to ${orderData.phone_e164} for order ${order.id}`);
        } else {
          throw new Error(`WhatsApp API error: ${JSON.stringify(responseData)}`);
        }
      } catch (error) {
        console.error(`Failed to send to ${orderData.phone_e164}:`, error);
        await logToWhatsApp(supabase, {
          order_id: order.id,
          phone_e164: orderData.phone_e164,
          locale: orderData.lang,
          template_name: templateName,
          direction: 'outbound',
          payload: payload,
          error_text: error.message,
          response_status: 0
        });
        results.failed++;
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Processing complete:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-order-confirm:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});