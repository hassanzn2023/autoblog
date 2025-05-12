
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
    const { content, count, note, userId, workspaceId } = await req.json();
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${count || 3} keyword suggestions`);
    console.log(`User ID: ${userId ? userId : 'Not provided'}`);
    console.log(`Workspace ID: ${workspaceId ? workspaceId : 'Not provided'}`);
    
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
      }
      
      // Check credits - for real usage, verify user has enough credits
      const { data: hasEnoughCredits, error: creditsError } = await supabase.rpc(
        'check_user_has_credits',
        { user_id_param: userId, required_credits: 5 }
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
            credit_amount: 5,
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
            credits_consumed: 5,
            operation_type: 'generate_keywords'
          });
          
        if (apiUsageError) {
          console.error("Error recording API usage:", apiUsageError);
        }
      } catch (error) {
        console.error("Error recording usage:", error);
      }
    } else {
      console.log("User not authenticated or no workspace ID provided");
    }
    
    // Generate keyword suggestions using OpenAI
    const keywordCount = count || 3;
    
    // Clean content (remove HTML tags if present)
    const cleanContent = content.replace(/<[^>]*>/g, ' ');
    const textSample = cleanContent.slice(0, 1000); // Limit content length
    
    // Detect language (Arabic or English)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabicText = arabicRegex.test(cleanContent);
    
    console.log(`Content language: ${hasArabicText ? 'Arabic' : 'English'}`);
    console.log(`Content sample: ${textSample.substring(0, 100)}...`);
    
    // Prepare system prompt based on language
    const systemPrompt = hasArabicText 
      ? 'أنت مساعد مفيد متخصص في تحليل المحتوى واستخراج الكلمات المفتاحية المهمة منه. استخرج الكلمات المفتاحية الرئيسية من المحتوى المقدم فقط، وليس من أي مصدر آخر. تجنب إعطاء كلمات مفتاحية عامة أو غير مرتبطة بالمحتوى المحدد.'
      : 'You are a helpful assistant specialized in content analysis and keyword extraction. Extract the primary keywords directly from the provided content only, not from any other source. Avoid giving generic or unrelated keywords.';
    
    const userPrompt = hasArabicText
      ? `بناءً على المحتوى التالي فقط، استخرج ${keywordCount} كلمات رئيسية محددة ومرتبطة بالمحتوى مباشرة. قم بتنسيق الإخراج كمصفوفة JSON تحت اسم "keywords" فقط بدون أي شرح إضافي.\n\nالمحتوى: ${textSample}`
      : `Based only on the following content, extract ${keywordCount} specific keywords that are directly relevant to the content. Format the output as a JSON array named "keywords" with no additional explanation.\n\nContent: ${textSample}`;
    
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
          max_tokens: 200,
          response_format: { "type": "json_object" }
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
      }
  
      const openaiResponse = await response.json();
      console.log("OpenAI API response received");
      
      if (!openaiResponse.choices || !openaiResponse.choices[0] || !openaiResponse.choices[0].message || !openaiResponse.choices[0].message.content) {
        console.error("Unexpected OpenAI API response format:", openaiResponse);
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
    console.error("Error generating keywords:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
