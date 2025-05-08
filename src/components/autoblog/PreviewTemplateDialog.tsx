
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import wizard step components
import BusinessProfileStep from '@/components/wizard/BusinessProfileStep';
import AiContentGenerationStep from '@/components/wizard/AiContentGenerationStep';
import LinkingSeoStep from '@/components/wizard/LinkingSeoStep';
import MediaFormattingStep from '@/components/wizard/MediaFormattingStep';

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

interface PreviewTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

const PreviewTemplateDialog: React.FC<PreviewTemplateDialogProps> = ({
  open,
  onOpenChange,
  template,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('business');

  if (!template) return null;

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

  const handleUseTemplate = () => {
    navigate(`/autoblog/create?template=${template.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <p className="text-gray-600 mt-1">{template.description}</p>
            </div>
            <Badge className={getTypeColor(template.type)}>
              {template.type === 'official' ? 'Official' : 
              template.type === 'community' ? 'Community' : 'Yours'}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="business">Business Profile</TabsTrigger>
              <TabsTrigger value="ai">AI Content</TabsTrigger>
              <TabsTrigger value="linking">Linking & SEO</TabsTrigger>
              <TabsTrigger value="media">Media & Format</TabsTrigger>
            </TabsList>
            
            <TabsContent value="business">
              <BusinessProfileStep
                businessType={template.businessProfile.businessType}
                articleType={template.businessProfile.articleType}
                readerLevel={template.businessProfile.readerLevel}
                contentGoals={template.businessProfile.contentGoals}
                onUpdate={() => {}} // Read-only in preview
                readOnly={true}
              />
            </TabsContent>
            
            <TabsContent value="ai">
              <AiContentGenerationStep
                aiModel={template.aiContent.aiModel}
                antiAiDetection={template.aiContent.antiAiDetection}
                articleSize={template.aiContent.articleSize}
                creativityLevel={template.aiContent.creativityLevel}
                toneOfVoice={template.aiContent.toneOfVoice}
                pointOfView={template.aiContent.pointOfView}
                formality={template.aiContent.formality}
                includeFAQ={template.aiContent.includeFAQ}
                customInstructions={template.aiContent.customInstructions}
                onUpdate={() => {}} // Read-only in preview
                readOnly={true}
              />
            </TabsContent>
            
            <TabsContent value="linking">
              <LinkingSeoStep
                enableInternalLinking={template.linkingSeo.enableInternalLinking}
                internalLinksCount={template.linkingSeo.internalLinksCount}
                sitemapUrl={template.linkingSeo.sitemapUrl}
                enableExternalLinking={template.linkingSeo.enableExternalLinking}
                externalLinksCount={template.linkingSeo.externalLinksCount}
                automateExternalLinkSelection={template.linkingSeo.automateExternalLinkSelection}
                includeExternalSources={template.linkingSeo.includeExternalSources}
                excludeExternalSources={template.linkingSeo.excludeExternalSources}
                enableTargetPages={template.linkingSeo.enableTargetPages}
                autoAssignWordPressCategory={template.linkingSeo.autoAssignWordPressCategory}
                onUpdate={() => {}} // Read-only in preview
                readOnly={true}
              />
            </TabsContent>
            
            <TabsContent value="media">
              <MediaFormattingStep
                imageSource={template.mediaFormatting.imageSource}
                imagePrompt={template.mediaFormatting.imagePrompt}
                inArticleImagesCount={template.mediaFormatting.inArticleImagesCount}
                addFeaturedImage={template.mediaFormatting.addFeaturedImage}
                embedYoutubeVideos={template.mediaFormatting.embedYoutubeVideos}
                includeTables={template.mediaFormatting.includeTables}
                includeQuotes={template.mediaFormatting.includeQuotes}
                includeLists={template.mediaFormatting.includeLists}
                includeBoldText={template.mediaFormatting.includeBoldText}
                includeItalicText={template.mediaFormatting.includeItalicText}
                onUpdate={() => {}} // Read-only in preview
                readOnly={true}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex justify-end pt-4 border-t">
          <Button
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            onClick={handleUseTemplate}
          >
            Use Template <ArrowRight size={14} className="ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewTemplateDialog;
