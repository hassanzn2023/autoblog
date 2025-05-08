
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import BasicSetupStep from '@/components/wizard/BasicSetupStep';
import BusinessProfileStep from '@/components/wizard/BusinessProfileStep';
import TopicFoundationStep from '@/components/wizard/TopicFoundationStep';
import KeywordResearchStep from '@/components/wizard/KeywordResearchStep';
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
  
  // Keyword Research state
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  
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
  
  // Title Selection state
  const [selectedTitle, setSelectedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  
  // Content Outline state
  const [outlineTemplate, setOutlineTemplate] = useState(1);
  const [customOutline, setCustomOutline] = useState('');
  
  // Scheduling & Integration state
  const [integration, setIntegration] = useState('wordpress');
  const [publishStatus, setPublishStatus] = useState('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  
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
    navigate('/blog');
  };
  
  useEffect(() => {
    // In a real app, you would fetch the project data if editing (id !== 'new')
    if (id === 'new') {
      // Parse the name from query string if creating a new project
      const searchParams = new URLSearchParams(location.search);
      const nameFromQuery = searchParams.get('name');
      setProjectName(nameFromQuery || 'My First Blog');
    } else if (id === '1') {
      setProjectName('My First Blog');
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
      
      // Keyword Research
      case 'primaryKeyword': setPrimaryKeyword(value); break;
      case 'secondaryKeywords': setSecondaryKeywords(value); break;
      
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
      
      // Title Selection
      case 'selectedTitle': setSelectedTitle(value); break;
      case 'customTitle': setCustomTitle(value); break;
      
      // Content Outline
      case 'outlineTemplate': setOutlineTemplate(value); break;
      case 'customOutline': setCustomOutline(value); break;
      
      // Scheduling & Integration
      case 'integration': setIntegration(value); break;
      case 'publishStatus': setPublishStatus(value); break;
      case 'scheduledDate': setScheduledDate(value); break;
      
      // Review & Save
      case 'saveAsTemplate': setSaveAsTemplate(value); break;
    }
  };

  // Steps configuration
  const wizardSteps = [
    {
      id: 'basic-setup',
      title: 'Basic Setup',
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
      id: 'keyword-research',
      title: 'Keyword Research',
      component: (
        <KeywordResearchStep
          primaryKeyword={primaryKeyword}
          secondaryKeywords={secondaryKeywords}
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'ai-generation',
      title: 'AI & Content Generation',
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
      id: 'select-title',
      title: 'Select a Title',
      component: (
        <div className="space-y-6">
          <p className="text-sm">Select a title that captures and reflects the essence of your article as well as your chosen primary keyword for maximum SEO impact. You can also use your own title.</p>
          
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm">Generate more</Button>
              <Button variant="outline" size="sm">Show SERP Ranking</Button>
            </div>
            
            <div className="space-y-2">
              <div className="border border-purple-300 bg-purple-50 p-3 rounded-md flex justify-between items-center">
                <span>Speed Test Guide: What Really Affects Your Internet Speed in 2025</span>
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">AI Recommended</span>
              </div>
              
              <div className="border p-3 rounded-md hover:bg-gray-50">
                Why Your Speed Test Results Are Wrong (And How to Fix It)
              </div>
              
              <div className="border p-3 rounded-md hover:bg-gray-50">
                The Truth About Speed Tests: What Internet Companies Don't Tell You
              </div>
              
              <div className="border p-3 rounded-md hover:bg-gray-50">
                Speed Test Secrets: A Simple Guide to Accurate Internet Testing
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Add Your Own</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your title here..."
                className="flex-1 border rounded-md px-3 py-2"
                value={customTitle}
                onChange={(e) => handleUpdate('customTitle', e.target.value)}
              />
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'content-outline',
      title: 'Content Outline',
      component: (
        <div className="space-y-6">
          <p className="text-sm">Choose an outline that best represents the structure and flow you envision for your article.</p>
          
          <div className="flex gap-2 mb-4">
            <Button
              variant={outlineTemplate === 1 ? "default" : "outline"}
              className={outlineTemplate === 1 ? "bg-purple-600 hover:bg-purple-700" : ""}
              onClick={() => handleUpdate('outlineTemplate', 1)}
            >
              Outline 1
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <span>✏️</span> Write your own
            </Button>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Predefined Outline 1 (Placeholder)</h3>
            
            <div className="space-y-1">
              <p><strong>Introduction:</strong> Hook, Thesis Statement</p>
              <p><strong>H2: Understanding Internet Speed Tests</strong></p>
              <p className="ml-4">H3: What do speed tests measure?</p>
              <p className="ml-4">H3: Common misconceptions</p>
              <p><strong>H2: Factors Affecting Accuracy</strong></p>
              <p className="ml-4">H3: Your internet plan</p>
              <p className="ml-4">H3: Router and Modem</p>
              <p className="ml-4">H3: Testing Server Location</p>
              <p><strong>Conclusion:</strong> Summary, Call to Action</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'scheduling',
      title: 'Scheduling & Integration',
      component: (
        <SchedulingIntegrationStep
          configType="blog"
          integration={integration}
          publishStatus={publishStatus}
          scheduledDate={scheduledDate}
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      id: 'review-save',
      title: 'Review & Save',
      component: (
        <ReviewSaveStep
          configType="blog"
          configSummary={{
            campaignName: projectName,
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

  const handleNext = () => {
    if (activeStep < wizardSteps.length - 1) {
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
  
  // Calculate step name from step index + 1
  const getStepName = (index: number) => `Step ${index + 1}: ${wizardSteps[index].title}`;
  
  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Configure Blog Project: {projectName}</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Steps Navigation */}
        <div className="w-full md:w-1/4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="space-y-1 p-2">
            {wizardSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-full text-left px-4 py-3 rounded-md text-sm transition-colors ${
                  index === activeStep
                    ? 'bg-purple-50 text-purple-800 border-l-4 border-purple-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                {getStepName(index)}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full md:w-3/4 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">{getStepName(activeStep)}</h2>
          
          <div className="min-h-[300px] mb-6">
            {wizardSteps[activeStep].component}
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {activeStep > 0 ? (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {activeStep < wizardSteps.length - 1 ? (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSave}
              >
                Save Project Configuration
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogConfigPage;
