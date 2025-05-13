// Предполагаемое имя файла: supabase/functions/generate-secondary-keywords/index.ts
// أو أي مسار تستخدمه لـ Deno Edge Function الخاصة بـ generate-secondary-keywords

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
    // جعل primaryKeyword اختيارية في الاستقبال، content لا تزال مطلوبة
    const { primaryKeyword, content, count, note, userId, workspaceId } = await req.json();

    if (!content) { //  <--- تعديل: التحقق من content فقط
      console.error("Content is required but was not provided");
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // معالجة primaryKeyword لتكون null إذا كانت فارغة أو غير موجودة
    const effectivePrimaryKeyword = (typeof primaryKeyword === 'string' && primaryKeyword.trim() !== '') ? primaryKeyword.trim() : null;
    const regenerationNote = (typeof note === 'string' && note.trim() !== '') ? note.trim() : null;


    console.log(`Generating ${count || 5} secondary keyword suggestions.`);
    if (effectivePrimaryKeyword) {
      console.log(`Based on primary keyword: "${effectivePrimaryKeyword}"`);
    }
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
      // ... (كود التحقق من الاعتمادات وتسجيل الاستخدام يبقى كما هو)
      // يمكن تعديل عدد الاعتمادات هنا إذا كان اقتراح الكلمات الثانوية بدون أساسية يستهلك عددًا مختلفًا
      const required_credits = 3; //  أو أي قيمة تراها مناسبة
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
            credit_amount: required_credits, // استخدم نفس القيمة
            transaction_type: 'used'
        });
        await supabase.from('api_usage').insert({
            user_id: userId,
            workspace_id: workspaceId,
            api_type: 'openai',
            usage_amount: 1,
            credits_consumed: required_credits, // استخدم نفس القيمة
            operation_type: 'generate_secondary_keywords'
        });
      } catch (usageError) {
        console.error("Error recording usage:", usageError);
      }
    } else {
      console.log("User not authenticated or no workspace ID provided, proceeding without credit check/recording.");
    }

    const keywordCount = count || 5;
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    const textSample = cleanContent.slice(0, 2000); //  زيادة طفيفة لطول العينة

    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabicText = arabicRegex.test(cleanContent) || (effectivePrimaryKeyword && arabicRegex.test(effectivePrimaryKeyword)) || (regenerationNote && arabicRegex.test(regenerationNote));

    console.log(`Content language determined as: ${hasArabicText ? 'Arabic' : 'English'}`);

    let systemPrompt = '';
    let userPromptSegment = '';
    const noteInstruction = regenerationNote
        ? (hasArabicText ? ` مع الأخذ في الاعتبار الملاحظة التالية: "${regenerationNote}".` : ` Considering the following note: "${regenerationNote}".`)
        : '';

    if (effectivePrimaryKeyword) {
      systemPrompt = hasArabicText
        ? 'أنت خبير SEO ومساعد متخصص في تحليل المحتوى لاستخراج كلمات مفتاحية ثانوية (long-tail keywords أو LSI keywords) تكون وثيقة الصلة بكلمة مفتاحية رئيسية ومحتوى المقال. يجب أن تكون الكلمات المقترحة مفيدة لتحسين ترتيب المقال في محركات البحث.'
        : 'You are an SEO expert and a specialized assistant in content analysis for extracting secondary keywords (long-tail keywords or LSI keywords) that are highly relevant to a primary keyword and the article content. The suggested keywords should be useful for improving search engine rankings.';
      userPromptSegment = hasArabicText
        ? `بناءً على المحتوى التالي والكلمة المفتاحية الرئيسية "${effectivePrimaryKeyword}"،`
        : `Based on the following content and primary keyword "${effectivePrimaryKeyword}",`;
    } else {
      systemPrompt = hasArabicText
        ? 'أنت خبير SEO ومساعد متخصص في تحليل المحتوى لاستخراج كلمات مفتاحية ثانوية (long-tail keywords أو LSI keywords) مناسبة لمقال. يجب أن تكون الكلمات المقترحة ذات صلة بالموضوع العام للمقال وتساعد في تغطية جوانب متعددة منه.'
        : 'You are an SEO expert and a specialized assistant in content analysis for extracting suitable secondary keywords (long-tail keywords or LSI keywords) for an article. The suggested keywords should be relevant to the general topic of the article and help cover multiple aspects of it.';
      userPromptSegment = hasArabicText
        ? `بناءً على المحتوى التالي،`
        : `Based on the following content,`;
    }

    const userPrompt = `${userPromptSegment} استخرج ${keywordCount} كلمات مفتاحية ثانوية.${noteInstruction} يجب أن تكون الكلمات مختلفة عن الكلمة المفتاحية الرئيسية (إذا تم توفيرها). اعرضها فقط كمصفوفة JSON داخل كائن JSON، حيث يكون المفتاح هو "keywords" والقيمة هي مصفوفة السلاسل النصية للكلمات المفتاحية، بدون أي تعليقات أو توضيحات إضافية. مثال: {"keywords": ["كلمة1", "كلمة2"]}\n\nالمحتوى:\n${textSample}`;

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
          model: 'gpt-4o-mini', //  أو 'gpt-4' إذا كنت تفضل
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.6, //  تعديل درجة الحرارة للحصول على نتائج أكثر تركيزًا
          max_tokens: 200 * keywordCount, //  زيادة طفيفة لضمان مساحة كافية للكلمات
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
          // محاولة استخراج الكلمات إذا كانت الاستجابة نصًا مفصولًا بفواصل أو أسطر جديدة
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
        // محاولة استخراج الكلمات إذا كانت الاستجابة نصًا مفصولًا بفواصل أو أسطر جديدة
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
        text: text.trim() // التأكد من إزالة أي مسافات بادئة/زائدة
      })).filter((kw: {text: string}) => kw.text !== ''); //  إزالة الكلمات الفارغة

      console.log("Returning secondary keyword suggestions:", keywordSuggestions);
      return new Response(
        JSON.stringify(keywordSuggestions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (openaiError) {
      console.error("OpenAI API call failed:", openaiError);
      throw openaiError; //  سيتم التقاط هذا بواسطة الـ catch الخارجي
    }
  } catch (error) {
    console.error("Error in generate-secondary-keywords function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});