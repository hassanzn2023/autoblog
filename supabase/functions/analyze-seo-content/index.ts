// Предполагаемое имя файла: supabase/functions/analyze-seo-content/index.ts
// أو أي مسار تستخدمه لـ Deno Edge Function الخاصة بـ analyze-seo-content

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'; // Import Supabase client

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

  // Add API Key check at the beginning
  if (!openAIApiKey) {
    console.error("OPENAI_API_KEY environment variable is not set");
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { content, primaryKeyword, secondaryKeywords, userId, workspaceId } = await req.json();

    if (!content) {
      console.error("Content is required for SEO analysis but was not provided");
      return new Response(
        JSON.stringify({ error: 'Content is required for SEO analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
     // Log warning if primary keyword is missing but proceed
     if (!primaryKeyword || primaryKeyword.trim() === '') {
         console.warn("Primary keyword is missing or empty for SEO analysis. Analysis will be broader.");
     }


    console.log(`Analyzing SEO content for primary keyword: "${primaryKeyword || 'Not provided'}"`);
    console.log(`Content length: ${content.length} bytes`);
    console.log(`User ID: ${userId || 'Not provided'}`);
    console.log(`Workspace ID: ${workspaceId || 'Not provided'}`);

    // Supabase client and Credit Check (assuming you have credits table/RPC)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Only perform credit check and logging if userId, workspaceId, and Supabase details are available
    if (userId && workspaceId && supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const required_credits = 10; // Adjust credit cost for analysis as needed

        const { data: hasEnoughCredits, error: creditsError } = await supabase.rpc(
            'check_user_has_credits',
            { user_id_param: userId, required_credits: required_credits }
        );

        if (creditsError || !hasEnoughCredits) {
             console.warn("Credit check failed or insufficient credits:", creditsError?.message || 'Insufficient credits');
             return new Response(
              JSON.stringify({ error: creditsError?.message || 'Insufficient credits' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        try {
             // Note: prompt samples will be updated after userPrompt is built below
            await supabase.from('api_usage').insert({
                user_id: userId,
                workspace_id: workspaceId,
                api_type: 'openai',
                usage_amount: 1, // Represents one analysis call
                credits_consumed: required_credits,
                operation_type: 'seo_analysis',
                 details: {
                   system_prompt_sample: 'See fixed English prompt below', // Indicate fixed prompt
                   user_prompt_sample: '', // Placeholder for user prompt sample
                   primary_keyword: primaryKeyword,
                   secondary_keyword_count: secondaryKeywords?.length || 0
                }
            });
        } catch (usageError) {
            console.error("Error recording usage:", usageError);
            // Decide if logging usage error should block the user request
            // For now, it logs and continues.
        }
    } else {
        console.log("User/Workspace/Supabase details missing, skipping credit check/recording.");
        // Decide if you want to block requests without authentication/workspace context
    }


    // Extract plain text from HTML content for better analysis
    const plainTextContent = content.replace(/<[^>]+>/g, ' ').trim(); // Add trim here
    const truncatedContent = plainTextContent.slice(0, 6000); // Limit content size for token optimization (adjust as needed)

    // Detect content language for the response language instruction
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const isArabic = arabicRegex.test(plainTextContent)
       || (primaryKeyword && arabicRegex.test(primaryKeyword)) // Check primary keyword language
       || (secondaryKeywords?.some(kw => arabicRegex.test(kw))); // Check if any secondary keyword is Arabic
    const languageHint = isArabic ? 'Arabic' : 'English'; // Used in prompt instruction


    console.log(`Content language detected as: ${languageHint}`);

    // --- Fixed System Prompt (Always English) ---
    const systemPrompt = `You are an SEO expert specializing in content analysis and providing actionable recommendations for improvement. Analyze the provided article content from an SEO perspective and provide a detailed report of necessary SEO improvements with practical solutions.`;
    // ------------------------------------------

    // --- Construct the final User Prompt (Always English structure) ---
    // Build the keyword focus part of the prompt
    let keywordFocusInstruction = '';
    if (primaryKeyword && primaryKeyword.trim() !== '') {
        keywordFocusInstruction += ` focusing on the primary keyword "${primaryKeyword.trim()}"`;
        if (secondaryKeywords?.length > 0) {
            keywordFocusInstruction += ` and secondary keywords: ${secondaryKeywords.join(', ')}`;
        }
    } else if (secondaryKeywords?.length > 0) {
        // Case where primary keyword is missing but secondary keywords are provided
         keywordFocusInstruction += ` considering the following relevant keywords: ${secondaryKeywords.join(', ')}`;
    }
    // If both are missing, keywordFocusInstruction remains empty, and the analysis will be general

    // Instruction to provide the *values* in the content's language
    // Making this instruction very explicit and adding it before the JSON structure
    const languageAndFormatInstruction = `
Please provide the analysis details (issue descriptions, solutions, and the summary text) **strictly in the ${languageHint} language**, based on the language of the provided content.

Return the full analysis as a parseable JSON object with the following structure. **IMPORTANT:** The JSON keys must be exactly as specified below (in English), only the *values* corresponding to descriptions, solutions, and the summary should be in the content's language:
\`\`\`json
{
  "overallScore": 75, // Overall SEO score for the content (0-100)
  "categories": [
    {
      "name": "Content Structure", // English Key
      "score": 80, // Category score (0-100)
      "issues": [
        {
          "severity": "Critical", // Severity: Critical, Important, or Suggestion (English Value)
          "issue": "Issue description text in content language", // Description of the issue (Value in content language)
          "solution": "Suggested solution text in content language" // Suggested solution (Value in content language)
        }
        // Add more issues within this category if found
      ]
    }
    // Add more category objects for Keyword Usage, Internal/External Linking, Images/Media, Readability/Quality
  ],
  "summary": "General analysis summary and key takeaways in content language" // Summary text (Value in content language)
}
\`\`\`
`;

    const userPrompt = `Analyze the following article content${keywordFocusInstruction}.
${languageAndFormatInstruction}

Content for analysis:
${truncatedContent}`;
    // ----------------------------------------------------------------


    console.log("Calling OpenAI API with System Prompt:", systemPrompt);
    // Log a sample of the user prompt to avoid flooding logs with large content
     console.log("Calling OpenAI API with User Prompt (sample):", userPrompt.substring(0, 500) + (userPrompt.length > 500 ? '...' : ''));


    try {
        // Optional: Update the api_usage entry with the actual user prompt sample if needed
        // This assumes the latest entry for this user/workspace needs to be updated
        // You might need a more robust method depending on your Supabase logic
        // if (userId && workspaceId && supabaseUrl && supabaseServiceKey) {
        //     const supabase = createClient(supabaseUrl, supabaseServiceKey);
        //     const { data: usageUpdateData, error: usageUpdateError } = await supabase
        //         .from('api_usage')
        //         .update({ user_prompt_sample: userPrompt.substring(0, 500) })
        //         .eq('user_id', userId)
        //         .eq('workspace_id', workspaceId)
        //         .order('created_at', { ascending: false }) // Get the latest entry
        //         .limit(1);
        //     if (usageUpdateError) console.error("Error updating api_usage prompt sample:", usageUpdateError);
        // }

      // Call OpenAI API
      console.log('Calling OpenAI API for SEO analysis');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Or other capable model like 'gpt-4' - ensure it supports JSON mode
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.5, // Set slightly lower for more consistent outputs
          max_tokens: 2000, // Max tokens for the response (adjust if reports are too short/long)
          response_format: { "type": "json_object" } // Strongly request JSON output
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
         const requestDetails = {
             system_prompt_sample: systemPrompt.substring(0, 500),
             user_prompt_sample: userPrompt.substring(0, 500),
             status: response.status,
             error_text_sample: errorText.substring(0, 200)
         };
         console.error("Request details:", requestDetails);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;

      if (!analysisText) {
           console.error("No content in OpenAI response choices:", data);
            const requestDetails = {
                system_prompt_sample: systemPrompt.substring(0, 500),
                user_prompt_sample: userPrompt.substring(0, 500),
                raw_openai_response: JSON.stringify(data).substring(0, 500)
            };
            console.error("Request details:", requestDetails);
           throw new Error("Unexpected OpenAI API response format: No content in choices.");
      }

      console.log('SEO analysis completed successfully');
       console.log("Raw content received from OpenAI (sample):", analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : ''));


      // Try to parse the JSON from the response
      let analysisResult;
      try {
        // Attempt to parse directly first (model might just return the JSON)
        analysisResult = JSON.parse(analysisText);
        console.log('Attempted direct JSON parsing.');

        // If direct parsing failed, try extracting from ```json``` block
      } catch (directParseError) {
           console.warn('Direct JSON parsing failed, trying to extract from ```json``` block:', directParseError.message);
           const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                analysisResult = JSON.parse(jsonMatch[1]);
                console.log('Successfully extracted and parsed JSON from ```json``` block.');
            } else {
                // If neither works, throw the error to be caught by the outer catch
                 console.error('Failed to extract JSON from ```json``` block.');
                throw directParseError; // Re-throw the original error or a new one
            }
      }

      // Optional: Add a basic validation of the parsed structure
      if (!analysisResult || typeof analysisResult.overallScore !== 'number' || !Array.isArray(analysisResult.categories)) {
           console.warn("Parsed JSON might not match expected structure:", analysisResult);
           // Fallback to raw text if structure is clearly wrong after parsing
           analysisResult = {
              overallScore: analysisResult?.overallScore ?? 50, // Use parsed score if available, else default
              categories: analysisResult?.categories ?? [], // Use parsed categories if available
              summary: analysisResult?.summary ?? analysisText, // Use parsed summary if available, else raw text
              // Keep rawResponse true if parsing failed initially or validation fails
              rawResponse: true
           };
           console.warn("Falling back to partial/raw response due to structure mismatch.");
      } else {
           // Structure seems okay, ensure no rawResponse flag
           if (analysisResult.rawResponse) {
               delete analysisResult.rawResponse; // Remove fallback flag if structure is validated
           }
           console.log('Parsed JSON structure validated (basic check).');
      }


      return new Response(JSON.stringify(analysisResult), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (openaiError) {
      console.error('Error during OpenAI API call or processing:', openaiError);
      // Return a user-friendly error response for API/processing issues
      return new Response(JSON.stringify({
        error: `An error occurred during SEO analysis: ${openaiError.message || 'Unknown error'}`,
        status: 'error'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Unexpected error in analyze-seo-content function:', error);
     // Return a generic error response for unexpected issues
    return new Response(JSON.stringify({
      error: `An unexpected error occurred: ${error.message || 'Unknown error'}`,
      status: 'error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});