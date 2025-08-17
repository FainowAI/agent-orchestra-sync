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
    
    console.log('Testing Google Calendar connection:', connectionId);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get connection details from database
    const { data: connection, error: dbError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (dbError || !connection) {
      throw new Error('Calendar connection not found');
    }

    if (!connection.access_token) {
      throw new Error('Calendar not properly configured - missing access token');
    }

    // Test connection with Google Calendar API
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!calendarResponse.ok) {
      // Try to refresh token if access token expired
      if (calendarResponse.status === 401 && connection.refresh_token) {
        console.log('Access token expired, attempting to refresh...');
        
        const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
        const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
            refresh_token: connection.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          // Update access token in database
          await supabase
            .from('calendar_connections')
            .update({ 
              access_token: refreshData.access_token,
              status: 'connected'
            })
            .eq('id', connectionId);

          console.log('Token refreshed successfully');
          
          return new Response(JSON.stringify({ 
            success: true, 
            connected: true,
            message: 'Token refreshed successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          throw new Error('Failed to refresh access token');
        }
      } else {
        const errorText = await calendarResponse.text();
        console.error('Google Calendar API error:', errorText);
        throw new Error(`Google Calendar API error: ${calendarResponse.status}`);
      }
    }

    const calendarData = await calendarResponse.json();
    console.log('Google Calendar connection test successful');

    // Update connection status in database
    await supabase
      .from('calendar_connections')
      .update({ status: 'connected' })
      .eq('id', connectionId);

    return new Response(JSON.stringify({ 
      success: true, 
      connected: true,
      calendarInfo: {
        id: calendarData.id,
        summary: calendarData.summary,
        timeZone: calendarData.timeZone
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error testing Google Calendar connection:', error);
    
    // Update connection status to error
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { connectionId } = await req.json();
    await supabase
      .from('calendar_connections')
      .update({ status: 'error' })
      .eq('id', connectionId);

    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to test Google Calendar connection' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});