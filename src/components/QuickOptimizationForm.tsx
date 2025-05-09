import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Search, X, Loader, RefreshCw, Pencil, Link as LinkIcon, ExternalLink, AlertTriangle } from 'lucide-react';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions, extractContentFromUrl } from '@/services/openaiService';

interface Keyword {
  id: string;
  text: string;
}

// Helper function to detect language
const isRTL = (text: string) => {
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
};

const QuickOptimizationForm = () => {
  const navigate = useNavigate();
  const [contentMethod, setContentMethod] = useState<'text' | 'link' | 'file'>('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [contentConfirmed, setContentConfirmed] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [showPrimaryKeywordSuggestions, setShowPrimaryKeywordSuggestions] = useState(false);
  const [showSecondaryKeywordSuggestions, setShowSecondaryKeywordSuggestions] = useState(false);
  const [primaryKeywordSuggestions, setPrimaryKeywordSuggestions] = useState<Keyword[]>([]);
  const [secondaryKeywordSuggestions, setSecondaryKeywordSuggestions] = useState<Keyword[]>([]);
  const [regenerationNote, setRegenerationNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPrimary, setIsGeneratingPrimary] = useState(false);
  const [isGeneratingSecondary, setIsGeneratingSecondary] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [extractionAttempts, setExtractionAttempts] = useState(0);
  
  // Determine if the content is RTL or LTR
  const [isRtlContent, setIsRtlContent] = useState(false);
  
  // Update RTL detection when content changes
  useEffect(() => {
    setIsRtlContent(isRTL(content));
  }, [content]);
  
  // Apply appropriate font class only to the content
  const editorFontClass = isRtlContent ? 'font-arabic' : 'font-english';
  
  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  // Auto-generate keyword suggestions after content is confirmed
  useEffect(() => {
    if (contentConfirmed && content) {
      handleGeneratePrimaryKeywords();
    }
  }, [contentConfirmed]);

  // Auto-generate secondary keywords when primary keyword is selected
  useEffect(() => {
    if (primaryKeyword && contentConfirmed && content) {
      handleGenerateSecondaryKeywords();
    }
  }, [primaryKeyword]);

  // Handle URL extraction
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
      
      // Call the API to extract content from URL
      const extractedContent = await extractContentFromUrl(processedUrl);
      
      if (extractedContent) {
        setContent(extractedContent);
        toast({
          title: "Content Extracted",
          description: "Content has been successfully extracted from the URL.",
        });
        return true;
      } else {
        setExtractionError("Unable to extract content from this URL");
        toast({
          title: "Extraction Failed",
          description: "Unable to extract content from this URL. Please try another URL or paste content manually.",
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
  
  const handleContentConfirm = async () => {
    // If URL method is selected, extract content first
    if (contentMethod === 'link') {
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
    toast({
      title: "Content Confirmed",
      description: "Your content has been added successfully.",
    });
  };
  
  const handlePrimaryKeywordSelect = (keyword: string) => {
    setPrimaryKeyword(keyword);
    setShowPrimaryKeywordSuggestions(false);
  };
  
  const handleSecondaryKeywordToggle = (keyword: string) => {
    // Check if the keyword is already selected
    if (secondaryKeywords.includes(keyword)) {
      // Remove the keyword if already selected
      setSecondaryKeywords(secondaryKeywords.filter(k => k !== keyword));
    } else {
      // Add the keyword if not already selected and if less than 5 are selected
      if (secondaryKeywords.length < 5) {
        setSecondaryKeywords([...secondaryKeywords, keyword]);
      } else {
        toast({
          title: "Maximum Keywords Reached",
          description: "You can select up to 5 secondary keywords.",
          variant: "default"
        });
      }
    }
  };
  
  const handleGeneratePrimaryKeywords = async () => {
    if (!content) {
      toast({
        title: "Content Required",
        description: "Please add your content before generating keywords.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingPrimary(true);
    setShowPrimaryKeywordSuggestions(true);
    
    try {
      const suggestions = await generateKeywordSuggestions(
        content,
        3,
        regenerationNote
      );
      
      if (suggestions && suggestions.length > 0) {
        setPrimaryKeywordSuggestions(suggestions);
        setRegenerationNote('');
        toast({
          title: "Primary Keywords Generated",
          description: "Please select a primary keyword.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Unable to generate keyword suggestions. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating primary keywords:", error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating keywords.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };
  
  const handleGenerateSecondaryKeywords = async () => {
    if (!primaryKeyword || !content) {
      toast({
        title: "Information Required",
        description: "Please confirm your content and select a primary keyword first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingSecondary(true);
    setShowSecondaryKeywordSuggestions(true);
    
    try {
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword,
        content,
        5,
        regenerationNote
      );
      
      if (suggestions && suggestions.length > 0) {
        setSecondaryKeywordSuggestions(suggestions);
        setRegenerationNote('');
        toast({
          title: "Secondary Keywords Generated",
          description: "Please select up to 5 secondary keywords.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Unable to generate secondary keyword suggestions. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating secondary keywords:", error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating keywords.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSecondary(false);
    }
  };
  
  const handleRetryExtraction = async () => {
    await handleUrlExtraction();
  };
  
  const handleStartOptimization = () => {
    if (!contentConfirmed) {
      toast({
        title: "Content Required",
        description: "Please confirm your content before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    if (!primaryKeyword.trim()) {
      toast({
        title: "Primary Keyword Required",
        description: "Please add a primary keyword before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    // Show loading state only in button
    setIsOptimizing(true);
    toast({
      title: "Optimization Started",
      description: "Analyzing and optimizing your content...",
    });
    
    // Navigate to the results page after a delay
    setTimeout(() => {
      navigate('/seo-checker', { 
        state: { 
          content, 
          primaryKeyword, 
          secondaryKeywords
        }
      });
      setIsOptimizing(false);
    }, 1000);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick SEO Optimization</h1>
      
      <div className="space-y-8">
        {/* Content Section */}
        <div className={`p-6 border rounded-lg ${contentConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <h2 className="text-lg font-medium mb-4">1. Add your content</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="contentMethod" 
                  checked={contentMethod === 'text'} 
                  onChange={() => setContentMethod('text')} 
                  className="mr-2" 
                  disabled={contentConfirmed}
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
                  disabled={contentConfirmed}
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
                  disabled={contentConfirmed}
                />
                Upload File
              </label>
            </div>
            
            {contentMethod === 'text' && (
              <>
                <div className="quill-container">
                  <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent} 
                    modules={modules} 
                    formats={formats}
                    readOnly={contentConfirmed}
                    placeholder="Paste your article content here..."
                    className={`${editorFontClass} ${isRtlContent ? 'rtl-content' : 'ltr-content'}`}
                  />
                </div>
                
                {!contentConfirmed && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="seoButton" 
                      onClick={handleContentConfirm}
                      className="z-10 relative"
                    >
                      Confirm Content
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {contentMethod === 'link' && (
              <div>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="url" 
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="Enter URL to your content..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={contentConfirmed || isLoadingUrl}
                  />
                  {!contentConfirmed && (
                    <Button 
                      variant="outline" 
                      onClick={handleUrlExtraction} 
                      disabled={isLoadingUrl || !url.trim()}
                      className="whitespace-nowrap"
                    >
                      {isLoadingUrl ? (
                        <Loader size={16} className="mr-2 animate-spin" />
                      ) : (
                        <ExternalLink size={16} className="mr-2" />
                      )}
                      Extract
                    </Button>
                  )}
                </div>
                
                {isLoadingUrl && (
                  <div className="p-4 border border-gray-200 rounded-md mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader size={20} className="animate-spin text-purple-600" />
                      <span>Extracting content from URL... This may take a moment.</span>
                    </div>
                  </div>
                )}

                {extractionError && !isLoadingUrl && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md mb-4">
                    <div className="flex items-center">
                      <AlertTriangle size={20} className="text-red-500 mr-2" />
                      <div className="flex-1">
                        <p className="font-medium text-red-600">Extraction Failed</p>
                        <p className="text-sm text-red-500">{extractionError}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleRetryExtraction} className="whitespace-nowrap">
                        <RefreshCw size={14} className="mr-1" />
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                
                {content && !contentConfirmed && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium flex items-center">
                        <LinkIcon size={16} className="mr-2" /> 
                        <span>Content from URL</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        You can edit the extracted content below
                      </div>
                    </div>
                    <div className={`${editorFontClass} ${isRtlContent ? 'rtl-content' : 'ltr-content'}`}>
                      <ReactQuill 
                        theme="snow" 
                        value={content} 
                        onChange={setContent} 
                        modules={modules} 
                        formats={formats}
                        placeholder="Edit content from URL here..."
                        className="mb-4"
                      />
                    </div>
                    
                    <div className="text-center mt-6">
                      <Button 
                        variant="seoButton" 
                        onClick={handleContentConfirm}
                        className="z-10 relative"
                      >
                        Confirm Content
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {contentMethod === 'file' && (
              <div>
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
                    className={`cursor-pointer text-purple-600 hover:text-purple-800 ${contentConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Click to upload or drag and drop
                  </label>
                  {content && contentMethod === 'file' && <p className="mt-2 text-sm text-gray-500">{content}</p>}
                </div>
                
                {!contentConfirmed && content && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="seoButton" 
                      onClick={handleContentConfirm}
                      className="z-10 relative"
                    >
                      Confirm Content
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {contentConfirmed && (
              <div className="flex items-center text-green-600 mt-4">
                <CheckIcon className="mr-2" />
                <span>Content added/confirmed.</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Keywords Section */}
        <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium mb-4">2. Add Keywords</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block font-medium">Primary Keyword:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 p-3 border border-gray-300 rounded-md"
                  placeholder="Enter your main keyword..."
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                />
                <button 
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                  onClick={() => setShowPrimaryKeywordSuggestions(!showPrimaryKeywordSuggestions)}
                  disabled={!contentConfirmed || isGeneratingPrimary}
                >
                  <Search size={16} className="text-gray-600" />
                  Suggest
                </button>
              </div>
              
              {showPrimaryKeywordSuggestions && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="mb-3 font-medium">Suggested (select one):</div>
                  <div className="space-y-2">
                    {isGeneratingPrimary ? (
                      <div className="flex justify-center py-4">
                        <Loader size={24} className="animate-spin text-[#F76D01]" />
                        <span className="ml-2">Generating suggestions...</span>
                      </div>
                    ) : primaryKeywordSuggestions.length > 0 ? (
                      primaryKeywordSuggestions.map((keyword) => (
                        <label key={keyword.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input 
                            type="radio" 
                            name="primaryKeyword" 
                            className="mr-2"
                            checked={primaryKeyword === keyword.text}
                            onChange={() => handlePrimaryKeywordSelect(keyword.text)}
                          />
                          {keyword.text}
                        </label>
                      ))
                    ) : (
                      <p>No suggestions available</p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Regeneration note..."
                        value={regenerationNote}
                        onChange={(e) => setRegenerationNote(e.target.value)}
                      />
                    </div>
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                      onClick={handleGeneratePrimaryKeywords}
                      disabled={isGeneratingPrimary}
                    >
                      {isGeneratingPrimary ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">Secondary Keywords (Optional):</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 border border-gray-300 rounded-md min-h-[80px] bg-white">
                  {secondaryKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {secondaryKeywords.map((keyword, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1"
                        >
                          <span>{keyword}</span>
                          <button 
                            onClick={() => handleSecondaryKeywordToggle(keyword)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">Select up to 5 secondary keywords</span>
                  )}
                </div>
                <button 
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md h-fit flex items-center gap-1 transition-colors"
                  onClick={() => setShowSecondaryKeywordSuggestions(!showSecondaryKeywordSuggestions)}
                  disabled={!primaryKeyword || isGeneratingSecondary}
                >
                  <Search size={16} className="text-gray-600" />
                  Suggest
                </button>
              </div>
              
              {showSecondaryKeywordSuggestions && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="mb-3 font-medium">Suggested (select multiple, max 5):</div>
                  <div className="space-y-2">
                    {isGeneratingSecondary ? (
                      <div className="flex justify-center py-4">
                        <Loader size={24} className="animate-spin text-[#F76D01]" />
                        <span className="ml-2">Generating suggestions...</span>
                      </div>
                    ) : secondaryKeywordSuggestions.length > 0 ? (
                      secondaryKeywordSuggestions.map((keyword) => (
                        <label key={keyword.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input 
                            type="checkbox" 
                            className="mr-2"
                            checked={secondaryKeywords.includes(keyword.text)}
                            onChange={() => handleSecondaryKeywordToggle(keyword.text)}
                            disabled={!secondaryKeywords.includes(keyword.text) && secondaryKeywords.length >= 5}
                          />
                          {keyword.text}
                          {!secondaryKeywords.includes(keyword.text) && secondaryKeywords.length >= 5 && (
                            <span className="ml-2 text-xs text-gray-400">(max 5 reached)</span>
                          )}
                        </label>
                      ))
                    ) : (
                      <p>No suggestions available</p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500 flex-1 mr-2">
                      <div className="flex items-center gap-1">
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Regeneration note..."
                          value={regenerationNote}
                          onChange={(e) => setRegenerationNote(e.target.value)}
                        />
                        <Pencil size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                      onClick={handleGenerateSecondaryKeywords}
                      disabled={isGeneratingSecondary}
                    >
                      {isGeneratingSecondary ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          variant="seoButton" 
          className="w-full text-center py-3"
          onClick={handleStartOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <div className="flex items-center justify-center">
              <Loader className="mr-2 h-5 w-5 animate-spin text-white" />
              <span>Analyzing...</span>
            </div>
          ) : (
            "Start Quick Optimization"
          )}
        </Button>
      </div>
    </div>
  );
};

const CheckIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default QuickOptimizationForm;
