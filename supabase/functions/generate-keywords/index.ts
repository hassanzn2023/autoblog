// Предполагаемое имя файла: supabase/functions/generate-keywords/index.ts
// أو أي مسار تستخدمه لـ Deno Edge Function الخاصة بـ generate-keywords

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    const { content, count, note, userId, workspaceId } = await req.json();

    if (!content) {
      console.error("Content is required but was not provided");
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const regenerationNote = (typeof note === 'string' && note.trim() !== '') ? note.trim() : null;


    console.log(`Generating ${count || 3} primary keyword suggestions.`);
    if (regenerationNote) {
      console.log(`With regeneration note: "${regenerationNote}"`);
    }
    console.log(`User ID: ${userId ? userId : 'Not provided'}`);
    console.log(`Workspace ID: ${workspaceId ? workspaceId : 'Not provided'}`);
    console.log(`Content sample: ${content.substring(0, 100)}...`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase environment variables not configured");
      throw new Error('Supabase environment variables not configured');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (userId && workspaceId) {
      // ... (كود التحقق من الاعتمادات وتسجيل الاستخدام يبقى كما هو - 5 اعتمادات)
      const required_credits = 5;
      const { data: hasEnoughCredits, error: creditsError } = await supabase.rpc(
        'check_user_has_credits',
        { user_id_param: userId, required_credits: required_credits }
      );
      // ... (بقية كود الاعتمادات)
       if (creditsError || !hasEnoughCredits) {
        // ... (معالجة خطأ الاعتمادات)
         return new Response(
          JSON.stringify({ error: creditsError?.message || 'Insufficient credits' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Record API usage
      try {
        await supabase.from('credits').insert({
            user_id: userId,
            workspace_id: workspaceId,
            credit_amount: required_credits,
            transaction_type: 'used'
        });
        await supabase.from('api_usage').insert({
            user_id: userId,
            workspace_id: workspaceId,
            api_type: 'openai',
            usage_amount: 1,
            credits_consumed: required_credits,
            operation_type: 'generate_keywords' //  أو 'generate_primary_keywords'
        });
      } catch (usageError) {
        console.error("Error recording usage:", usageError);
      }
    } else {
      console.log("User not authenticated or no workspace ID provided, proceeding without credit check/recording.");
    }

    const keywordCount = count || 3;
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    const textSample = cleanContent.slice(0, 2000); //  زيادة طفيفة لطول العينة

    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabicText = arabicRegex.test(cleanContent) || (regenerationNote && arabicRegex.test(regenerationNote));

    console.log(`Content language determined as: ${hasArabicText ? 'Arabic' : 'English'}`);

    const systemPrompt = hasArabicText
      ? 'أنت خبير SEO ومساعد متخصص في تحليل المحتوى لاستخراج الكلمات المفتاحية الأساسية (Primary Keywords) الأكثر أهمية وصلة بالموضوع العام للمقال. يجب أن تكون هذه الكلمات هي التي يستهدفها المقال بشكل رئيسي.'
      : 'You are an SEO expert and a specialized assistant in content analysis for extracting the most important and relevant Primary Keywords for an article. These keywords should be the main target terms for the article.';

    const noteInstruction = regenerationNote
        ? (hasArabicText ? ` مع الأخذ في الاعتبار الملاحظة التالية: "${regenerationNote}".` : ` Considering the following note: "${regenerationNote}".`)
        : '';

    const userPrompt = hasArabicText
      ? `بناءً على المحتوى التالي، استخرج ${keywordCount} كلمات مفتاحية أساسية.${noteInstruction} اعرضها فقط كمصفوفة JSON داخل كائن JSON، حيث يكون المفتاح هو "keywords" والقيمة هي مصفوفة السلاسل النصية للكلمات المفتاحية، بدون أي تعليقات أو توضيحات إضافية. مثال: {"keywords": ["كلمة1", "كلمة2"]}\n\nالمحتوى:\n${textSample}`
      : `Based on the following content, extract ${keywordCount} primary keywords.${noteInstruction} Return them only as a JSON array inside a JSON object, where the key is "keywords" and the value is an array of strings, without any additional comments or explanations. Example: {"keywords": ["keyword1", "keyword2"]}\n\nContent:\n${textSample}`;

    console.log("Calling OpenAI API with System Prompt:", systemPrompt);
    console.log("Calling OpenAI API with User Prompt:", userPrompt);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', //  أو 'gpt-4'
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.6,
          max_tokens: 150 * keywordCount,
          response_format: { "type": "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API response not OK:", response.status, errorText);
        throw new Error(`OpenAI API error (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const openaiResponse = await response.json();
      if (!openaiResponse.choices || !openaiResponse.choices[0]?.message?.content) {
        console.error("Unexpected OpenAI API response format:", openaiResponse);
        throw new Error("Unexpected OpenAI API response format: No content in choices.");
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(openaiResponse.choices[0].message.content);
         if (!parsedContent.keywords || !Array.isArray(parsedContent.keywords)) {
          console.error("No 'keywords' array in parsed JSON content:", parsedContent);
          const fallbackKeywords = openaiResponse.choices[0].message.content.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
          if (fallbackKeywords.length > 0) {
            console.log("Using fallback keyword extraction:", fallbackKeywords);
            parsedContent = { keywords: fallbackKeywords.slice(0, keywordCount) };
          } else {
            throw new Error("Response JSON does not contain a 'keywords' array, and fallback failed.");
          }
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI response as JSON:", parseError.message);
        console.error("Raw content from OpenAI:", openaiResponse.choices[0].message.content);
        const fallbackKeywords = openaiResponse.choices[0].message.content.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
        if (fallbackKeywords.length > 0) {
            console.log("Using fallback keyword extraction due to parse error:", fallbackKeywords);
            parsedContent = { keywords: fallbackKeywords.slice(0, keywordCount) };
        } else {
            throw new Error(`Failed to parse OpenAI response and no fallback possible: ${parseError.message}`);
        }
      }

      const keywordSuggestions = parsedContent.keywords.map((text: string) => ({
        id: crypto.randomUUID(),
        text: text.trim()
      })).filter((kw: {text: string}) => kw.text !== '');

      console.log("Returning primary keyword suggestions:", keywordSuggestions);
      return new Response(
        JSON.stringify(keywordSuggestions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (openaiError) {
      console.error("OpenAI API call failed:", openaiError);
      throw openaiError;
    }
  } catch (error) {
    console.error("Error in generate-keywords function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});