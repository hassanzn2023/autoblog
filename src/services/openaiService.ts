
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { extractContentFromUrl } from './contentExtractorService';
import { parseWordDocument } from './documentParserService';

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
  note: string = ''
): Promise<KeywordSuggestion[]> => {
  console.log(`Generating ${count} keyword suggestions`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
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

/**
 * Generate secondary keyword suggestions based on primary keyword and content
 */
export const generateSecondaryKeywordSuggestions = async (
  primaryKeyword: string,
  content: string,
  count: number = 5,
  note: string = ''
): Promise<KeywordSuggestion[]> => {
  console.log(`Generating ${count} secondary keyword suggestions for "${primaryKeyword}"`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Prepare mock data based on the primary keyword
  const mockSecondaryKeywords = {
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

/**
 * Extract content from a URL - relay to contentExtractorService
 */
export const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
    const result = await extractContentFromUrl(url);
    return result.content;
  } catch (error) {
    console.error("Error in OpenAI service extracting URL content:", error);
    throw error;
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
