import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, ChevronDown, X, AlertTriangle, Loader, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAPIKeys } from '@/contexts/APIKeysContext';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions } from '@/services/openaiService';
import { extractContentFromUrl } from '@/services/contentExtractorService';
import CreditStatus from './CreditStatus';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProModeForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { useCredits, remainingCredits } = useSubscription();
  const { getAPIKey } = useAPIKeys();
  
  const [content, setContent] = useState('');
  const [contentMethod, setContentMethod] = useState<'text' | 'link' | 'file'>('text');
  const [contentConfirmed, setContentConfirmed] = useState(false);
  const [activeStep, setActiveStep] = useState<string>("add-content");
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<{id: string, text: string}[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [extractionAttempts, setExtractionAttempts] = useState(0);
  const [isRtlContent, setIsRtlContent] = useState(false);
  
  // Track completion status of each step
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    "add-content": false,
    "basic-settings": false,
    "title-meta": false,
    "headings": false,
    "post-design": false,
    "keywords": false,
    "links": false
  });
  
  // Detection for RTL text
  useEffect(() => {
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    setIsRtlContent(rtlRegex.test(content));
  }, [content]);
  
  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];
  
  const handleStepComplete = (stepId: string) => {
    setCompletedSteps({
      ...completedSteps,
      [stepId]: true
    });
    
    // Open next step
    const steps = ["add-content", "basic-settings", "title-meta", "headings", "post-design", "keywords", "links"];
    const currentIndex = steps.indexOf(stepId);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setActiveStep(nextStep);
    }
  };
  
  const handleContentConfirm = async () => {
    if (contentMethod === 'link' && !content && url) {
      const success = await handleUrlExtraction();
      if (!success) return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add your content before confirming.",
        variant: "destructive"
      });
      return;
    }
    
    setContentConfirmed(true);
    handleStepComplete("add-content");
    
    toast({
      title: "Content Confirmed",
      description: "Your content has been added successfully.",
    });
    
    // Auto-generate primary keywords after content is confirmed
    if (user && currentWorkspace && getAPIKey('openai')) {
      try {
        setIsLoadingKeywords(true);
        const keywords = await generateKeywordSuggestions(
          content, 
          3, 
          '', 
          user.id, 
          currentWorkspace.id
        );
        
        setSuggestedKeywords(keywords);
        
        if (keywords.length > 0 && !primaryKeyword) {
          setPrimaryKeyword(keywords[0].text);
        }
      } catch (error) {
        console.error("Error auto-generating keywords:", error);
      } finally {
        setIsLoadingKeywords(false);
      }
    }
  };
  
  const handleSuggestKeywords = async () => {
    if (!user || !currentWorkspace) {
      toast({
        title: "Authentication Required",
        description: "Please login to use this feature",
        variant: "destructive"
      });
      return;
    }
    
    const openAIKey = getAPIKey('openai');
    if (!openAIKey) {
      toast({
        title: "API Key Required",
        description: "OpenAI API key is required for this feature. Please add it in Settings.",
        variant: "destructive"
      });
      navigate('/settings');
      return;
    }
    
    if (remainingCredits < 5) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 5 credits to use this feature",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoadingKeywords(true);
      
      // Request to use 5 credits for this operation
      const creditsApproved = await useCredits(5, currentWorkspace.id, 'keyword_suggestion', 'openai');
      if (!creditsApproved) {
        throw new Error("Failed to allocate credits for this operation");
      }
      
      // Generate keywords
      const keywords = await generateKeywordSuggestions(
        content, 
        3, 
        '', 
        user.id, 
        currentWorkspace.id
      );
      
      setSuggestedKeywords(keywords);
      
      // إزالة السطر التالي الذي يعين تلقائيًا الكلمة الرئيسية
      // if (keywords.length > 0 && !primaryKeyword) {
      //   setPrimaryKeyword(keywords[0].text);
      // }
      
      toast({
        title: "Keywords Generated",
        description: "Keyword suggestions have been generated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate keyword suggestions",
        variant: "destructive"
      });
    } finally {
      setIsLoadingKeywords(false);
    }
  };
  
  const handleSelectKeyword = (keyword: string) => {
    setPrimaryKeyword(keyword);
  };
  
  const handleSuggestSecondaryKeywords = async () => {
    if (!user || !currentWorkspace) {
      toast({
        title: "Authentication Required",
        description: "Please login to use this feature",
        variant: "destructive"
      });
      return;
    }
    
    const openAIKey = getAPIKey('openai');
    if (!openAIKey) {
      toast({
        title: "API Key Required",
        description: "OpenAI API key is required for this feature. Please add it in Settings.",
        variant: "destructive"
      });
      navigate('/settings');
      return;
    }
    
    if (remainingCredits < 5) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 5 credits to use this feature",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoadingKeywords(true);
      
      // Request to use 5 credits for this operation
      const creditsApproved = await useCredits(5, currentWorkspace.id, 'keyword_suggestion', 'openai');
      if (!creditsApproved) {
        throw new Error("Failed to allocate credits for this operation");
      }
      
      // Generate secondary keywords
      const keywords = await generateSecondaryKeywordSuggestions(
        primaryKeyword,
        content, 
        5, 
        '', 
        user.id, 
        currentWorkspace.id
      );
      
      if (keywords.length > 0) {
        // Set the secondary keywords as a comma-separated string
        setSecondaryKeywords(keywords.map(k => k.text).join(', '));
        
        toast({
          title: "Secondary Keywords Generated",
          description: "Secondary keyword suggestions have been generated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate secondary keyword suggestions",
        variant: "destructive"
      });
    } finally {
      setIsLoadingKeywords(false);
    }
  };
  
  const handleStartOptimization = () => {
    // Check if all steps are completed
    const allCompleted = Object.values(completedSteps).every(status => status);
    
    if (!allCompleted) {
      toast({
        title: "Complete All Steps",
        description: "Please complete all steps before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the results page
    navigate('/seo-checker', { 
      state: { 
        content, 
        primaryKeyword, 
        secondaryKeywords: secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean)
      } 
    });
  };
  
  const handleUrlExtraction = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL before confirming.",
        variant: "destructive"
      });
      return false;
    }
    
    // Add http:// prefix if not present
    let processedUrl = url;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
      setUrl(processedUrl);
    }
    
    try {
      setIsLoadingUrl(true);
      setExtractionError(null);
      setExtractionAttempts(prev => prev + 1);
      
      // Call the content extractor service with Readability.js implementation
      console.log(`Extracting content from URL: ${processedUrl}`);
      const extractedContent = await extractContentFromUrl(processedUrl);
      console.log("Extraction result:", extractedContent);
      
      if (extractedContent && extractedContent.content && !extractedContent.error) {
        // Set the extracted content
        setContent(extractedContent.content);
        
        // Check for RTL content
        if (extractedContent.rtl) {
          setIsRtlContent(true);
        }
        
        toast({
          title: "Content Extracted",
          description: `Successfully extracted from "${extractedContent.title || 'URL'}"`,
        });
        return true;
      } else {
        const errorMessage = extractedContent.error || "Unable to extract content from this URL";
        setExtractionError(errorMessage);
        toast({
          title: "Extraction Failed",
          description: errorMessage,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error extracting content from URL:", error);
      setExtractionError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Extraction Error",
        description: "An error occurred while extracting content from the URL.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoadingUrl(false);
    }
  };
  
  const handleSecondaryKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSecondaryKeywords(e.target.value);
  };
  
  const isAllCompleted = Object.values(completedSteps).every(status => status);
  
  // Check for required API key
  const openAIKey = getAPIKey('openai');
  const hasRequiredApiKey = !!openAIKey;
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-2">SEO Checker and Optimizer (Pro Mode)</h1>
      
      {!hasRequiredApiKey && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                OpenAI API key is required for full functionality. Please add your API key in settings.
              </p>
              <div className="mt-2">
                <button 
                  onClick={() => navigate('/settings')} 
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-500">Complete all steps to optimize your content</p>
        </div>
        <CreditStatus variant="compact" showButton={false} />
      </div>
      
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            {/* SEO Score Preview */}
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-16">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path 
                    d="M 0,50 A 50,50 0 0,1 100,50" 
                    fill="none" 
                    stroke="#f0f0f0" 
                    strokeWidth="10"
                  />
                  <path 
                    d="M 0,50 A 50,50 0 0,1 50,0" 
                    fill="none" 
                    stroke="#F44336" 
                    strokeWidth="10"
                  />
                  <path 
                    d="M 50,0 A 50,50 0 0,1 100,50" 
                    fill="none" 
                    stroke="#4CAF50" 
                    strokeWidth="10"
                  />
                  <text x="50" y="60" textAnchor="middle" className="text-xs font-bold">SEO</text>
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-medium text-center mb-2">Improve your search engine rankings</h2>
            <p className="text-center text-sm text-gray-500 mb-4">
              This tool measures the quality and relevance of your writing against competitor...
            </p>
          </div>
          
          <Accordion type="single" value={activeStep} onValueChange={setActiveStep} className="w-full">
            <AccordionItem value="add-content" className="border rounded-lg mb-2 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                    {completedSteps["add-content"] ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <span className="text-sm">1</span>
                    )}
                  </div>
                  <span>Add your content</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-4 py-3">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="contentMethod" 
                        checked={contentMethod === 'text'} 
                        onChange={() => setContentMethod('text')} 
                        className="mr-2" 
                      />
                      Add Text
                    </label>
                    
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="contentMethod" 
                        checked={contentMethod === 'link'} 
                        onChange={() => setContentMethod('link')} 
                        className="mr-2" 
                      />
                      Add Link
                    </label>
                    
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="contentMethod" 
                        checked={contentMethod === 'file'} 
                        onChange={() => setContentMethod('file')} 
                        className="mr-2" 
                      />
                      Upload File
                    </label>
                  </div>
                  
                  {contentMethod === 'text' && (
                    <div className={isRtlContent ? 'rtl' : 'ltr'}>
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        readOnly={contentConfirmed}
                        placeholder="Paste your article content here..."
                      />
                    </div>
                  )}
                  
                  {contentMethod === 'link' && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          className="flex-1 p-3 border border-gray-300 rounded-md"
                          placeholder="Enter URL to your content..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          disabled={contentConfirmed || isLoadingUrl}
                        />
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                          onClick={handleUrlExtraction}
                          disabled={!url.trim() || contentConfirmed || isLoadingUrl}
                        >
                          {isLoadingUrl ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      
                      {content && !contentConfirmed && (
                        <div className={isRtlContent ? 'rtl' : 'ltr'}>
                          <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            formats={formats}
                            readOnly={contentConfirmed}
                            placeholder="Extracted content will appear here..."
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {contentMethod === 'file' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setContent(e.target.files[0].name);
                          }
                        }}
                        disabled={contentConfirmed}
                      />
                      <label 
                        htmlFor="file-upload"
                        className="cursor-pointer text-purple-600 hover:text-purple-800"
                      >
                        Click to upload or drag and drop
                      </label>
                      {content && <p className="mt-2 text-sm text-gray-500">{content}</p>}
                    </div>
                  )}
                  
                  <button 
                    className="seo-button seo-button-primary"
                    onClick={handleContentConfirm}
                    disabled={contentConfirmed}
                  >
                    Confirm Content
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="basic-settings" className="border rounded-lg mb-2 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                    {completedSteps["basic-settings"] ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <span className="text-sm">2</span>
                    )}
                  </div>
                  <span>Basic settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-4 py-3">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Assistant model</label>
                    <div className="flex gap-2">
                      <select className="flex-1 p-2 border border-gray-300 rounded-md">
                        <option>Default SEO Model</option>
                        <option>Custom Assistant 1</option>
                        <option>Custom Assistant 2</option>
                      </select>
                      <button className="seo-button seo-button-secondary">
                        Create New
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2">Primary Keyword</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder="Enter your main keyword..."
                        value={primaryKeyword}
                        onChange={(e) => setPrimaryKeyword(e.target.value)}
                      />
                      <button 
                        className="seo-button seo-button-secondary"
                        onClick={handleSuggestKeywords}
                        disabled={!contentConfirmed || isLoadingKeywords || !hasRequiredApiKey}
                      >
                        {isLoadingKeywords ? "Loading..." : "Suggest"}
                      </button>
                    </div>
                    
                    {suggestedKeywords.length > 0 && (
                      <div className="mt-3">
                        <label className="text-sm text-gray-500 mb-2 block">Suggestions:</label>
                        <div className="flex flex-wrap gap-2">
                          {suggestedKeywords.map(keyword => (
                            <button
                              key={keyword.id}
                              onClick={() => handleSelectKeyword(keyword.text)}
                              className={`text-xs py-1 px-2 rounded-full ${
                                primaryKeyword === keyword.text 
                                  ? 'bg-seo-purple text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {keyword.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block mb-2">Secondary Keywords</label>
                    <div className="flex gap-2">
                      <textarea 
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder="Enter your secondary keywords, separated by commas..."
                        rows={2}
                        value={secondaryKeywords}
                        onChange={handleSecondaryKeywordsChange}
                      />
                      <button 
                        className="seo-button seo-button-secondary h-fit"
                        onClick={handleSuggestSecondaryKeywords}
                        disabled={!primaryKeyword || !hasRequiredApiKey}
                      >
                        Suggest
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="seo-button seo-button-primary"
                    onClick={() => handleStepComplete("basic-settings")}
                    disabled={!primaryKeyword}
                  >
                    Confirm Settings
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Additional accordion items - simplified for brevity */}
            {["title-meta", "headings", "post-design", "keywords", "links"].map((step, index) => (
              <AccordionItem 
                key={step} 
                value={step} 
                className="border rounded-lg mb-2 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                      {completedSteps[step] ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <span className="text-sm">{index + 3}</span>
                      )}
                    </div>
                    <span>
                      {step === "title-meta" && "Title & Meta Fixer"}
                      {step === "headings" && "Heading Optimization"}
                      {step === "post-design" && "Post Design"}
                      {step === "keywords" && "Keyword Integration"}
                      {step === "links" && "Links Injection"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t px-4 py-3">
                  <div className="h-24 flex items-center justify-center text-gray-500">
                    <span>Settings for {step.replace("-", " ")} go here</span>
                  </div>
                  
                  <button 
                    className="seo-button seo-button-primary mt-4"
                    onClick={() => handleStepComplete(step)}
                  >
                    Confirm {step.replace("-", " ")}
                  </button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {isAllCompleted && (
            <button 
              className="seo-button seo-button-primary w-full mt-6"
              onClick={handleStartOptimization}
            >
              Start Optimization
            </button>
          )}
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
            {contentConfirmed ? (
              <div className="w-full">
                <h3 className="text-lg font-medium mb-4">Content Preview</h3>
                <div className={`border border-gray-200 rounded p-4 max-h-96 overflow-auto ${isRtlContent ? 'rtl' : 'ltr'}`}>
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Primary Keyword:</h4>
                  <div className="bg-gray-100 p-2 rounded">
                    {primaryKeyword || "Not set"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Your confirmed content will appear here for optimization.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProModeForm;
