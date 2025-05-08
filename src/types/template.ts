
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'official' | 'community' | 'yours';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  // Template settings
  businessProfile: {
    businessType: string;
    articleType: string;
    readerLevel: string;
    contentGoals: string;
  };
  aiContent: {
    aiModel: string;
    antiAiDetection: boolean;
    articleSize: string;
    creativityLevel: string;
    toneOfVoice: string;
    pointOfView: string;
    formality: string;
    includeFAQ: boolean;
    customInstructions: string;
  };
  linkingSeo: {
    enableInternalLinking: boolean;
    internalLinksCount: number;
    sitemapUrl: string;
    enableExternalLinking: boolean;
    externalLinksCount: number | 'automatic';
    automateExternalLinkSelection: boolean;
    includeExternalSources: string;
    excludeExternalSources: string;
    enableTargetPages: boolean;
    autoAssignWordPressCategory: boolean;
  };
  mediaFormatting: {
    imageSource: 'google' | 'ai' | 'none';
    imagePrompt: string;
    inArticleImagesCount: number;
    addFeaturedImage: boolean;
    embedYoutubeVideos: boolean;
    includeTables: boolean;
    includeQuotes: boolean;
    includeLists: boolean;
    includeBoldText: boolean;
    includeItalicText: boolean;
  };
}
