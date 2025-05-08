import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import CreateTemplateDialog from '@/components/autoblog/CreateTemplateDialog';
import PreviewTemplateDialog from '@/components/autoblog/PreviewTemplateDialog';

interface Template {
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

const AutoblogTemplatePage = () => {
  const navigate = useNavigate();
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [isPreviewTemplateDialogOpen, setIsPreviewTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const templates: Template[] = [
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

  const handleUseTemplate = (templateId: string) => {
    // Navigate to create page with template ID
    navigate(`/autoblog/create?template=${templateId}`);
  };
  
  const handleCreateTemplate = () => {
    setIsCreateTemplateDialogOpen(true);
  };
  
  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewTemplateDialogOpen(true);
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'official':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'community':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'yours':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="w-full bg-gray-50 px-6 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Autoblog Templates</h1>
            <p className="text-gray-600 mt-1">Start with a template or create your own</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.open('https://docs.lovable.dev/user-guides/autoblog-templates', '_blank')}
            >
              <BookOpen size={16} />
              Template Guides
            </Button>
            <Button
              className="bg-[#F76D01] hover:bg-[#e65d00] text-white flex items-center gap-2"
              onClick={handleCreateTemplate}
            >
              <PlusCircle size={16} />
              Create Custom Template
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="official">Official</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="yours">Your Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <TemplateCard 
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  onPreview={handlePreviewTemplate}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="official">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(template => template.type === 'official')
                .map(template => (
                  <TemplateCard 
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                    onPreview={handlePreviewTemplate}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="community">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(template => template.type === 'community')
                .map(template => (
                  <TemplateCard 
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                    onPreview={handlePreviewTemplate}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="yours">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(template => template.type === 'yours')
                .map(template => (
                  <TemplateCard 
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                    onPreview={handlePreviewTemplate}
                  />
                ))}
              
              <Card className="border-dashed border-2 flex flex-col items-center justify-center hover:border-[#F76D01] transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-[#FFF3EB] rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusCircle size={24} className="text-[#F76D01]" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Create Custom Template</h3>
                  <p className="text-gray-500 mb-6">
                    Design your own autoblog template to reuse or share with others
                  </p>
                  <Button
                    className="bg-white hover:bg-gray-50 text-[#F76D01] border border-[#F76D01]"
                    onClick={handleCreateTemplate}
                  >
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <CreateTemplateDialog 
        open={isCreateTemplateDialogOpen}
        onOpenChange={setIsCreateTemplateDialogOpen}
      />

      <PreviewTemplateDialog
        open={isPreviewTemplateDialogOpen}
        onOpenChange={setIsPreviewTemplateDialogOpen}
        template={selectedTemplate}
      />
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  onUse: (id: string) => void;
  onPreview: (template: Template) => void;
}

const TemplateCard = ({ template, onUse, onPreview }: TemplateCardProps) => {
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'official':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'community':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'yours':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge className={getTypeColor(template.type)}>
              {template.type === 'official' ? 'Official' : 
               template.type === 'community' ? 'Community' : 'Yours'}
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-1">{template.description}</CardDescription>
      </CardHeader>
      <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between p-3">
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600"
          onClick={() => onPreview(template)}
        >
          Preview
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600"
          >
            <Copy size={16} />
          </Button>
          <Button
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            size="sm"
            onClick={() => onUse(template.id)}
          >
            Use Template <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AutoblogTemplatePage;
