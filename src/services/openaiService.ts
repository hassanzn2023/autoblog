
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

export interface KeywordSuggestion {
  id: string;
  text: string;
}

// Credit tracking helper
const recordCreditUsage = async (
  userId: string,
  workspaceId: string,
  amount: number,
  operationType: string
) => {
  console.log(`Recording ${amount} credits usage for ${operationType}`);
  
  try {
    // Record in credits table
    const { error: creditError } = await supabase
      .from('credits')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        credit_amount: amount,
        transaction_type: 'used'
      });
      
    if (creditError) {
      console.error("Error recording credit usage:", creditError);
      // Continue despite error to ensure user experience
    }
    
    // Record in api_usage table  
    const { error: usageError } = await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        api_type: 'openai',
        usage_amount: 1,
        credits_consumed: amount,
        operation_type: operationType
      });
      
    if (usageError) {
      console.error("Error recording API usage:", usageError);
    }
  } catch (error) {
    console.error("Error in recordCreditUsage:", error);
    // We'll continue despite errors to ensure good user experience
  }
};

const getApiKey = async (userId: string, workspaceId: string): Promise<string | null> => {
  try {
    console.log(`Attempting to get API key for user ${userId} and workspace ${workspaceId}`);
    
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
      console.log('Valid API key found for user');
      return data.api_key;
    } else {
      console.log('No valid API key found. Key status:', data ? 
        `Active: ${data.is_active}, Empty: ${!data.api_key || data.api_key.trim() === ''}` : 
        'No key data'
      );
    }

    return null;
  } catch (error) {
    console.error('Exception getting API key:', error);
    return null;
  }
};

export const checkCredits = async (
  userId: string,
  workspaceId: string,
  requiredCredits: number
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc(
      'check_user_has_credits',
      { user_id_param: userId, required_credits: requiredCredits }
    );
    
    if (error) {
      console.error("Error checking credits:", error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error("Exception checking credits:", error);
    return false;
  }
};

export const generateKeywordSuggestions = async (
  content: string,
  count: number = 3,
  note: string = '',
  userId?: string,
  workspaceId?: string
): Promise<KeywordSuggestion[]> => {
  console.log("Generating primary keywords with content length:", content.length);
  
  if (!content) {
    throw new Error("Content is required to generate keywords");
  }

  try {
    let hasEnoughCredits = true;
    
    // Check for credit availability if user and workspace are provided
    if (userId && workspaceId) {
      hasEnoughCredits = await checkCredits(userId, workspaceId, 5);
      
      if (!hasEnoughCredits) {
        throw new Error("Insufficient credits to use this feature");
      }
      
      // Pre-emptively record credit usage
      try {
        await recordCreditUsage(userId, workspaceId, 5, 'keyword_suggestion');
      } catch (error) {
        console.error("Error recording credit usage:", error);
        // Continue despite error
      }
    }
    
    // Make the request to the Edge Function
    try {
      console.log("Calling generate-keywords edge function...");
      const response = await axios.post(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-keywords`,
        {
          content,
          count,
          note,
          userId,
          workspaceId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );
      
      console.log("Edge function response received:", response.status);
      
      if (response.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error calling generate-keywords edge function:", error);
      
      if (error.response) {
        console.error("Response error data:", error.response.data);
        
        if (error.response.data.error) {
          throw new Error(`API Error: ${error.response.data.error}`);
        }
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error("Error in generateKeywordSuggestions:", error);
    throw new Error(error.message || "Failed to generate keyword suggestions");
  }
};

export const generateSecondaryKeywordSuggestions = async (
  primaryKeyword: string,
  content: string,
  count: number = 5,
  note: string = '',
  userId?: string,
  workspaceId?: string  
): Promise<KeywordSuggestion[]> => {
  console.log("Generating secondary keywords for primary keyword:", primaryKeyword);
  
  if (!primaryKeyword || !content) {
    throw new Error("Primary keyword and content are required to generate secondary keywords");
  }
  
  try {
    let hasEnoughCredits = true;
    
    // Check for credit availability if user and workspace are provided
    if (userId && workspaceId) {
      hasEnoughCredits = await checkCredits(userId, workspaceId, 5);
      
      if (!hasEnoughCredits) {
        throw new Error("Insufficient credits to use this feature");
      }
      
      // Pre-emptively record credit usage
      try {
        await recordCreditUsage(userId, workspaceId, 5, 'secondary_keyword_suggestion');
      } catch (error) {
        console.error("Error recording credit usage:", error);
        // Continue despite error
      }
    }
    
    // Build a special note including the primary keyword
    const keywordNote = `Based on primary keyword: ${primaryKeyword}. ${note || ''}`;
    
    // Reuse the existing keyword generation service with the specific note
    return await generateKeywordSuggestions(content, count, keywordNote, userId, workspaceId);
  } catch (error: any) {
    console.error("Error in generateSecondaryKeywordSuggestions:", error);
    throw new Error(error.message || "Failed to generate secondary keyword suggestions");
  }
};
