
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
    console.error("OPENAI_API_KEY environment variable is not set");
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    const { primaryKeyword, content, count, note, userId, workspaceId } = await req.json();
    
    if (!primaryKeyword || !content) {
      console.error("Primary keyword and content are required but were not provided");
      return new Response(
        JSON.stringify({ error: 'Primary keyword and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${count || 5} secondary keyword suggestions for "${primaryKeyword}"`);
    console.log(`User ID: ${userId ? userId : 'Not provided'}`);
    console.log(`Workspace ID: ${workspaceId ? workspaceId : 'Not provided'}`);
    console.log(`Content sample: ${content.substring(0, 100)}...`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase environment variables not configured");
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
        console.error("Will attempt to use system API key instead");
      } else {
        console.log("User API key found");
      }
      
      // Check credits - verify user has enough credits
      const { data: hasEnoughCredits, error: creditsError } = await supabase.rpc(
        'check_user_has_credits',
        { user_id_param: userId, required_credits: 3 }
      );
      
      if (creditsError) {
        console.error("Error checking credits:", creditsError);
      }
      
      if (!hasEnoughCredits && !creditsError) {
        console.error("User doesn't have enough credits");
        return new Response(
          JSON.stringify({ error: 'Insufficient credits' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Record API usage even with system API key
      try {
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
        } else {
          console.log("Credit usage recorded successfully");
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
        } else {
          console.log("API usage recorded successfully");
        }
      } catch (error) {
        console.error("Error recording usage:", error);
      }
    } else {
      console.log("User not authenticated or no workspace ID provided");
    }
    
    // Generate secondary keyword suggestions using OpenAI
    const keywordCount = count || 5;
    
    // Clean content (remove HTML tags if present)
    const cleanContent = content.replace(/<[^>]*>/g, ' ');
    const textSample = cleanContent.slice(0, 1000); // Limit content length
    
    // Detect language (Arabic or English)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabicText = arabicRegex.test(cleanContent) || arabicRegex.test(primaryKeyword);
    
    console.log(`Content language: ${hasArabicText ? 'Arabic' : 'English'}`);
    console.log(`Primary keyword: ${primaryKeyword}`);
    
    // Prepare system prompt based on language
    const systemPrompt = hasArabicText 
      ? 'أنت مساعد متخصص في تحليل المحتوى واستخراج الكلمات المفتاحية الثانوية المرتبطة بكلمة مفتاحية رئيسية. مهمتك هي تحديد كلمات مفتاحية ثانوية مرتبطة بالكلمة المفتاحية الرئيسية بناءً على المحتوى المقدم.'
      : 'You are a specialized assistant in content analysis and extraction of secondary keywords related to a primary keyword. Your task is to identify secondary keywords related to the primary keyword based on the provided content.';
    
    const userPrompt = hasArabicText
      ? `بناءً على المحتوى التالي والكلمة المفتاحية الرئيسية "${primaryKeyword}"، استخرج ${keywordCount} كلمات مفتاحية ثانوية مرتبطة. قم بعرضها فقط كمصفوفة JSON تحت اسم "keywords" دون أي تعليقات أو توضيحات إضافية.\n\nالمحتوى: ${textSample}`
      : `Based on the following content and primary keyword "${primaryKeyword}", extract ${keywordCount} related secondary keywords. Return them only as a JSON array named "keywords" without any additional comments or explanations.\n\nContent: ${textSample}`;
    
    console.log("Calling OpenAI API...");
    
    // Call OpenAI API
    try {
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
          max_tokens: 500,
          response_format: { "type": "json_object" }
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API response not OK:", response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
        } catch (parseError) {
          throw new Error(`OpenAI API error: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      }
  
      const openaiResponse = await response.json();
      console.log("OpenAI API response received");
      
      if (!openaiResponse.choices || !openaiResponse.choices[0] || !openaiResponse.choices[0].message || !openaiResponse.choices[0].message.content) {
        console.error("Unexpected OpenAI API response format:", JSON.stringify(openaiResponse));
        throw new Error("Unexpected OpenAI API response format");
      }
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(openaiResponse.choices[0].message.content);
        console.log("Parsed keywords:", parsedContent);
        
        if (!parsedContent.keywords || !Array.isArray(parsedContent.keywords)) {
          console.error("No keywords array in parsed content:", parsedContent);
          throw new Error("No keywords array in response");
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        console.error("Raw content:", openaiResponse.choices[0].message.content);
        throw new Error("Failed to parse OpenAI response as JSON");
      }
      
      // Format the keywords with UUIDs
      const keywordSuggestions = parsedContent.keywords.map(text => ({
        id: crypto.randomUUID(),
        text
      }));
      
      console.log("Returning keyword suggestions:", keywordSuggestions);
      
      return new Response(
        JSON.stringify(keywordSuggestions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openaiError) {
      console.error("OpenAI API call failed:", openaiError);
      throw openaiError;
    }
  } catch (error) {
    console.error("Error generating secondary keywords:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
