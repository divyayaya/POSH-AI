import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    console.log('Fetching compliance deadlines with status:', status, 'limit:', limit);

    let query = supabase
      .from('compliance_deadlines')
      .select(`
        *,
        cases (
          id,
          case_number,
          title,
          status,
          priority
        )
      `)
      .eq('status', status)
      .order('deadline_date', { ascending: true })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching compliance deadlines:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetched compliance deadlines:', data?.length || 0, 'records');

    return new Response(
      JSON.stringify({ 
        success: true, 
        deadlines: data || [],
        count: data?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in compliance-deadlines function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});