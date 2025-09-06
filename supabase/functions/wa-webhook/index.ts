import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const normalizePhone = (phone: string): string => {
  // Convert phone to E.164 format
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('212')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+212' + cleaned.substring(1);
  }
  return '+212' + cleaned;
};

const processInboundMessage = async (supabase: any, entry: any) => {
  try {
    const changes = entry.changes;
    if (!changes || changes.length === 0) return;

    for (const change of changes) {
      if (change.field !== 'messages') continue;

      const value = change.value;
      if (!value.messages || value.messages.length === 0) continue;

      for (const message of value.messages) {
        const fromPhone = message.from;
        const phoneE164 = normalizePhone(fromPhone);
        
        let responseText = '';
        let action = '';

        // Check for interactive button responses
        if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
          const buttonId = message.interactive.button_reply.id;
          if (buttonId === 'confirm_order') {
            action = 'confirm';
            responseText = 'confirmer';
          } else if (buttonId === 'cancel_order') {
            action = 'cancel';
            responseText = 'annuler';
          }
        }
        // Check for text messages
        else if (message.type === 'text') {
          responseText = message.text.body.toLowerCase().trim();
          if (responseText.includes('confirmer') || responseText === '1') {
            action = 'confirm';
          } else if (responseText.includes('annuler') || responseText === '2') {
            action = 'cancel';
          }
        }

        // Log the inbound message
        await supabase
          .from('whatsapp_logs')
          .insert({
            phone_e164: phoneE164,
            direction: 'inbound',
            payload: message,
            wa_message_id: message.id,
            response_status: 200
          });

        if (action) {
          // Find the most recent NEW order for this phone
          const { data: orders, error } = await supabase
            .from('orders')
            .select('id, code_suivi, status')
            .or(`phone_e164.eq.${phoneE164},client_phone.eq.${fromPhone}`)
            .eq('status', 'nouvelle')
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) {
            console.error('Error finding order:', error);
            continue;
          }

          if (orders && orders.length > 0) {
            const order = orders[0];
            const newStatus = action === 'confirm' ? 'confirmee' : 'annulee';
            
            // Update order status
            const { error: updateError } = await supabase
              .from('orders')
              .update({ 
                status: newStatus,
                confirmed_at: action === 'confirm' ? new Date().toISOString() : null,
                canceled_at: action === 'cancel' ? new Date().toISOString() : null
              })
              .eq('id', order.id);

            if (updateError) {
              console.error('Error updating order status:', updateError);
            } else {
              console.log(`Updated order ${order.code_suivi} to ${newStatus} for phone ${phoneE164}`);
            }
          } else {
            console.log(`No NEW order found for phone ${phoneE164}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing inbound message:', error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  // Handle webhook verification (GET request)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const challenge = url.searchParams.get('hub.challenge');
    const token = url.searchParams.get('hub.verify_token');
    
    const verifyToken = Deno.env.get('WA_VERIFY_TOKEN');
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified');
      return new Response(challenge, {
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      console.log('Webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  }

  // Handle incoming messages (POST request)
  if (req.method === 'POST') {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const body = await req.json();
      console.log('Received webhook:', JSON.stringify(body, null, 2));

      // Process each entry in the webhook
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          await processInboundMessage(supabase, entry);
        }
      }

      return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });

    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }

  return new Response('Method Not Allowed', { 
    status: 405,
    headers: { 'Content-Type': 'text/plain' }
  });
});