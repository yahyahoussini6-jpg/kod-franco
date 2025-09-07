import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestMessage {
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
  return /^\+212[5-7]\d{8}$/.test(phone);
};

const buildWhatsAppPayload = (message: TestMessage, templateName: string): WhatsAppTemplate => {
  return {
    messaging_product: "whatsapp",
    to: message.phone_e164.replace('+', ''),
    type: "template",
    template: {
      name: templateName,
      language: {
        code: message.lang === 'ar' ? 'ar' : 'fr'
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: message.first_name || 'Client'
            },
            {
              type: "text", 
              text: message.code_suivi
            },
            {
              type: "text",
              text: message.order_total.toString()
            }
          ]
        }
      ]
    }
  };
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

    const { phone_e164, first_name, code_suivi, order_total, lang } = await req.json() as TestMessage;

    if (!validateMoroccoPhone(phone_e164)) {
      throw new Error('Invalid Morocco phone number format');
    }

    const templateName = Deno.env.get('WA_TEMPLATE_NAME') || 'order_confirm';
    const waToken = Deno.env.get('WA_TOKEN');
    const waPhoneNumberId = Deno.env.get('WA_PHONE_NUMBER_ID');

    if (!waToken || !waPhoneNumberId) {
      throw new Error('Missing WhatsApp credentials');
    }

    const payload = buildWhatsAppPayload({
      phone_e164,
      first_name,
      code_suivi,
      order_total,
      lang: lang || 'fr'
    }, templateName);

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
    
    // Log the test message
    await supabase
      .from('whatsapp_logs')
      .insert({
        phone_e164: phone_e164,
        locale: lang || 'fr',
        template_name: templateName,
        direction: 'outbound',
        payload: payload,
        response_status: whatsappResponse.status,
        response_body: responseData,
        wa_message_id: responseData.messages?.[0]?.id,
        error_text: whatsappResponse.ok ? null : JSON.stringify(responseData)
      });

    if (!whatsappResponse.ok) {
      throw new Error(`WhatsApp API error: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message_id: responseData.messages?.[0]?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-test-message:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});