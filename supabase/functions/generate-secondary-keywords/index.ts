
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    const { primaryKeyword, content, count, note, userId, workspaceId } = await req.json();
    
    if (!primaryKeyword || !content) {
      return new Response(
        JSON.stringify({ error: 'Primary keyword and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${count || 5} secondary keyword suggestions for "${primaryKeyword}"`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the user is authenticated and has enough credits
    if (userId && workspaceId) {
      // Verify API key exists for this workspace
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .eq('api_type', 'openai')
        .eq('is_active', true)
        .single();
        
      if (apiKeyError) {
        console.error("Error fetching API key:", apiKeyError);
        return new Response(
          JSON.stringify({ error: 'No active OpenAI API key found for this workspace' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check credits - for real usage, verify user has enough credits
      const { data: hasEnoughCredits, error: creditsError } = await supabase.rpc(
        'check_user_has_credits',
        { user_id_param: userId, required_credits: 3 }
      );
      
      if (creditsError || !hasEnoughCredits) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Record API usage
      const { error: creditUsageError } = await supabase
        .from('credits')
        .insert({
          user_id: userId,
          workspace_id: workspaceId,
          credit_amount: 3,
          transaction_type: 'used'
        });
        
      if (creditUsageError) {
        console.error("Error recording credit usage:", creditUsageError);
      }
      
      const { error: apiUsageError } = await supabase
        .from('api_usage')
        .insert({
          user_id: userId,
          workspace_id: workspaceId,
          api_type: 'openai',
          usage_amount: 1,
          credits_consumed: 3,
          operation_type: 'generate_secondary_keywords'
        });
        
      if (apiUsageError) {
        console.error("Error recording API usage:", apiUsageError);
      }
    }
    
    // Generate secondary keyword suggestions using OpenAI
    const keywordCount = count || 5;
    
    // Clean content (remove HTML tags if present)
    const cleanContent = content.replace(/<[^>]*>/g, ' ');
    const textSample = cleanContent.slice(0, 1000); // Limit content length
    
    // Detect language (Arabic or English)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabicText = arabicRegex.test(cleanContent) || arabicRegex.test(primaryKeyword);
    
    // Prepare system prompt based on language
    const systemPrompt = hasArabicText 
      ? 'أنت مساعد مفيد يولد اقتراحات الكلمات الرئيسية الثانوية لتحسين محركات البحث.'
      : 'You are a helpful assistant that generates secondary keyword suggestions for SEO optimization.';
    
    const userPrompt = hasArabicText
      ? `بناءً على المحتوى التالي والكلمة الرئيسية "${primaryKeyword}"، اقترح ${keywordCount} كلمات رئيسية ثانوية تدعم الكلمة الرئيسية. قم بتنسيق الإخراج كمصفوفة JSON من السلاسل بدون شرح.\n\nالمحتوى: ${textSample}`
      : `Based on the following content and primary keyword "${primaryKeyword}", suggest ${keywordCount} secondary SEO keywords that support the primary keyword. Format the output as a JSON array of strings without explanation.\n\nContent: ${textSample}`;
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { "type": "json_object" }
      }),
    });

    const openaiResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.error?.message || 'Unknown error'}`);
    }

    const suggestions = JSON.parse(openaiResponse.choices[0].message.content);
    
    // Format the keywords with UUIDs
    const keywordSuggestions = suggestions.keywords.map(text => ({
      id: crypto.randomUUID(),
      text
    }));
    
    return new Response(
      JSON.stringify(keywordSuggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating secondary keywords:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
