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
      const required_credits = 5; // Credit cost for primary keyword generation

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
        await supabase.from('credits').insert({
            user_id: userId,
            workspace_id: workspaceId,
            credit_amount: required_credits,
            transaction_type: 'used'
        });
         // Note: user_prompt_sample will be updated after userPrompt is built below
        await supabase.from('api_usage').insert({
            user_id: userId,
            workspace_id: workspaceId,
            api_type: 'openai',
            usage_amount: 1,
            credits_consumed: required_credits,
            operation_type: 'generate_primary_keywords',
             details: {
               system_prompt_sample: 'See fixed English prompt below', // Indicate fixed prompt
               user_prompt_sample: '', // Placeholder, will update or note it
               keyword_count_requested: count || 3,
               regeneration_note_provided: !!regenerationNote
            }
        });
      } catch (usageError) {
        console.error("Error recording usage:", usageError);
      }
    } else {
      console.log("User not authenticated or no workspace ID provided, proceeding without credit check/recording.");
    }

    const keywordCount = count || 3;
    // Remove HTML tags and trim whitespace from content
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    const textSample = cleanContent.slice(0, 2000); // Take a sample of the cleaned content

    // Still detect language for logging/debugging purposes
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabicText = arabicRegex.test(cleanContent) || (regenerationNote && arabicRegex.test(regenerationNote));

    console.log(`Content language detected as: ${hasArabicText ? 'Arabic' : 'English'}`);


    // --- Fixed System Prompt (Always English) ---
    const systemPrompt = 'You are an SEO expert and a specialized assistant in content analysis for extracting the most important and relevant Primary Keywords for an article. These keywords should be the main target terms for the article.';
    // ------------------------------------------

    // --- Construct the final User Prompt (Always English structure) ---
    const noteInstruction = regenerationNote
        ? ` Considering the following note: "${regenerationNote}".`
        : '';

    // This is the key instruction to return keywords in the source content's language
    const languageInstruction = ` **Provide the keywords strictly in the language of the provided content.**`;

    const formatInstruction = ` Output only as a JSON object with a single key "keywords" containing an array of strings, with no additional comments or explanations. Example: {"keywords": ["keyword1", "keyword2"]}`;

    // Note: Removed the check "different from primary keyword" as there is no primary input here
    const userPrompt = `Based on the following content, extract ${keywordCount} primary keywords.${noteInstruction}${languageInstruction}${formatInstruction}\n\nContent:\n${textSample}`;
    // ----------------------------------------------------------------


    console.log("Calling OpenAI API with System Prompt:", systemPrompt);
     console.log("Calling OpenAI API with User Prompt:", userPrompt.substring(0, 500) + (userPrompt.length > 500 ? '...' : '')); // Log sample of user prompt


    try {
        // If you need to log the full user prompt, update api_usage here
        // Example update (might need adjustment based on your actual table schema and how you want to link):
        // const { data: usageData, error: usageErrorUpdate } = await supabase.from('api_usage')
        //     .update({ user_prompt_sample: userPrompt.substring(0, 500) }) // Or full userPrompt if safe/needed
        //     .eq('user_id', userId)
        //     .eq('workspace_id', workspaceId)
        //     .order('created_at', { ascending: false }) // Get the latest entry for this user/workspace
        //     .limit(1);

        // if (usageErrorUpdate) {
        //     console.error("Error updating api_usage with prompt sample:", usageErrorUpdate);
        // }


      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Or 'gpt-4' etc. - Ensure model supports JSON mode
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.6,
          max_tokens: 100 * keywordCount, // Adjusted max_tokens slightly
          response_format: { "type": "json_object" } // Strongly request JSON output
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API response not OK:", response.status, errorText);
         const requestDetails = {
             system_prompt_sample: systemPrompt.substring(0, 500),
             user_prompt_sample: userPrompt.substring(0, 500),
             status: response.status,
             error_text_sample: errorText.substring(0, 200)
         };
         console.error("Request details:", requestDetails);
        throw new Error(`OpenAI API error (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const openaiResponse = await response.json();
      if (!openaiResponse.choices || !openaiResponse.choices[0]?.message?.content) {
        console.error("Unexpected OpenAI API response format:", openaiResponse);
         const requestDetails = {
             system_prompt_sample: systemPrompt.substring(0, 500),
             user_prompt_sample: userPrompt.substring(0, 500),
             raw_openai_response: JSON.stringify(openaiResponse).substring(0, 500)
         };
         console.error("Request details:", requestDetails);
        throw new Error("Unexpected OpenAI API response format: No content in choices.");
      }

      let parsedContent;
      const rawContent = openaiResponse.choices[0].message.content;

      try {
         console.log("Raw content received from OpenAI:", rawContent.substring(0, 500) + (rawContent.length > 500 ? '...' : ''));

        parsedContent = JSON.parse(rawContent);

        if (!parsedContent.keywords || !Array.isArray(parsedContent.keywords)) {
          console.warn("No 'keywords' array in parsed JSON content, attempting fallback:", parsedContent);
          // Attempt to extract keywords from raw text if JSON parsing failed or structure is wrong
          const fallbackKeywords = rawContent.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);

          if (fallbackKeywords.length > 0) {
            console.log("Using fallback keyword extraction:", fallbackKeywords);
            parsedContent = { keywords: fallbackKeywords.slice(0, keywordCount) };
          } else {
             const requestDetails = {
                 system_prompt_sample: systemPrompt.substring(0, 500),
                 user_prompt_sample: userPrompt.substring(0, 500),
                 raw_openai_content_sample: rawContent.substring(0, 500)
             };
             console.error("Fallback extraction failed. Request details:", requestDetails);
            throw new Error("Response JSON does not contain a 'keywords' array, and fallback failed.");
          }
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI response as JSON:", parseError.message);
        const rawContent = openaiResponse.choices[0].message.content;
        console.error("Raw content from OpenAI (during parse error):", rawContent.substring(0, 500) + (rawContent.length > 500 ? '...' : ''));


        // Attempt to extract keywords from raw text if JSON parsing failed
        const fallbackKeywords = rawContent.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);

        if (fallbackKeywords.length > 0) {
            console.log("Using fallback keyword extraction due to parse error:", fallbackKeywords);
            parsedContent = { keywords: fallbackKeywords.slice(0, keywordCount) };
        } else {
           const requestDetails = {
                 system_prompt_sample: systemPrompt.substring(0, 500),
                 user_prompt_sample: userPrompt.substring(0, 500),
                 raw_openai_content_sample: rawContent.substring(0, 500),
                 parse_error: parseError.message
           };
           console.error("Fallback extraction failed after parse error. Request details:", requestDetails);
          throw new Error(`Failed to parse OpenAI response and no fallback possible: ${parseError.message}`);
        }
      }

      const keywordSuggestions = parsedContent.keywords.map((text: string) => ({
        id: crypto.randomUUID(),
        text: text.trim() // Ensure leading/trailing whitespace is removed
      })).filter((kw: {text: string}) => kw.text !== ''); // Remove empty keywords

      console.log("Returning primary keyword suggestions:", keywordSuggestions);
      return new Response(
        JSON.stringify(keywordSuggestions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (openaiError) {
      console.error("OpenAI API call failed:", openaiError);
       return new Response(
        JSON.stringify({ error: `Failed to get suggestions from AI: ${openaiError.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in generate-keywords function:", error.message);
    return new Response(
      JSON.stringify({ error: `An unexpected error occurred: ${error.message || 'Unknown error'}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});