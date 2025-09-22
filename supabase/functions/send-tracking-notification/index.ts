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
  client_phone: string;
  client_nom: string;
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
  return /^\+212[5-7]\d{8}$/.test(phone);
};

const normalizePhone = (phone: string): string => {
  let normalized = phone.replace(/\s+/g, '');
  if (normalized.startsWith('0')) {
    normalized = '+212' + normalized.substring(1);
  } else if (!normalized.startsWith('+')) {
    normalized = '+212' + normalized;
  }
  return normalized;
};

const buildTrackingPayload = (order: Order, templateName: string): WhatsAppTemplate => {
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

    const { order_id } = await req.json();

    if (!order_id) {
      throw new Error('Order ID is required');
    }

    console.log(`Processing tracking notification for order: ${order_id}`);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, phone_e164, first_name, code_suivi, client_phone, client_nom, lang')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message || 'Unknown error'}`);
    }

    // Normalize phone number
    let phone_e164 = order.phone_e164;
    if (!phone_e164 && order.client_phone) {
      phone_e164 = normalizePhone(order.client_phone);
    }

    if (!phone_e164 || !validateMoroccoPhone(phone_e164)) {
      console.log(`Invalid phone number for order ${order_id}: ${phone_e164}`);
      await logToWhatsApp(supabase, {
        order_id: order.id,
        phone_e164: phone_e164,
        locale: order.lang || 'fr',
        template_name: 'tracking_notification',
        direction: 'outbound',
        error_text: 'Invalid phone number format',
        response_status: 0
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid phone number' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const first_name = order.first_name || order.client_nom?.split(' ')[0] || 'Client';

    const orderData: Order = {
      id: order.id,
      phone_e164,
      first_name,
      code_suivi: order.code_suivi,
      client_phone: order.client_phone,
      client_nom: order.client_nom,
      lang: order.lang || 'fr'
    };

    const waToken = Deno.env.get('WA_TOKEN');
    const waPhoneNumberId = Deno.env.get('WA_PHONE_NUMBER_ID');
    const templateName = 'tracking_notification';

    if (!waToken || !waPhoneNumberId) {
      console.log('Missing WhatsApp credentials');
      await logToWhatsApp(supabase, {
        order_id: order.id,
        phone_e164: orderData.phone_e164,
        locale: orderData.lang,
        template_name: templateName,
        direction: 'outbound',
        error_text: 'Missing WhatsApp credentials',
        response_status: 0
      });

      return new Response(JSON.stringify({ 
        success: false, 
        error: 'WhatsApp credentials not configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = buildTrackingPayload(orderData, templateName);

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
        // Update order with normalized phone
        await supabase
          .from('orders')
          .update({
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

        console.log(`Sent tracking code to ${orderData.phone_e164} for order ${order.id}`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          message_id: responseData.messages?.[0]?.id 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error(`WhatsApp API error: ${JSON.stringify(responseData)}`);
      }
    } catch (error) {
      console.error(`Failed to send tracking notification:`, error);
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

      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in send-tracking-notification:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});