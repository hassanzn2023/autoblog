
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { content, primaryKeyword, secondaryKeywords, userId, workspaceId } = await req.json();
    
    if (!content) {
      throw new Error("Content is required for SEO analysis");
    }
    
    console.log(`Analyzing SEO content for keyword: "${primaryKeyword}"`);
    console.log(`Content length: ${content.length} bytes`);
    console.log(`User ID: ${userId || 'Not provided'}`);
    console.log(`Workspace ID: ${workspaceId || 'Not provided'}`);
    
    // Extract plain text from HTML content for better analysis
    const plainTextContent = content.replace(/<[^>]+>/g, ' ');
    const truncatedContent = plainTextContent.slice(0, 6000); // Limit content size for token optimization
    
    // Detect content language
    const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(content);
    const language = isArabic ? 'Arabic' : 'English';
    console.log(`Content language determined as: ${language}`);
    
    // Create system prompt based on language
    const systemPrompt = isArabic 
      ? `أنت خبير في تحسين محركات البحث (SEO) متخصص في تحليل المحتوى وتقديم توصيات عملية لتحسينه. قم بتحليل المقال المقدم وقدم تقريراً مفصلاً عن تحسينات SEO ضرورية مع حلول عملية.`
      : `You are an SEO expert specializing in content analysis and providing actionable recommendations for improvement. Analyze the provided article and provide a detailed report of necessary SEO improvements with practical solutions.`;
    
    // Create detailed user prompt
    const userPrompt = isArabic
      ? `قم بتحليل المحتوى التالي للمقال مع التركيز على الكلمة الرئيسية "${primaryKeyword}" ${secondaryKeywords?.length > 0 ? `والكلمات الثانوية: ${secondaryKeywords.join(', ')}` : ''}.
      
قدم تحليلاً مفصلاً للمحتوى من منظور تحسين محركات البحث (SEO) مع تقسيم النتائج إلى الفئات التالية:

1. هيكل المحتوى (العناوين، الفقرات، التنسيق)
2. استخدام الكلمات المفتاحية (الكثافة، الموضع، الترابط)
3. الروابط الداخلية والخارجية
4. الصور والوسائط
5. القابلية للقراءة والجودة العامة

لكل مشكلة، صنّفها إلى أحد المستويات التالية: حرجة (يجب معالجتها فوراً)، مهمة (يُنصح بمعالجتها)، أو اقتراح (للتحسين)، واقترح حلاً محدداً.

أعد النتائج بتنسيق JSON قابل للتحليل حسب البنية التالية:
\`\`\`json
{
  "overallScore": 75, // 0-100
  "categories": [
    {
      "name": "هيكل المحتوى",
      "score": 80, // 0-100
      "issues": [
        {
          "severity": "حرجة",
          "issue": "نص وصف المشكلة",
          "solution": "نص الحل المقترح"
        }
      ]
    }
  ],
  "summary": "ملخص عام للتحليل وأهم النقاط"
}
\`\`\`

المحتوى للتحليل:
${truncatedContent}`
      : `Analyze the following article content focusing on the primary keyword "${primaryKeyword}" ${secondaryKeywords?.length > 0 ? `and secondary keywords: ${secondaryKeywords.join(', ')}` : ''}.
      
Please provide a detailed SEO content analysis with findings categorized into:

1. Content Structure (headings, paragraphs, formatting)
2. Keyword Usage (density, placement, relevance)
3. Internal and External Linking
4. Images and Media
5. Readability and General Quality

For each issue, categorize it as: Critical (must fix), Important (should fix), or Suggestion (for improvement), and suggest a specific solution.

Return the results in a parseable JSON format with the following structure:
\`\`\`json
{
  "overallScore": 75, // 0-100
  "categories": [
    {
      "name": "Content Structure",
      "score": 80, // 0-100
      "issues": [
        {
          "severity": "Critical",
          "issue": "Issue description text",
          "solution": "Suggested solution text"
        }
      ]
    }
  ],
  "summary": "General analysis summary and key points"
}
\`\`\`

Content for analysis:
${truncatedContent}`;
    
    // Call OpenAI API
    console.log('Calling OpenAI API for SEO analysis');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using GPT-4o mini for good performance at lower cost
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5, // Set slightly lower for more consistent outputs
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('SEO analysis completed successfully');
    
    // Try to parse the JSON from the response
    let analysisResult;
    try {
      // Extract the JSON object from the response text
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        analysisResult = JSON.parse(jsonMatch[1]);
      } else {
        // Try direct parsing in case the model returned just JSON
        analysisResult = JSON.parse(analysisText);
      }
      
      console.log('Successfully parsed analysis result as JSON');
    } catch (error) {
      console.error('Error parsing analysis result as JSON:', error);
      // If JSON parsing fails, return the raw text with a basic structure
      analysisResult = {
        overallScore: 50,
        categories: [],
        summary: analysisText,
        rawResponse: true
      };
    }
    
    return new Response(JSON.stringify(analysisResult), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-seo-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred during SEO analysis',
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
