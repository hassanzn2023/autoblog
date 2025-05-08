
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Import wizard components
import BusinessProfileStep from '@/components/wizard/BusinessProfileStep';
import AiContentGenerationStep from '@/components/wizard/AiContentGenerationStep';
import LinkingSeoStep from '@/components/wizard/LinkingSeoStep';
import MediaFormattingStep from '@/components/wizard/MediaFormattingStep';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState('basics');
  
  // Template basic information
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  // Business profile settings
  const [businessType, setBusinessType] = useState('');
  const [articleType, setArticleType] = useState('blog');
  const [readerLevel, setReaderLevel] = useState('');
  const [contentGoals, setContentGoals] = useState('');
  
  // AI content generation settings
  const [aiModel, setAiModel] = useState('default');
  const [antiAiDetection, setAntiAiDetection] = useState(false);
  const [articleSize, setArticleSize] = useState('medium');
  const [creativityLevel, setCreativityLevel] = useState('balanced');
  const [toneOfVoice, setToneOfVoice] = useState('conversational');
  const [pointOfView, setPointOfView] = useState('second-person');
  const [formality, setFormality] = useState('neutral');
  const [includeFAQ, setIncludeFAQ] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Linking & SEO settings
  const [enableInternalLinking, setEnableInternalLinking] = useState(true);
  const [internalLinksCount, setInternalLinksCount] = useState(3);
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [enableExternalLinking, setEnableExternalLinking] = useState(true);
  const [externalLinksCount, setExternalLinksCount] = useState<number | 'automatic'>('automatic');
  const [automateExternalLinkSelection, setAutomateExternalLinkSelection] = useState(true);
  const [includeExternalSources, setIncludeExternalSources] = useState('');
  const [excludeExternalSources, setExcludeExternalSources] = useState('');
  const [enableTargetPages, setEnableTargetPages] = useState(false);
  const [autoAssignWordPressCategory, setAutoAssignWordPressCategory] = useState(true);
  
  // Media and formatting settings
  const [imageSource, setImageSource] = useState<'google' | 'ai' | 'none'>('ai');
  const [imagePrompt, setImagePrompt] = useState('');
  const [inArticleImagesCount, setInArticleImagesCount] = useState(2);
  const [addFeaturedImage, setAddFeaturedImage] = useState(true);
  const [embedYoutubeVideos, setEmbedYoutubeVideos] = useState(false);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeQuotes, setIncludeQuotes] = useState(true);
  const [includeLists, setIncludeLists] = useState(true);
  const [includeBoldText, setIncludeBoldText] = useState(true);
  const [includeItalicText, setIncludeItalicText] = useState(true);
  
  const handleUpdateBusinessProfile = (field: string, value: string) => {
    switch(field) {
      case 'businessType':
        setBusinessType(value);
        break;
      case 'articleType':
        setArticleType(value);
        break;
      case 'readerLevel':
        setReaderLevel(value);
        break;
      case 'contentGoals':
        setContentGoals(value);
        break;
    }
  };
  
  const handleUpdateAiContent = (field: string, value: any) => {
    switch(field) {
      case 'aiModel':
        setAiModel(value);
        break;
      case 'antiAiDetection':
        setAntiAiDetection(value);
        break;
      case 'articleSize':
        setArticleSize(value);
        break;
      case 'creativityLevel':
        setCreativityLevel(value);
        break;
      case 'toneOfVoice':
        setToneOfVoice(value);
        break;
      case 'pointOfView':
        setPointOfView(value);
        break;
      case 'formality':
        setFormality(value);
        break;
      case 'includeFAQ':
        setIncludeFAQ(value);
        break;
      case 'customInstructions':
        setCustomInstructions(value);
        break;
    }
  };
  
  const handleUpdateLinkingSeo = (field: string, value: any) => {
    switch(field) {
      case 'enableInternalLinking':
        setEnableInternalLinking(value);
        break;
      case 'internalLinksCount':
        setInternalLinksCount(value);
        break;
      case 'sitemapUrl':
        setSitemapUrl(value);
        break;
      case 'enableExternalLinking':
        setEnableExternalLinking(value);
        break;
      case 'externalLinksCount':
        setExternalLinksCount(value);
        break;
      case 'automateExternalLinkSelection':
        setAutomateExternalLinkSelection(value);
        break;
      case 'includeExternalSources':
        setIncludeExternalSources(value);
        break;
      case 'excludeExternalSources':
        setExcludeExternalSources(value);
        break;
      case 'enableTargetPages':
        setEnableTargetPages(value);
        break;
      case 'autoAssignWordPressCategory':
        setAutoAssignWordPressCategory(value);
        break;
    }
  };
  
  const handleUpdateMediaFormatting = (field: string, value: any) => {
    switch(field) {
      case 'imageSource':
        setImageSource(value);
        break;
      case 'imagePrompt':
        setImagePrompt(value);
        break;
      case 'inArticleImagesCount':
        setInArticleImagesCount(value);
        break;
      case 'addFeaturedImage':
        setAddFeaturedImage(value);
        break;
      case 'embedYoutubeVideos':
        setEmbedYoutubeVideos(value);
        break;
      case 'includeTables':
        setIncludeTables(value);
        break;
      case 'includeQuotes':
        setIncludeQuotes(value);
        break;
      case 'includeLists':
        setIncludeLists(value);
        break;
      case 'includeBoldText':
        setIncludeBoldText(value);
        break;
      case 'includeItalicText':
        setIncludeItalicText(value);
        break;
    }
  };
  
  const handleSaveTemplate = () => {
    // Basic validation
    if (!templateName.trim()) {
      toast.error("Please provide a template name");
      return;
    }
    
    // Here you would typically save the template data to your backend
    // For now, we'll just show a success message
    toast.success("Template saved successfully!");
    onOpenChange(false);
    
    // Reset form after successful save
    resetForm();
  };
  
  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setActiveTab('basics');
    
    // Reset all other form values to defaults
    setBusinessType('');
    setArticleType('blog');
    setReaderLevel('');
    setContentGoals('');
    
    setAiModel('default');
    setAntiAiDetection(false);
    setArticleSize('medium');
    setCreativityLevel('balanced');
    setToneOfVoice('conversational');
    setPointOfView('second-person');
    setFormality('neutral');
    setIncludeFAQ(true);
    setCustomInstructions('');
    
    setEnableInternalLinking(true);
    setInternalLinksCount(3);
    setSitemapUrl('');
    setEnableExternalLinking(true);
    setExternalLinksCount('automatic');
    setAutomateExternalLinkSelection(true);
    setIncludeExternalSources('');
    setExcludeExternalSources('');
    setEnableTargetPages(false);
    setAutoAssignWordPressCategory(true);
    
    setImageSource('ai');
    setImagePrompt('');
    setInArticleImagesCount(2);
    setAddFeaturedImage(true);
    setEmbedYoutubeVideos(false);
    setIncludeTables(true);
    setIncludeQuotes(true);
    setIncludeLists(true);
    setIncludeBoldText(true);
    setIncludeItalicText(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Template</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="basics">Template Basics</TabsTrigger>
              <TabsTrigger value="business">Business Profile</TabsTrigger>
              <TabsTrigger value="ai">AI Content</TabsTrigger>
              <TabsTrigger value="linking">Linking & SEO</TabsTrigger>
              <TabsTrigger value="media">Media & Format</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name*</Label>
                <Input 
                  id="templateName" 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter a name for your template"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="templateDescription">Description</Label>
                <Textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Enter a brief description for this template"
                  rows={4}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="business">
              <BusinessProfileStep
                businessType={businessType}
                articleType={articleType}
                readerLevel={readerLevel}
                contentGoals={contentGoals}
                onUpdate={handleUpdateBusinessProfile}
              />
            </TabsContent>
            
            <TabsContent value="ai">
              <AiContentGenerationStep
                aiModel={aiModel}
                antiAiDetection={antiAiDetection}
                articleSize={articleSize}
                creativityLevel={creativityLevel}
                toneOfVoice={toneOfVoice}
                pointOfView={pointOfView}
                formality={formality}
                includeFAQ={includeFAQ}
                customInstructions={customInstructions}
                onUpdate={handleUpdateAiContent}
              />
            </TabsContent>
            
            <TabsContent value="linking">
              <LinkingSeoStep
                enableInternalLinking={enableInternalLinking}
                internalLinksCount={internalLinksCount}
                sitemapUrl={sitemapUrl}
                enableExternalLinking={enableExternalLinking}
                externalLinksCount={externalLinksCount}
                automateExternalLinkSelection={automateExternalLinkSelection}
                includeExternalSources={includeExternalSources}
                excludeExternalSources={excludeExternalSources}
                enableTargetPages={enableTargetPages}
                autoAssignWordPressCategory={autoAssignWordPressCategory}
                onUpdate={handleUpdateLinkingSeo}
              />
            </TabsContent>
            
            <TabsContent value="media">
              <MediaFormattingStep
                imageSource={imageSource}
                imagePrompt={imagePrompt}
                inArticleImagesCount={inArticleImagesCount}
                addFeaturedImage={addFeaturedImage}
                embedYoutubeVideos={embedYoutubeVideos}
                includeTables={includeTables}
                includeQuotes={includeQuotes}
                includeLists={includeLists}
                includeBoldText={includeBoldText}
                includeItalicText={includeItalicText}
                onUpdate={handleUpdateMediaFormatting}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                const prevTab = {
                  'basics': 'basics',
                  'business': 'basics',
                  'ai': 'business',
                  'linking': 'ai',
                  'media': 'linking'
                }[activeTab];
                setActiveTab(prevTab);
              }}
              disabled={activeTab === 'basics'}
            >
              Previous
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                const nextTab = {
                  'basics': 'business',
                  'business': 'ai',
                  'ai': 'linking',
                  'linking': 'media',
                  'media': 'media'
                }[activeTab];
                setActiveTab(nextTab);
              }}
              disabled={activeTab === 'media'}
            >
              Next
            </Button>
          </div>
          
          <Button 
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            onClick={handleSaveTemplate}
          >
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateDialog;
