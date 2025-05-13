
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

type MessageRole = 'user' | 'system' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

interface GenerateTextParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  openaiApiKey?: string;
  systemMessage?: string;
  content?: string; // For chat completion
  model?: string;
}

interface GenerateKeywordParams {
  content: string;
  openaiApiKey?: string;
  count?: number;
}

interface KeywordResponse {
  keywords: string[];
  error?: string;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  id?: string;
}

// Added KeywordSuggestion interface that was missing
export interface KeywordSuggestion {
  id: string;
  text: string;
  score?: number;
}

const defaultModel = 'gpt-3.5-turbo';
const defaultCreditsPerRequest = 1;

const getApiKey = async (userId: string, workspaceId: string): Promise<string | null> => {
  try {
    // First try to get the user's API key
    const { data, error } = await supabase
      .from('api_keys')
      .select('api_key, is_active')
      .eq('user_id', userId as any)
      .eq('workspace_id', workspaceId as any)
      .eq('api_type', 'openai' as any)
      .single();

    if (error) {
      console.error('Error getting API key:', error?.message);
      return null;
    }

    // Check if we have a valid, active API key
    if (data && data.is_active && data.api_key && data.api_key.trim() !== '') {
      return data.api_key;
    }

    // If no valid key found for the user, we could implement a fallback to an admin key here
    // This could be a future enhancement to fetch from a system_api_keys table or similar
    console.log('No valid API key found for user');
    return null;
  } catch (error) {
    console.error('Exception getting API key:', error);
    return null;
  }
};

const hasEnoughCredits = async (userId: string, requiredCredits: number = defaultCreditsPerRequest): Promise<boolean> => {
  try {
    // Calculate total available credits
    const { data, error } = await supabase
      .from('credits')
      .select('credit_amount, transaction_type')
      .eq('user_id', userId as any);

    if (error) {
      console.error('Error checking credits:', error.message);
      return false;
    }

    const credits = data || [];
    let availableCredits = 0;

    for (const credit of credits) {
      if (credit.transaction_type === 'used') {
        availableCredits -= credit.credit_amount;
      } else {
        availableCredits += credit.credit_amount;
      }
    }

    return availableCredits >= requiredCredits;
  } catch (error) {
    console.error('Exception checking credits:', error);
    return false;
  }
};

export const generateText = async (
  params: GenerateTextParams,
  userId: string,
  workspaceId: string
): Promise<string> => {
  try {
    const { prompt, maxTokens = 500, temperature = 0.7, openaiApiKey, systemMessage = '', model = defaultModel } = params;

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId);
    if (!hasCredits) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits to perform this operation.",
        variant: "destructive",
      });
      return "Error: Insufficient credits.";
    }

    // Get API key if not provided
    let apiKey = openaiApiKey;
    if (!apiKey) {
      apiKey = await getApiKey(userId, workspaceId);
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please set your OpenAI API key in the settings.",
          variant: "destructive",
        });
        return "Error: OpenAI API key not found.";
      }
    }

    // Prepare messages
    const messages: Message[] = [];
    
    if (systemMessage) {
      messages.push({
        role: 'system',
        content: systemMessage
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Record credit usage
    await recordCreditUsage(userId, workspaceId, defaultCreditsPerRequest, 'text_generation');

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('Error generating text:', error.response?.data || error.message);
    
    let errorMessage = "Failed to generate text.";
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast({
      title: "Generation Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return `Error: ${errorMessage}`;
  }
};

export const generateKeywords = async (
  params: GenerateKeywordParams,
  userId: string,
  workspaceId: string
): Promise<KeywordResponse> => {
  try {
    const { content, openaiApiKey, count = 10 } = params;

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId);
    if (!hasCredits) {
      return { keywords: [], error: "Insufficient credits." };
    }

    // Get API key if not provided
    let apiKey = openaiApiKey;
    if (!apiKey) {
      apiKey = await getApiKey(userId, workspaceId);
      if (!apiKey) {
        return { keywords: [], error: "OpenAI API key not found." };
      }
    }

    // Call our Supabase Edge Function that handles keyword generation
    const { data, error } = await supabase.functions.invoke('generate-keywords', {
      body: { content, apiKey, count },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message);
    }

    // Record credit usage
    await recordCreditUsage(userId, workspaceId, defaultCreditsPerRequest, 'keyword_generation');

    return { keywords: data?.keywords || [] };
  } catch (error: any) {
    console.error('Error generating keywords:', error);
    return { keywords: [], error: error.message };
  }
};

const recordCreditUsage = async (
  userId: string,
  workspaceId: string,
  creditAmount: number,
  operationType: string
) => {
  try {
    // Record credit usage
    const { error: creditError } = await supabase
      .from('credits')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        credit_amount: creditAmount,
        transaction_type: 'used',
      } as any);

    if (creditError) {
      console.error('Error recording credit usage:', creditError.message);
    }

    // Record API usage
    const { error: usageError } = await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        api_type: 'openai',
        usage_amount: 1,
        credits_consumed: creditAmount,
        operation_type: operationType,
      } as any);

    if (usageError) {
      console.error('Error recording API usage:', usageError.message);
    }
  } catch (error) {
    console.error('Exception recording usage:', error);
  }
};

export const chatWithAI = async (
  messages: ChatMessage[],
  userId: string,
  workspaceId: string,
  openaiApiKey?: string,
  model: string = defaultModel
): Promise<ChatMessage> => {
  try {
    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId);
    if (!hasCredits) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits to perform this operation.",
        variant: "destructive",
      });
      return { role: 'assistant', content: "Error: Insufficient credits." };
    }

    // Get API key if not provided
    let apiKey = openaiApiKey;
    if (!apiKey) {
      apiKey = await getApiKey(userId, workspaceId);
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please set your OpenAI API key in the settings.",
          variant: "destructive",
        });
        return { role: 'assistant', content: "Error: OpenAI API key not found." };
      }
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: messages.map(({ role, content }) => ({ role, content })),
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Record credit usage (2 credits for chat)
    await recordCreditUsage(userId, workspaceId, 2, 'chat_completion');

    return {
      role: 'assistant',
      content: response.data.choices[0].message.content.trim(),
      id: Date.now().toString(),
    };
  } catch (error: any) {
    console.error('Error in chat:', error.response?.data || error.message);
    
    let errorMessage = "Failed to generate response.";
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast({
      title: "Chat Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { role: 'assistant', content: `Error: ${errorMessage}` };
  }
};

// Added new function to match the imports in other files
export const generateKeywordSuggestions = async (
  content: string,
  count: number = 3,
  notes: string = '',
  userId: string,
  workspaceId: string
): Promise<KeywordSuggestion[]> => {
  try {
    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId);
    if (!hasCredits) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits to perform this operation.",
        variant: "destructive",
      });
      return [];
    }

    // Get API key
    const apiKey = await getApiKey(userId, workspaceId);
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key in the settings.",
        variant: "destructive",
      });
      return [];
    }

    console.log(`Generating primary keywords with content length: ${content.length}`);
    
    // Call OpenAI through our edge function
    const { data, error } = await supabase.functions.invoke('generate-keywords', {
      body: { 
        content, 
        apiKey, 
        count,
        notes
      },
    });

    if (error) {
      console.error('Error generating primary keywords:', error);
      throw new Error(error.message);
    }

    // Record credit usage
    await recordCreditUsage(userId, workspaceId, 1, 'keyword_suggestion');

    // Convert to KeywordSuggestion format
    return (data?.keywords || []).map((keyword: string, index: number) => ({
      id: `kw-${Date.now()}-${index}`,
      text: keyword,
    }));
  } catch (error: any) {
    console.error('Error generating keyword suggestions:', error);
    
    toast({
      title: "Error",
      description: error.message || "Failed to generate keyword suggestions",
      variant: "destructive",
    });
    
    return [];
  }
};

export const generateSecondaryKeywordSuggestions = async (
  primaryKeyword: string,
  content: string,
  count: number = 5,
  notes: string = '',
  userId: string,
  workspaceId: string
): Promise<KeywordSuggestion[]> => {
  try {
    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId);
    if (!hasCredits) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits to perform this operation.",
        variant: "destructive",
      });
      return [];
    }

    // Get API key
    const apiKey = await getApiKey(userId, workspaceId);
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key in the settings.",
        variant: "destructive",
      });
      return [];
    }

    console.log(`Generating secondary keywords for primary keyword: ${primaryKeyword}`);
    
    // Call OpenAI through our edge function
    const { data, error } = await supabase.functions.invoke('generate-secondary-keywords', {
      body: { 
        primaryKeyword,
        content, 
        apiKey, 
        count,
        notes
      },
    });

    if (error) {
      console.error('Error generating secondary keywords:', error);
      throw new Error(error.message);
    }

    // Record credit usage
    await recordCreditUsage(userId, workspaceId, 1, 'secondary_keyword_suggestion');

    // Convert to KeywordSuggestion format
    return (data?.keywords || []).map((keyword: string, index: number) => ({
      id: `skw-${Date.now()}-${index}`,
      text: keyword,
    }));
  } catch (error: any) {
    console.error('Error generating secondary keyword suggestions:', error);
    
    toast({
      title: "Error",
      description: error.message || "Failed to generate secondary keyword suggestions",
      variant: "destructive",
    });
    
    return [];
  }
};
