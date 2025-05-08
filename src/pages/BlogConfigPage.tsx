
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import BasicSetupStep from '@/components/wizard/BasicSetupStep';
import BusinessProfileStep from '@/components/wizard/BusinessProfileStep';
import TopicFoundationStep from '@/components/wizard/TopicFoundationStep';
import AiContentGenerationStep from '@/components/wizard/AiContentGenerationStep';
import LinkingSeoStep from '@/components/wizard/LinkingSeoStep';
import MediaFormattingStep from '@/components/wizard/MediaFormattingStep';
import SchedulingIntegrationStep from '@/components/wizard/SchedulingIntegrationStep';
import ReviewSaveStep from '@/components/wizard/ReviewSaveStep';

const BlogConfigPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);
  
  // Blog basic information
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  
  // Business Profile state
  const [businessType, setBusinessType] = useState('blogger');
  const [articleType, setArticleType] = useState('blog');
  const [readerLevel, setReaderLevel] = useState('beginners');
  const [contentGoals, setContentGoals] = useState('');
  
  // Topic Foundation state
  const [researchMethod, setResearchMethod] = useState('ai-web');
  const [competitorLinks, setCompetitorLinks] = useState(5);
  const [topicInputMethod, setTopicInputMethod] = useState('copy-paste');
  const [topics, setTopics] = useState('');
  const [targetCountry, setTargetCountry] = useState('us');
  const [language, setLanguage] = useState('en');
  const [contentDescription, setContentDescription] = useState('');
  
  // AI Generation state
  const [aiModel, setAiModel] = useState('default');
  const [antiAiDetection, setAntiAiDetection] = useState(false);
  const [articleSize, setArticleSize] = useState('detailed');
  const [creativityLevel, setCreativityLevel] = useState('balanced');
  const [toneOfVoice, setToneOfVoice] = useState('neutral');
  const [pointOfView, setPointOfView] = useState('automatic');
  const [formality, setFormality] = useState('automatic');
  const [includeFAQ, setIncludeFAQ] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Linking & SEO state
  const [enableInternalLinking, setEnableInternalLinking] = useState(true);
  const [internalLinksCount, setInternalLinksCount] = useState(3);
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [enableExternalLinking, setEnableExternalLinking] = useState(true);
  const [externalLinksCount, setExternalLinksCount] = useState<number | 'automatic'>('automatic');
  const [automateExternalLinkSelection, setAutomateExternalLinkSelection] = useState(true);
  const [includeExternalSources, setIncludeExternalSources] = useState('');
  const [excludeExternalSources, setExcludeExternalSources] = useState('');
  const [enableTargetPages, setEnableTargetPages] = useState(false);
  const [autoAssignWordPressCategory, setAutoAssignWordPressCategory] = useState(false);
  
  // Media & Formatting state
  const [imageSource, setImageSource] = useState<'google' | 'ai' | 'none'>('ai');
  const [imagePrompt, setImagePrompt] = useState('');
  const [inArticleImagesCount, setInArticleImagesCount] = useState(3);
  const [addFeaturedImage, setAddFeaturedImage] = useState(true);
  const [embedYoutubeVideos, setEmbedYoutubeVideos] = useState(false);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeQuotes, setIncludeQuotes] = useState(true);
  const [includeLists, setIncludeLists] = useState(true);
  const [includeBoldText, setIncludeBoldText] = useState(true);
  const [includeItalicText, setIncludeItalicText] = useState(true);
  
  // Scheduling & Integration state
  const [integration, setIntegration] = useState('wordpress');
  const [articlesPerBatch, setArticlesPerBatch] = useState(10);
  const [interval, setInterval] = useState('weekly');
  const [randomizePublishingTime, setRandomizePublishingTime] = useState(false);
  
  // Review & Save state
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Define handleSave function before using it
  const handleSave = () => {
    // Here would be logic to save the configuration
    toast({
      title: "Configuration Saved",
      description: `Project "${projectName}" has been successfully saved.`,
    });
    // Redirect back to the blog projects page
    navigate('/blog/create');
  };
  
  useEffect(() => {
    // In a real app, you would fetch the project data if editing (id !== 'new')
    if (id === 'new') {
      // Parse the name from query string if creating a new project
      const searchParams = new URLSearchParams(location.search);
      const nameFromQuery = searchParams.get('name');
      setProjectName(nameFromQuery || 'New Project');
    } else if (id === '1') {
      setProjectName('Default Project');
    } else if (id === '2') {
      setProjectName('My Blog');
    }
  }, [id, location.search]);
  
  const handleUpdate = (field: string, value: any) => {
    // Update the appropriate field based on the input
    switch (field) {
      // Basic Info
      case 'name': setProjectName(value); break;
      case 'description': setProjectDescription(value); break;
      
      // Business Profile
      case 'businessType': setBusinessType(value); break;
      case 'articleType': setArticleType(value); break;
      case 'readerLevel': setReaderLevel(value); break;
      case 'contentGoals': setContentGoals(value); break;
      
      // Topic Foundation
      case 'researchMethod': setResearchMethod(value); break;
      case 'competitorLinks': setCompetitorLinks(value); break;
      case 'topicInputMethod': setTopicInputMethod(value); break;
      case 'topics': setTopics(value); break;
      case 'targetCountry': setTargetCountry(value); break;
      case 'language': setLanguage(value); break;
      case 'contentDescription': setContentDescription(value); break;
      
      // AI Generation
      case 'aiModel': setAiModel(value); break;
      case 'antiAiDetection': setAntiAiDetection(value); break;
      case 'articleSize': setArticleSize(value); break;
      case 'creativityLevel': setCreativityLevel(value); break;
      case 'toneOfVoice': setToneOfVoice(value); break;
      case 'pointOfView': setPointOfView(value); break;
      case 'formality': setFormality(value); break;
      case 'includeFAQ': setIncludeFAQ(value); break;
      case 'customInstructions': setCustomInstructions(value); break;
      
      // Linking & SEO
      case 'enableInternalLinking': setEnableInternalLinking(value); break;
      case 'internalLinksCount': setInternalLinksCount(value); break;
      case 'sitemapUrl': setSitemapUrl(value); break;
      case 'enableExternalLinking': setEnableExternalLinking(value); break;
      case 'externalLinksCount': setExternalLinksCount(value); break;
      case 'automateExternalLinkSelection': setAutomateExternalLinkSelection(value); break;
      case 'includeExternalSources': setIncludeExternalSources(value); break;
      case 'excludeExternalSources': setExcludeExternalSources(value); break;
      case 'enableTargetPages': setEnableTargetPages(value); break;
      case 'autoAssignWordPressCategory': setAutoAssignWordPressCategory(value); break;
      
      // Media & Formatting
      case 'imageSource': setImageSource(value); break;
      case 'imagePrompt': setImagePrompt(value); break;
      case 'inArticleImagesCount': setInArticleImagesCount(value); break;
      case 'addFeaturedImage': setAddFeaturedImage(value); break;
      case 'embedYoutubeVideos': setEmbedYoutubeVideos(value); break;
      case 'includeTables': setIncludeTables(value); break;
      case 'includeQuotes': setIncludeQuotes(value); break;
      case 'includeLists': setIncludeLists(value); break;
      case 'includeBoldText': setIncludeBoldText(value); break;
      case 'includeItalicText': setIncludeItalicText(value); break;
      
      // Scheduling & Integration
      case 'integration': setIntegration(value); break;
      case 'articlesPerBatch': setArticlesPerBatch(value); break;
      case 'interval': setInterval(value); break;
      case 'randomizePublishingTime': setRandomizePublishingTime(value); break;
      
      // Review & Save
      case 'saveAsTemplate': setSaveAsTemplate(value); break;
    }
  };

  // Steps configuration
  const wizardSteps = [
    {
      id: 'basic-setup',
      title: 'Basic Setup',
      visibleFor: 'all' as const,
      component: (
        <BasicSetupStep
          configType="blog"
          name={projectName}
          description={projectDescription}
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'business-profile',
      title: 'Business & Content Profile',
      visibleFor: 'all' as const,
      component: (
        <BusinessProfileStep
          businessType={businessType}
          articleType={articleType}
          readerLevel={readerLevel}
          contentGoals={contentGoals}
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'topic-foundation',
      title: 'Topic & Content Foundation',
      visibleFor: 'all' as const,
      component: (
        <TopicFoundationStep
          configType="blog"
          researchMethod={researchMethod}
          competitorLinks={competitorLinks}
          topicInputMethod={topicInputMethod}
          topics={topics}
          targetCountry={targetCountry}
          language={language}
          contentDescription={contentDescription}
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'ai-generation',
      title: 'AI & Content Generation',
      visibleFor: 'all' as const,
      component: (
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
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'linking-seo',
      title: 'Linking & SEO',
      visibleFor: 'all' as const,
      component: (
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
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'media-formatting',
      title: 'Media & Formatting',
      visibleFor: 'all' as const,
      component: (
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
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'scheduling',
      title: 'Scheduling & Integration',
      visibleFor: 'all' as const,
      component: (
        <SchedulingIntegrationStep
          configType="blog"
          integration={integration}
          articlesPerBatch={articlesPerBatch}
          interval={interval}
          randomizePublishingTime={randomizePublishingTime}
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'review-save',
      title: 'Review & Save',
      visibleFor: 'all' as const,
      component: (
        <ReviewSaveStep
          configType="blog"
          configSummary={{
            campaignName: projectName,  // Changed from projectName to campaignName to match the interface
            description: projectDescription || 'N/A',
            businessType: businessType || 'Blogger',
            articleType: articleType || 'Blog Posts',
            readerLevel: readerLevel || 'Beginners',
            research: researchMethod === 'ai-web' ? 'AI Web Research' : 'Custom Sources',
            targetCountry: targetCountry === 'us' ? 'United States' : targetCountry,
            language: language === 'en' ? 'English' : language,
            aiModel: aiModel || 'Default',
            articleSize: articleSize || 'Detailed (1800-2799 words)',
            tone: toneOfVoice || 'neutral',
            internalLinking: enableInternalLinking ? `Enabled (${internalLinksCount} links)` : 'Disabled',
          }}
          saveAsTemplate={saveAsTemplate}
          onUpdate={handleUpdate}
          onSave={handleSave}
        />
      ),
    },
  ];

  // Filter steps based on the configuration type
  const visibleSteps = wizardSteps.filter(step => 
    step.visibleFor === 'all' || step.visibleFor === 'blog'
  );

  const handleNext = () => {
    if (activeStep < visibleSteps.length - 1) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Configure Project: {projectName}</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Steps Navigation */}
        <div className="w-full md:w-1/4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Project: {projectName}</h2>
            <p className="text-sm text-gray-500">Configuration Steps</p>
          </div>
          <div className="space-y-1 p-2">
            {visibleSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-full text-left px-4 py-3 rounded-md text-sm transition-colors ${
                  index === activeStep
                    ? 'bg-purple-50 text-[#6e41e2] border-l-4 border-[#6e41e2]'
                    : 'hover:bg-gray-100'
                }`}
              >
                Step {index + 1}: {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full md:w-3/4 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">{visibleSteps[activeStep].title}</h2>
          
          <div className="min-h-[300px] mb-4">
            {visibleSteps[activeStep].component}
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {activeStep > 0 ? (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {activeStep < visibleSteps.length - 1 ? (
              <Button
                className="bg-[#6e41e2] hover:bg-[#5a35c8] text-white"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogConfigPage;
