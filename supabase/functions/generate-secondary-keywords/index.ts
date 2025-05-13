
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
  
  try {
    const { primaryKeyword, content, apiKey, count, notes, userId, workspaceId } = await req.json();
    
    // Validate required fields
    if (!primaryKeyword) {
      console.error("Primary keyword is required but was not provided");
      return new Response(
        JSON.stringify({ error: 'Primary keyword is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!content) {
      console.error("Content is required but was not provided");
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${count || 5} secondary keywords for primary keyword: ${primaryKeyword}`);
    console.log(`Content sample: ${content.substring(0, 100)}...`);
    
    const usedApiKey = apiKey || OPENAI_API_KEY;
    
    if (!usedApiKey) {
      console.error("OpenAI API key is required but was not provided");
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Record usage metrics if userId and workspaceId provided
    if (userId && workspaceId) {
      console.log(`User ID: ${userId}`);
      console.log(`Workspace ID: ${workspaceId}`);
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        try {
          // Record API usage
          const { error: apiUsageError } = await supabase
            .from('api_usage')
            .insert({
              user_id: userId,
              workspace_id: workspaceId,
              api_type: 'openai',
              usage_amount: 1,
              credits_consumed: 1,
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
      }
    }
    
    // Clean content (remove HTML tags if present)
    const cleanContent = content.replace(/<[^>]*>/g, ' ');
    const textSample = cleanContent.slice(0, 1000); // Limit content length
    
    // Detect language (Arabic or English)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabicText = arabicRegex.test(cleanContent) || arabicRegex.test(primaryKeyword);
    
    console.log(`Content language: ${hasArabicText ? 'Arabic' : 'English'}`);
    
    // Prepare system prompt based on language
    const systemPrompt = hasArabicText 
      ? 'أنت مساعد متخصص في تحليل المحتوى واستخراج الكلمات المفتاحية الثانوية المتعلقة بكلمة مفتاحية رئيسية.'
      : 'You are a specialized assistant in content analysis and extracting secondary keywords related to a primary keyword.';
    
    // Add notes to the prompt if provided
    let userPrompt = hasArabicText
      ? `الكلمة المفتاحية الرئيسية هي: "${primaryKeyword}". استخرج ${count || 5} كلمات مفتاحية ثانوية متعلقة بهذه الكلمة الرئيسية من المحتوى التالي واعرضها فقط كمصفوفة JSON تحت اسم "keywords" دون أي تعليقات أو توضيحات إضافية:\n\n${textSample}`
      : `Primary keyword: "${primaryKeyword}". Extract ${count || 5} secondary keywords related to this primary keyword from the following content and return them only as a JSON array named "keywords" without any additional comments or explanations:\n\n${textSample}`;
      
    if (notes) {
      userPrompt += hasArabicText
        ? `\n\nملاحظات إضافية: ${notes}`
        : `\n\nAdditional notes: ${notes}`;
    }
    
    console.log("Calling OpenAI API...");
    
    // Call OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${usedApiKey}`,
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
      
      console.log("Returning secondary keyword suggestions:", keywordSuggestions);
      
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
