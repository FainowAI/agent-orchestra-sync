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
    const webhook = await req.json();
    console.log('WhatsApp webhook received:', JSON.stringify(webhook, null, 2));

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OrchestraOpenAiAPIKey');

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Extract instance name from webhook
    const instanceName = webhook.instance;
    if (!instanceName) {
      console.log('No instance name in webhook, ignoring...');
      return new Response('OK', { headers: corsHeaders });
    }

    // Extract agent ID from instance name (format: agent-{agentId})
    const agentId = instanceName.replace('agent-', '');

    // Handle different webhook events
    if (webhook.event === 'messages.upsert') {
      await handleIncomingMessage(supabase, agentId, webhook.data);
    } else if (webhook.event === 'connection.update') {
      await handleConnectionUpdate(supabase, instanceName, webhook.data);
    } else if (webhook.event === 'qrcode.updated') {
      console.log('QR Code updated for instance:', instanceName);
    }

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return new Response('Error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

async function handleIncomingMessage(supabase: any, agentId: string, messageData: any) {
  console.log('Processing incoming message for agent:', agentId);

  try {
    // Get agent configuration
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('status', 'active')
      .single();

    if (agentError || !agent) {
      console.log('Agent not found or not active:', agentId);
      return;
    }

    // Extract message info
    const message = messageData.messages?.[0];
    if (!message || message.messageStubType || message.fromMe) {
      console.log('Ignoring message (stub, from me, or no message)');
      return;
    }

    const contactId = message.key.remoteJid;
    const messageText = message.message?.conversation || 
                      message.message?.extendedTextMessage?.text || '';

    if (!messageText.trim()) {
      console.log('No text content in message');
      return;
    }

    console.log('Processing message from:', contactId, 'Text:', messageText);

    // Generate AI response
    const aiResponse = await generateAIResponse(agent.configuration, messageText);

    if (aiResponse) {
      // Send response back via Evolution API
      await sendWhatsAppMessage(agentId, contactId, aiResponse);
      
      // Log conversation
      await logConversation(supabase, agentId, contactId, messageText, aiResponse);
    }

  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

async function generateAIResponse(agentConfig: any, messageText: string): Promise<string | null> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OrchestraOpenAiAPIKey');
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return null;
    }

    const model = agentConfig?.model || 'gpt-4o-mini';
    const systemPrompt = agentConfig?.systemPrompt || 'Você é um assistente virtual prestativo.';
    const temperature = agentConfig?.temperature || 0.7;
    const maxTokens = agentConfig?.maxTokens || 1000;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageText }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error generating AI response:', error);
    return null;
  }
}

async function sendWhatsAppMessage(agentId: string, contactId: string, message: string) {
  try {
    const EVOLUTION_BASE_URL = Deno.env.get('EVOLUTION_BASE_URL');
    const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');
    
    const instanceName = `agent-${agentId}`;

    const response = await fetch(`${EVOLUTION_BASE_URL}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY!,
      },
      body: JSON.stringify({
        number: contactId,
        text: message,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', response.status);
    } else {
      console.log('WhatsApp message sent successfully');
    }

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

async function logConversation(supabase: any, agentId: string, contactId: string, userMessage: string, aiResponse: string) {
  try {
    // Update or create conversation record
    const { error } = await supabase
      .from('agent_conversations')
      .upsert({
        agent_id: agentId,
        contact_id: contactId,
        platform: 'whatsapp',
        last_message: aiResponse,
        message_count: 1, // This would be incremented in a real implementation
      }, {
        onConflict: 'agent_id,contact_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error logging conversation:', error);
    }

  } catch (error) {
    console.error('Error logging conversation:', error);
  }
}

async function handleConnectionUpdate(supabase: any, instanceName: string, connectionData: any) {
  console.log('Connection update for:', instanceName, connectionData);

  try {
    const agentId = instanceName.replace('agent-', '');
    const isConnected = connectionData.state === 'open';

    // Update connection status in database
    await supabase
      .from('whatsapp_connections')
      .update({ 
        status: isConnected ? 'connected' : 'disconnected' 
      })
      .eq('agent_id', agentId);

    // Update agent status
    await supabase
      .from('agents')
      .update({ 
        whatsapp_connected: isConnected 
      })
      .eq('id', agentId);

  } catch (error) {
    console.error('Error handling connection update:', error);
  }
}