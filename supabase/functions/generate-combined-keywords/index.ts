
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

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
    const { content, primaryCount = 3, secondaryCount = 5, note = '', userId, workspaceId } = await req.json();
    
    console.log(`Generating ${primaryCount} primary and ${secondaryCount} secondary keyword suggestions`);
    console.log(`User ID: ${userId}`);
    console.log(`Workspace ID: ${workspaceId}`);
    console.log(`Content sample: ${content.substring(0, 100)}...`);
    
    if (!userId || !workspaceId) {
      throw new Error("User ID and workspace ID are required");
    }
    
    // Create Supabase client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get user API key
    const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
      .from('api_keys')
      .select('api_key, is_active')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .eq('api_type', 'openai')
      .single();

    if (apiKeyError || !apiKeyData?.api_key || !apiKeyData?.is_active) {
      console.error('API key error:', apiKeyError?.message || 'No active API key found');
      throw new Error('No valid OpenAI API key found');
    }

    console.log('User API key found');
    
    // Record credit usage (2 credits for combined operation)
    const { error: creditError } = await supabaseAdmin
      .from('credits')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        credit_amount: 2,
        transaction_type: 'used',
      });
    
    if (creditError) {
      console.error('Error recording credit usage:', creditError.message);
      throw new Error('Failed to process credit usage');
    }
    
    console.log('Credit usage recorded successfully');
    
    // Record API usage
    await supabaseAdmin
      .from('api_usage')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        api_type: 'openai',
        usage_amount: 1,
        credits_consumed: 2,
        operation_type: 'combined_keyword_generation',
      });
      
    console.log('API usage recorded successfully');
    
    // Detect content language for better prompt construction
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const isRtlContent = rtlRegex.test(content);
    const contentLanguage = isRtlContent ? 'Arabic' : 'English';
    console.log(`Content language: ${contentLanguage}`);
    
    // Call OpenAI API
    const openaiApiKey = apiKeyData.api_key;
    console.log('Calling OpenAI API...');
    
    // Construct a prompt that will generate both primary and secondary keywords at once
    const prompt = `You are an SEO expert. Based on the following content, please provide:
1. ${primaryCount} primary keywords that best represent the main topic
2. ${secondaryCount} secondary keywords that are related to the main topic

Content:
"""
${content.substring(0, 5000)} ${content.length > 5000 ? '...' : ''}
"""

${note ? `Additional notes from user: ${note}` : ''}

Format your response as a JSON object with two arrays:
{
  "primary": ["keyword1", "keyword2", "keyword3"],
  "secondary": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Only provide this JSON object in your response, nothing else. Use ${contentLanguage} keywords.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an SEO expert that returns keyword suggestions in JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    console.log('OpenAI API response received');
    
    const openaiData = await response.json();
    if (!openaiData.choices || !openaiData.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    // Parse the JSON from the OpenAI response
    const responseContent = openaiData.choices[0].message.content.trim();
    
    // Extract just the JSON part if there's any text before or after it
    const jsonMatch = responseContent.match(/({[\s\S]*})/);
    const jsonContent = jsonMatch ? jsonMatch[0] : responseContent;
    
    let parsedKeywords;
    try {
      parsedKeywords = JSON.parse(jsonContent);
      console.log('Parsed keywords:', parsedKeywords);
      
      if (!parsedKeywords.primary || !parsedKeywords.secondary) {
        throw new Error('Keywords not properly formatted');
      }
    } catch (e) {
      console.error('Error parsing keywords JSON:', e);
      console.error('Raw response:', responseContent);
      throw new Error('Failed to parse keywords from AI response');
    }
    
    // Convert arrays to proper format with IDs
    const primaryKeywords = parsedKeywords.primary.map((text: string) => ({
      id: uuidv4(),
      text
    }));
    
    const secondaryKeywords = parsedKeywords.secondary.map((text: string) => ({
      id: uuidv4(),
      text
    }));
    
    console.log('Returning keyword suggestions:', { primaryKeywords, secondaryKeywords });
    
    // Return the response
    return new Response(
      JSON.stringify({
        primaryKeywords,
        secondaryKeywords
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in generate-combined-keywords function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
