
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Link, RefreshCw, Check, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAPIKeys } from '@/contexts/APIKeysContext';
import { extractContentFromUrl } from '@/services/contentExtractorService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// List of supported countries with their codes and names
const SUPPORTED_COUNTRIES = [
  { code: 'us', name: 'United States' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
];

const QuickOptimizationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { getAPIKey } = useAPIKeys();
  
  const [content, setContent] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [primaryKeyword, setPrimaryKeyword] = useState<string>('');
  const [contentMethod, setContentMethod] = useState<'text' | 'link'>('text');
  const [isFormError, setIsFormError] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('quick');
  const [isRtlContent, setIsRtlContent] = useState<boolean>(false);
  const [targetCountry, setTargetCountry] = useState<string>('us'); // Default to US
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // Detection for RTL text
  useEffect(() => {
    const rtlRegex = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
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
  
  const handleStartOptimization = () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add your content before starting optimization.",
        variant: "destructive"
      });
      setIsFormError(true);
      return;
    }
    
    if (!primaryKeyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a primary keyword before starting optimization.",
        variant: "destructive"
      });
      setIsFormError(true);
      return;
    }
    
    setIsFormError(false);
    setIsAnalyzing(true);
    
    // Navigate to results view with the content and keyword
    setTimeout(() => {
      navigate('/seo-checker', { 
        state: { 
          content, 
          primaryKeyword,
          targetCountry,
          secondaryKeywords: []
        } 
      });
      setIsAnalyzing(false);
    }, 800); // Short delay to show loading state
  };
  
  const handleUrlExtraction = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to extract content.",
        variant: "destructive"
      });
      return;
    }
    
    // Add http:// prefix if not present
    let processedUrl = url;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
      setUrl(processedUrl);
    }
    
    try {
      setIsLoadingUrl(true);
      
      // Call the content extractor service with Readability.js implementation
      console.log(`Extracting content from URL: ${processedUrl}`);
      const extractedContent = await extractContentFromUrl(processedUrl);
      console.log("Extraction result:", extractedContent);
      
      if (extractedContent && extractedContent.content && !extractedContent.error) {
        // Set the extracted content
        setContent(extractedContent.content);
        
        // Set title as primary keyword if empty
        if (!primaryKeyword && extractedContent.title) {
          setPrimaryKeyword(extractedContent.title);
        }
        
        // Check for RTL content
        if (extractedContent.rtl) {
          setIsRtlContent(true);
        }
        
        toast({
          title: "Content Extracted",
          description: `Successfully extracted from "${extractedContent.title || 'URL'}"`,
        });
      } else {
        const errorMessage = extractedContent?.error || "Unable to extract content from this URL";
        toast({
          title: "Extraction Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error extracting content from URL:", error);
      toast({
        title: "Extraction Error",
        description: "An error occurred while extracting content from the URL.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">SEO Checker and Optimizer</h1>
      <p className="text-gray-500 mb-6">Analyze and optimize your content for better search engine rankings</p>
      
      <Tabs defaultValue="quick" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="quick">Quick Mode</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Mode</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick" className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-2">Add Your Content</h2>
                <div className="flex space-x-4 mb-4">
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
                </div>
                
                {contentMethod === 'text' && (
                  <div className={isRtlContent ? 'rtl' : 'ltr'}>
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      formats={formats}
                      placeholder="Paste your article content here..."
                      className={isFormError && !content ? "border-red-500" : ""}
                    />
                  </div>
                )}
                
                {contentMethod === 'link' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        className={`flex-1 p-2 border rounded-md ${isFormError && !content ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Enter URL to your content..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoadingUrl}
                      />
                      <Button 
                        variant="outline"
                        onClick={handleUrlExtraction}
                        disabled={!url.trim() || isLoadingUrl}
                      >
                        {isLoadingUrl ? <Loader className="h-4 w-4 animate-spin" /> : "Extract"}
                      </Button>
                    </div>
                    
                    {content && (
                      <div className={isRtlContent ? 'rtl' : 'ltr'}>
                        <ReactQuill
                          theme="snow"
                          value={content}
                          onChange={setContent}
                          modules={modules}
                          formats={formats}
                          placeholder="Extracted content will appear here..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-2">Primary Keyword</h2>
                <input 
                  type="text" 
                  className={`w-full p-2 border rounded-md ${isFormError && !primaryKeyword ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter your main keyword..."
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                />
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-2">Target Country</h2>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                >
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  We'll analyze top competitors for your keyword in this country
                </p>
              </div>
              
              <Button 
                className="w-full"
                onClick={handleStartOptimization}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Start Quick Optimization"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Switch to Pro Mode</h2>
              <p className="text-gray-500 mb-4">
                Pro mode offers advanced settings and more detailed analysis
              </p>
              <Button onClick={() => navigate('/autofix/modes')}>
                Go to Pro Mode
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuickOptimizationForm;
