
import { Template } from '@/types/template';

export const templates: Template[] = [
  {
    id: '1',
    name: 'News Aggregator',
    description: 'Automatically collect and publish news from various sources with proper attribution',
    category: 'news',
    type: 'official',
    difficulty: 'beginner',
    businessProfile: {
      businessType: 'News Website',
      articleType: 'news',
      readerLevel: 'general',
      contentGoals: 'Inform readers about current events'
    },
    aiContent: {
      aiModel: 'default',
      antiAiDetection: true,
      articleSize: 'medium',
      creativityLevel: 'balanced',
      toneOfVoice: 'informative',
      pointOfView: 'third-person',
      formality: 'neutral',
      includeFAQ: false,
      customInstructions: 'Focus on factual reporting with unbiased language'
    },
    linkingSeo: {
      enableInternalLinking: true,
      internalLinksCount: 2,
      sitemapUrl: '',
      enableExternalLinking: true,
      externalLinksCount: 'automatic',
      automateExternalLinkSelection: true,
      includeExternalSources: 'trusted news outlets',
      excludeExternalSources: 'social media, forums',
      enableTargetPages: false,
      autoAssignWordPressCategory: true
    },
    mediaFormatting: {
      imageSource: 'ai',
      imagePrompt: 'News related to the article content',
      inArticleImagesCount: 1,
      addFeaturedImage: true,
      embedYoutubeVideos: false,
      includeTables: false,
      includeQuotes: true,
      includeLists: true,
      includeBoldText: true,
      includeItalicText: true
    }
  },
  {
    id: '2',
    name: 'Industry Insights',
    description: 'Create detailed analysis posts about industry trends and developments',
    category: 'business',
    type: 'official',
    difficulty: 'intermediate',
    businessProfile: {
      businessType: 'Business Consulting',
      articleType: 'analysis',
      readerLevel: 'professional',
      contentGoals: 'Provide expert analysis on industry trends'
    },
    aiContent: {
      aiModel: 'default',
      antiAiDetection: true,
      articleSize: 'long',
      creativityLevel: 'balanced',
      toneOfVoice: 'professional',
      pointOfView: 'third-person',
      formality: 'formal',
      includeFAQ: true,
      customInstructions: 'Include data-driven insights and expert perspectives'
    },
    linkingSeo: {
      enableInternalLinking: true,
      internalLinksCount: 3,
      sitemapUrl: '',
      enableExternalLinking: true,
      externalLinksCount: 5,
      automateExternalLinkSelection: false,
      includeExternalSources: 'industry reports, research papers',
      excludeExternalSources: 'promotional content',
      enableTargetPages: true,
      autoAssignWordPressCategory: true
    },
    mediaFormatting: {
      imageSource: 'ai',
      imagePrompt: 'Professional business charts and graphs',
      inArticleImagesCount: 3,
      addFeaturedImage: true,
      embedYoutubeVideos: true,
      includeTables: true,
      includeQuotes: true,
      includeLists: true,
      includeBoldText: true,
      includeItalicText: true
    }
  },
  {
    id: '3',
    name: 'Product Reviews',
    description: 'Generate comprehensive product reviews based on specifications and user feedback',
    category: 'reviews',
    type: 'official',
    difficulty: 'intermediate',
    businessProfile: {
      businessType: 'Product Review Blog',
      articleType: 'review',
      readerLevel: 'general',
      contentGoals: 'Provide detailed and unbiased product reviews'
    },
    aiContent: {
      aiModel: 'default',
      antiAiDetection: true,
      articleSize: 'medium',
      creativityLevel: 'balanced',
      toneOfVoice: 'objective',
      pointOfView: 'third-person',
      formality: 'neutral',
      includeFAQ: true,
      customInstructions: 'Include pros and cons, and compare with similar products'
    },
    linkingSeo: {
      enableInternalLinking: true,
      internalLinksCount: 2,
      sitemapUrl: '',
      enableExternalLinking: true,
      externalLinksCount: 'automatic',
      automateExternalLinkSelection: true,
      includeExternalSources: 'product websites, user reviews',
      excludeExternalSources: 'competitor websites',
      enableTargetPages: false,
      autoAssignWordPressCategory: true
    },
    mediaFormatting: {
      imageSource: 'ai',
      imagePrompt: 'Product images and lifestyle shots',
      inArticleImagesCount: 2,
      addFeaturedImage: true,
      embedYoutubeVideos: true,
      includeTables: true,
      includeQuotes: true,
      includeLists: true,
      includeBoldText: true,
      includeItalicText: true
    }
  },
  {
    id: '4',
    name: 'Recipe Collection',
    description: 'Create recipe posts with ingredients, instructions, and nutritional information',
    category: 'food',
    type: 'community',
    difficulty: 'beginner',
    businessProfile: {
      businessType: 'Food Blog',
      articleType: 'recipe',
      readerLevel: 'general',
      contentGoals: 'Share delicious and easy-to-follow recipes'
    },
    aiContent: {
      aiModel: 'default',
      antiAiDetection: false,
      articleSize: 'short',
      creativityLevel: 'high',
      toneOfVoice: 'friendly',
      pointOfView: 'second-person',
      formality: 'informal',
      includeFAQ: true,
      customInstructions: 'Add personal anecdotes and cooking tips'
    },
    linkingSeo: {
      enableInternalLinking: true,
      internalLinksCount: 3,
      sitemapUrl: '',
      enableExternalLinking: true,
      externalLinksCount: 'automatic',
      automateExternalLinkSelection: true,
      includeExternalSources: 'food blogs, cooking websites',
      excludeExternalSources: 'irrelevant content',
      enableTargetPages: false,
      autoAssignWordPressCategory: true
    },
    mediaFormatting: {
      imageSource: 'ai',
      imagePrompt: 'Delicious food photography',
      inArticleImagesCount: 3,
      addFeaturedImage: true,
      embedYoutubeVideos: true,
      includeTables: true,
      includeQuotes: true,
      includeLists: true,
      includeBoldText: true,
      includeItalicText: true
    }
  },
  {
    id: '5',
    name: 'Travel Guides',
    description: 'Generate destination guides with attractions, tips, and local insights',
    category: 'travel',
    type: 'community',
    difficulty: 'intermediate',
    businessProfile: {
      businessType: 'Travel Blog',
      articleType: 'guide',
      readerLevel: 'general',
      contentGoals: 'Provide comprehensive travel guides for various destinations'
    },
    aiContent: {
      aiModel: 'default',
      antiAiDetection: true,
      articleSize: 'long',
      creativityLevel: 'balanced',
      toneOfVoice: 'descriptive',
      pointOfView: 'third-person',
      formality: 'neutral',
      includeFAQ: true,
      customInstructions: 'Include historical facts, local customs, and practical tips'
    },
    linkingSeo: {
      enableInternalLinking: true,
      internalLinksCount: 3,
      sitemapUrl: '',
      enableExternalLinking: true,
      externalLinksCount: 'automatic',
      automateExternalLinkSelection: true,
      includeExternalSources: 'travel websites, tourism boards',
      excludeExternalSources: 'irrelevant content',
      enableTargetPages: false,
      autoAssignWordPressCategory: true
    },
    mediaFormatting: {
      imageSource: 'ai',
      imagePrompt: 'Beautiful travel photography',
      inArticleImagesCount: 4,
      addFeaturedImage: true,
      embedYoutubeVideos: true,
      includeTables: true,
      includeQuotes: true,
      includeLists: true,
      includeBoldText: true,
      includeItalicText: true
    }
  },
  {
    id: '6',
    name: 'Tech Tutorial',
    description: 'Create step-by-step tutorials for software and technology topics',
    category: 'technology',
    type: 'yours',
    difficulty: 'advanced',
    businessProfile: {
      businessType: 'Tech Blog',
      articleType: 'tutorial',
      readerLevel: 'technical',
      contentGoals: 'Provide clear and detailed tech tutorials'
    },
    aiContent: {
      aiModel: 'default',
      antiAiDetection: true,
      articleSize: 'long',
      creativityLevel: 'low',
      toneOfVoice: 'technical',
      pointOfView: 'third-person',
      formality: 'formal',
      includeFAQ: true,
      customInstructions: 'Include code snippets, screenshots, and troubleshooting tips'
    },
    linkingSeo: {
      enableInternalLinking: true,
      internalLinksCount: 4,
      sitemapUrl: '',
      enableExternalLinking: true,
      externalLinksCount: 6,
      automateExternalLinkSelection: false,
      includeExternalSources: 'official documentation, developer blogs',
      excludeExternalSources: 'forums, social media',
      enableTargetPages: true,
      autoAssignWordPressCategory: true
    },
    mediaFormatting: {
      imageSource: 'ai',
      imagePrompt: 'Software screenshots and diagrams',
      inArticleImagesCount: 5,
      addFeaturedImage: true,
      embedYoutubeVideos: true,
      includeTables: true,
      includeQuotes: true,
      includeLists: true,
      includeBoldText: true,
      includeItalicText: true
    }
  }
];
