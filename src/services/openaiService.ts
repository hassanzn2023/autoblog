import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { parseWordDocument } from './documentParserService';
import { extractContentFromUrl as extractContent } from './contentExtractorService';
import { supabase } from '@/integrations/supabase/client';

// Simulate the keyword generation with mock data
export interface KeywordSuggestion {
  id: string;
  text: string;
}

/**
 * Generate primary keyword suggestions from content
 */
export const generateKeywordSuggestions = async (
  content: string,
  count: number = 3,
  note: string = '',
  userId?: string,
  workspaceId?: string
): Promise<KeywordSuggestion[]> => {
  console.log(`Generating ${count} keyword suggestions`);
  
  // Check if user is authenticated and has OpenAI API key
  if (userId && workspaceId) {
    try {
      // Get API key from database
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .eq('api_type', 'openai')
        .eq('is_active', true)
        .single();
      
      if (apiKeyError || !apiKeyData) {
        console.error("No active OpenAI API key found. Falling back to mock data.");
        return generateMockKeywords(content, count);
      }
      
      // Use real OpenAI API
      const openaiApiKey = apiKeyData.api_key;
      
      // Record API usage
      await recordApiUsage(userId, workspaceId, 'openai', 'generate_keywords', 5);
      
      // Implement real OpenAI integration here when ready
      // For now, return mock data
      return generateMockKeywords(content, count);
    } catch (error) {
      console.error("Error accessing API key:", error);
      return generateMockKeywords(content, count);
    }
  }
  
  // Default to mock data if not authenticated
  return generateMockKeywords(content, count);
};

/**
 * Generate secondary keyword suggestions based on primary keyword and content
 */
export const generateSecondaryKeywordSuggestions = async (
  primaryKeyword: string,
  content: string,
  count: number = 5,
  note: string = '',
  userId?: string,
  workspaceId?: string
): Promise<KeywordSuggestion[]> => {
  console.log(`Generating ${count} secondary keyword suggestions for "${primaryKeyword}"`);
  
  // Check if user is authenticated and has OpenAI API key
  if (userId && workspaceId) {
    try {
      // Get API key from database
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .eq('api_type', 'openai')
        .eq('is_active', true)
        .single();
      
      if (apiKeyError || !apiKeyData) {
        console.error("No active OpenAI API key found. Falling back to mock data.");
        return generateMockSecondaryKeywords(primaryKeyword, content, count);
      }
      
      // Use real OpenAI API
      const openaiApiKey = apiKeyData.api_key;
      
      // Record API usage
      await recordApiUsage(userId, workspaceId, 'openai', 'generate_secondary_keywords', 3);
      
      // Implement real OpenAI integration here when ready
      // For now, return mock data
      return generateMockSecondaryKeywords(primaryKeyword, content, count);
    } catch (error) {
      console.error("Error accessing API key:", error);
      return generateMockSecondaryKeywords(primaryKeyword, content, count);
    }
  }
  
  // Default to mock data if not authenticated
  return generateMockSecondaryKeywords(primaryKeyword, content, count);
};

/**
 * Extract content from a URL
 */
export const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
    const extractedContent = await extractContent(url);
    return extractedContent.content;
  } catch (error) {
    console.error("Error extracting content from URL:", error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract content from URL');
  }
};

/**
 * Extract content from a Word document - relay to documentParserService
 */
export const extractContentFromDocument = async (file: File): Promise<string> => {
  try {
    const result = await parseWordDocument(file);
    return result.html;
  } catch (error) {
    console.error("Error in OpenAI service extracting document content:", error);
    throw error;
  }
};

// Helper function to generate mock keywords
const generateMockKeywords = (content: string, count: number): KeywordSuggestion[] => {
  // Simulate API call delay
  // ... keep existing code (mock keyword generation)
  
  // Extract first 200 characters for demo purposes
  const textSample = content.replace(/<[^>]*>/g, ' ').slice(0, 200);
  console.log(`Using content sample: ${textSample}`);
  
  // Generate mock keywords based on content
  const mockKeywords = [
    'SEO optimization',
    'content marketing',
    'digital marketing',
    'search engine ranking',
    'keyword optimization',
    'website traffic',
    'online presence',
    'search visibility',
    'organic search',
    'meta description'
  ];
  
  // Arabic keywords if content contains Arabic text
  const arabicRegex = /[\u0600-\u06FF]/;
  const hasArabicText = arabicRegex.test(content);
  
  const arabicKeywords = [
    'تحسين محركات البحث',
    'تسويق المحتوى',
    'التسويق الرقمي',
    'ترتيب محركات البحث',
    'تحسين الكلمات الرئيسية',
    'حركة المرور على الموقع',
    'التواجد عبر الإنترنت',
    'الظهور في البحث',
    'البحث العضوي',
    'وصف ميتا'
  ];
  
  // Pick keywords based on content language
  const keywordsPool = hasArabicText ? arabicKeywords : mockKeywords;
  
  // Shuffle and take the first 'count' items
  const shuffled = [...keywordsPool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  return selected.map(text => ({
    id: uuidv4(),
    text
  }));
};

// Helper function to generate mock secondary keywords
const generateMockSecondaryKeywords = (primaryKeyword: string, content: string, count: number): KeywordSuggestion[] => {
  // ... keep existing code (mock secondary keyword generation)
  
  // Prepare mock data based on the primary keyword
  const mockSecondaryKeywords: Record<string, string[]> = {
    'SEO optimization': [
      'on-page SEO',
      'off-page SEO',
      'technical SEO',
      'SEO audit',
      'SEO strategy',
      'SEO tools',
      'SEO analytics'
    ],
    'content marketing': [
      'content strategy',
      'blog writing',
      'content creation',
      'content distribution',
      'editorial calendar',
      'content ROI',
      'content audit'
    ],
    'digital marketing': [
      'social media marketing',
      'email marketing',
      'PPC advertising',
      'online branding',
      'inbound marketing',
      'conversion rate optimization',
      'marketing analytics'
    ],
    'تحسين محركات البحث': [
      'تحسين المحتوى',
      'الروابط الخلفية',
      'سرعة الموقع',
      'تحليل المنافسين',
      'كلمات مفتاحية طويلة',
      'تصدر نتائج البحث',
      'تقنيات السيو'
    ],
    'تسويق المحتوى': [
      'إنشاء المحتوى',
      'استراتيجية المحتوى',
      'كتابة المقالات',
      'تسويق الفيديو',
      'محتوى تفاعلي',
      'جدولة المحتوى',
      'تحليل أداء المحتوى'
    ]
  };
  
  // Default secondary keywords if primary keyword doesn't match any in our mock data
  const defaultSecondaryKeywords = [
    'industry trends',
    'best practices',
    'case studies',
    'expert tips',
    'how-to guides',
    'common mistakes',
    'tools and resources'
  ];
  
  const arabicDefaultSecondaryKeywords = [
    'اتجاهات الصناعة',
    'أفضل الممارسات',
    'دراسات الحالة',
    'نصائح الخبراء',
    'أدلة إرشادية',
    'أخطاء شائعة',
    'أدوات وموارد'
  ];
  
  // Determine if content has Arabic text
  const arabicRegex = /[\u0600-\u06FF]/;
  const hasArabicText = arabicRegex.test(content);
  
  // Get secondary keywords for the primary keyword or use defaults
  let secondaryKeywordsPool = [];
  if (mockSecondaryKeywords[primaryKeyword]) {
    secondaryKeywordsPool = mockSecondaryKeywords[primaryKeyword];
  } else {
    // If primary keyword not found in our mock data, use default set
    secondaryKeywordsPool = hasArabicText ? arabicDefaultSecondaryKeywords : defaultSecondaryKeywords;
  }
  
  // Shuffle and take the first 'count' items
  const shuffled = [...secondaryKeywordsPool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  return selected.map(text => ({
    id: uuidv4(),
    text
  }));
};

// Helper function to record API usage
const recordApiUsage = async (userId: string, workspaceId: string, apiType: string, operation: string, credits: number) => {
  try {
    // Check if user has enough credits
    const { data: creditsData, error: creditsError } = await supabase.rpc(
      'check_user_has_credits',
      { user_id_param: userId, required_credits: credits }
    );
    
    if (creditsError || !creditsData) {
      console.error("Error checking credits or insufficient credits:", creditsError);
      return false;
    }
    
    // Record credit usage
    const { error: creditUsageError } = await supabase
      .from('credits')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        credit_amount: credits,
        transaction_type: 'used'
      });
      
    if (creditUsageError) {
      console.error("Error recording credit usage:", creditUsageError);
      return false;
    }
    
    // Record API usage
    const { error: apiUsageError } = await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        api_type: apiType,
        usage_amount: 1,
        credits_consumed: credits,
        operation_type: operation
      });
      
    if (apiUsageError) {
      console.error("Error recording API usage:", apiUsageError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error recording API usage:", error);
    return false;
  }
};
