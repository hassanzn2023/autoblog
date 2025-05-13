
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get request data
    const { userId, workspaceId, apiType, operation, credits } = await req.json();
    
    if (!userId || !workspaceId || !apiType || !operation || !credits) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    console.log(`Processing API usage tracking for user ${userId}, workspace ${workspaceId}, operation: ${operation}, credits: ${credits}`);
    
    // Check if user has enough credits
    const { data: creditsData, error: creditsError } = await supabaseClient.rpc(
      'check_user_has_credits',
      { user_id_param: userId, required_credits: credits }
    );
    
    if (creditsError) {
      console.error('Error checking credits:', creditsError);
      return new Response(
        JSON.stringify({
          error: 'Error checking credits',
          details: creditsError
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    if (!creditsData) {
      console.log('Insufficient credits for user:', userId);
      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          details: 'User does not have enough credits for this operation'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Record credit usage using service role client (bypasses RLS)
    const { error: creditUsageError } = await supabaseClient
      .from('credits')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        credit_amount: credits,
        transaction_type: 'used'
      });
      
    if (creditUsageError) {
      console.error('Error recording credit usage:', creditUsageError);
      return new Response(
        JSON.stringify({
          error: 'Error recording credit usage',
          details: creditUsageError
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    console.log(`Successfully recorded credit usage for user ${userId}`);
    
    // Record API usage using service role client (bypasses RLS)
    const { error: apiUsageError } = await supabaseClient
      .from('api_usage')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        api_type: apiType,
        usage_amount: 1,
        credits_consumed: credits,
        operation_type: operation
      });
      
    if (apiUsageError) {
      console.error('Error recording API usage:', apiUsageError);
      return new Response(
        JSON.stringify({
          error: 'Error recording API usage',
          details: apiUsageError
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    console.log(`Successfully recorded API usage for user ${userId}, operation: ${operation}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'API usage recorded successfully',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
