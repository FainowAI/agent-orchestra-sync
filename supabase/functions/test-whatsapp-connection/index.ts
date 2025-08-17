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
    const { connectionId } = await req.json();
    
    console.log('Testing WhatsApp connection:', connectionId);

    const EVOLUTION_BASE_URL = Deno.env.get('EVOLUTION_BASE_URL');
    const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!EVOLUTION_BASE_URL || !EVOLUTION_API_KEY) {
      throw new Error('Evolution API credentials not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get connection details from database
    const { data: connection, error: dbError } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (dbError || !connection) {
      throw new Error('WhatsApp connection not found');
    }

    // Get instance name from agent ID
    const instanceName = `agent-${connection.agent_id}`;

    // Test connection with Evolution API
    const evolutionResponse = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
    });

    if (!evolutionResponse.ok) {
      const errorText = await evolutionResponse.text();
      console.error('Evolution API error:', errorText);
      throw new Error(`Evolution API error: ${evolutionResponse.status}`);
    }

    const evolutionData = await evolutionResponse.json();
    console.log('Evolution connection status:', evolutionData);

    // Update connection status in database
    const isConnected = evolutionData.instance?.state === 'open';
    const newStatus = isConnected ? 'connected' : 'error';

    await supabase
      .from('whatsapp_connections')
      .update({ status: newStatus })
      .eq('id', connectionId);

    console.log('WhatsApp connection test completed');

    return new Response(JSON.stringify({ 
      success: true, 
      connected: isConnected,
      status: evolutionData.instance?.state,
      details: evolutionData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error testing WhatsApp connection:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to test WhatsApp connection' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});