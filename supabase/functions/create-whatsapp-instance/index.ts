import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, phoneNumber } = await req.json();
    
    console.log('Creating WhatsApp instance for agent:', agentId, 'phone:', phoneNumber);

    const EVOLUTION_BASE_URL = Deno.env.get('EVOLUTION_BASE_URL');
    const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!EVOLUTION_BASE_URL || !EVOLUTION_API_KEY) {
      throw new Error('Evolution API credentials not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Create instance in Evolution API
    const instanceName = `agent-${agentId}`;
    const webhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;

    // Create instance with correct payload for Evolution API v2 self-hosted
    const evolutionResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      }),
    });

    if (!evolutionResponse.ok) {
      const errorText = await evolutionResponse.text();
      console.error('Evolution API error:', errorText);
      throw new Error(`Evolution API error: ${evolutionResponse.status}`);
    }

    const evolutionData = await evolutionResponse.json();
    console.log('Evolution API response:', evolutionData);

    // Configure webhook separately after instance creation
    if (evolutionData.instance) {
      try {
        const webhookResponse = await fetch(`${EVOLUTION_BASE_URL}/webhook/set/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            url: webhookUrl,
            webhook_by_events: false,
            webhook_base64: false,
            events: [
              'APPLICATION_STARTUP',
              'QRCODE_UPDATED', 
              'CONNECTION_UPDATE',
              'MESSAGES_UPSERT',
              'MESSAGES_UPDATE',
              'SEND_MESSAGE'
            ]
          }),
        });
        
        if (webhookResponse.ok) {
          console.log('Webhook configured successfully');
        } else {
          console.warn('Failed to configure webhook:', await webhookResponse.text());
        }
      } catch (webhookError) {
        console.warn('Webhook configuration error:', webhookError);
      }
    }

    // Save connection to database
    const { data: connection, error: dbError } = await supabase
      .from('whatsapp_connections')
      .insert({
        agent_id: agentId,
        phone_number: phoneNumber,
        webhook_url: webhookUrl,
        api_key: EVOLUTION_API_KEY,
        status: 'connecting'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Update agent status (will be updated to active when connection is established)
    await supabase
      .from('agents')
      .update({ 
        whatsapp_connected: false, // Will be updated by webhook when connected
        status: 'inactive'
      })
      .eq('id', agentId);

    console.log('WhatsApp instance created successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      connection,
      qrcode: evolutionData.qrcode || evolutionData.qr,
      instanceName,
      instance: evolutionData.instance
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating WhatsApp instance:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create WhatsApp instance' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});