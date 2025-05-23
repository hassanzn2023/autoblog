import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Search, X, Loader, RefreshCw, Pencil, Link as LinkIcon, ExternalLink, AlertTriangle, Upload, FileText, Check } from 'lucide-react';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions, KeywordSuggestion } from '@/services/openaiService';
import { parseWordDocument } from '@/services/documentParserService';
import { extractContentFromUrl } from '@/services/contentExtractorService';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

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
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [contentMethod, setContentMethod] = useState<'text' | 'link' | 'file'>('text');
  const [textContent, setTextContent] = useState('');
  const [linkContent, setLinkContent] = useState('');
  const [fileContent, setFileContent] = useState('');
  
  // This will be the content used for optimization
  const [content, setContent] = useState('');
  
  const [url, setUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [contentConfirmed, setContentConfirmed] = useState(false);

  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [primaryKeywordInput, setPrimaryKeywordInput] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [secondaryKeywordInput, setSecondaryKeywordInput] = useState('');
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

  // New state variables for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileParsingError, setFileParsingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if the content is RTL or LTR
  const [isRtlContent, setIsRtlContent] = useState(false);

  // Update RTL detection based on the active content
  useEffect(() => {
    let activeContent = '';
    
    switch(contentMethod) {
      case 'text':
        activeContent = textContent;
        break;
      case 'link':
        activeContent = linkContent;
        break;
      case 'file':
        activeContent = fileContent;
        break;
    }
    
    setIsRtlContent(isRTL(activeContent));
  }, [textContent, linkContent, fileContent, contentMethod]);

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

      // Call the API to extract content from URL using contentExtractorService
      const extractedContent = await extractContentFromUrl(processedUrl);

      if (extractedContent && !extractedContent.error) {
        // Use the HTML content from the extraction
        setLinkContent(extractedContent.content || '');

        // Set RTL flag based on content if available
        if (extractedContent.rtl) {
          setIsRtlContent(extractedContent.rtl);
        } else {
          setIsRtlContent(isRTL(extractedContent.textContent || ''));
        }

        toast({
          title: "Content Extracted",
          description: `Successfully extracted content from "${extractedContent.title || 'URL'}"`,
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

  const handleContentConfirm = async () => {
    let contentToConfirm = '';
    
    switch(contentMethod) {
      case 'text':
        contentToConfirm = textContent;
        break;
      case 'link':
        if (!linkContent && url) {
          const success = await handleUrlExtraction();
          if (!success) return;
        }
        contentToConfirm = linkContent;
        break;
      case 'file':
        contentToConfirm = fileContent;
        break;
    }
    
    if (!contentToConfirm.trim()) {
      toast({
        title: "Content Required",
        description: "Please add your content before confirming.",
        variant: "destructive"
      });
      return;
    }
    
    // Set the main content that will be used for optimization
    setContent(contentToConfirm);
    setContentConfirmed(true);
    
    toast({
      title: "Content Confirmed",
      description: "Your content has been added successfully.",
    });
  };

  // Update handlePrimaryKeywordSelect to also update the input field
  const handlePrimaryKeywordSelect = (keyword: string) => {
    setPrimaryKeyword(keyword);
    setPrimaryKeywordInput(keyword); // هنا نضيف هذا السطر لتحديث حقل الإدخال عند النقر على كلمة مقترحة
  };
  
  const handlePrimaryKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrimaryKeywordInput(value);
    setPrimaryKeyword(value); // تحديث الكلمة الرئيسية أيضًا عند ��لكتابة
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
  
  // Handle secondary keyword input with Enter key
  const handleSecondaryKeywordInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && secondaryKeywordInput.trim()) {
      e.preventDefault();
      
      // Check if already at max keywords
      if (secondaryKeywords.length >= 5) {
        toast({
          title: "Maximum Keywords Reached",
          description: "You can select up to 5 secondary keywords.",
          variant: "default"
        });
        return;
      }
      
      // Check if keyword already exists
      if (secondaryKeywords.includes(secondaryKeywordInput.trim())) {
        toast({
          title: "Duplicate Keyword",
          description: "This keyword is already in your list.",
          variant: "default"
        });
        return;
      }
      
      // Add the keyword
      setSecondaryKeywords([...secondaryKeywords, secondaryKeywordInput.trim()]);
      setSecondaryKeywordInput('');
    }
  };

  // Primary keyword generation (triggered by button)
  const handleGeneratePrimaryKeywords = async () => {
    if (!content) {
      toast({
        title: "Content Required",
        description: "Please add and confirm your content before generating keywords.",
        variant: "destructive"
      });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate keywords.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPrimary(true);
    setShowPrimaryKeywordSuggestions(true);

    try {
      console.log("Generating primary keywords for content with length:", content.length);

      // Pass all required parameters to the function
      const suggestions = await generateKeywordSuggestions(
        content,
        3,
        regenerationNote,
        user.id,
        currentWorkspace.id
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

  // Secondary keyword generation (triggered by button)
  const handleGenerateSecondaryKeywords = async () => {
    if (!primaryKeyword || !content) {
      toast({
        title: "Information Required",
        description: "Please confirm your content and select a primary keyword first.",
        variant: "destructive"
      });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate keywords.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingSecondary(true);
    setShowSecondaryKeywordSuggestions(true);

    try {
      console.log("Generating secondary keywords for primary keyword:", primaryKeyword);

      // Pass all required parameters to the function
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword,
        content,
        5,
        regenerationNote,
        user.id,
        currentWorkspace.id
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

  // Handle file upload and parsing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    setSelectedFile(file);

    // Check if the file is a Word document
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setFileParsingError("Please upload a valid Word document (.docx or .doc)");
      toast({
        title: "Invalid File",
        description: "Please upload a valid Word document (.docx or .doc)",
        variant: "destructive"
      });
      return;
    }

    // Parse the Word document
    try {
      setIsParsingFile(true);
      setFileParsingError(null);

      const result = await parseWordDocument(file);
      setFileContent(result.html);

      toast({
        title: "File Uploaded",
        description: "Word document has been successfully parsed.",
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      setFileParsingError(error instanceof Error ? error.message : "Failed to parse Word document");
      toast({
        title: "Parsing Error",
        description: "Failed to parse the Word document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsParsingFile(false);
    }
  };

  // Handle drag and drop for files
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    setSelectedFile(file);

    // Check if the file is a Word document
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setFileParsingError("Please upload a valid Word document (.docx or .doc)");
      toast({
        title: "Invalid File",
        description: "Please upload a valid Word document (.docx or .doc)",
        variant: "destructive"
      });
      return;
    }

    // Parse the Word document
    try {
      setIsParsingFile(true);
      setFileParsingError(null);

      const result = await parseWordDocument(file);
      setFileContent(result.html);

      toast({
        title: "File Uploaded",
        description: "Word document has been successfully parsed.",
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      setFileParsingError(error instanceof Error ? error.message : "Failed to parse Word document");
      toast({
        title: "Parsing Error",
        description: "Failed to parse the Word document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsParsingFile(false);
    }
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
                <div className="quill-container single-scrollbar h-[300px]">
                  <ScrollArea className="h-full">
                    <ReactQuill
                      theme="snow"
                      value={textContent}
                      onChange={setTextContent}
                      modules={modules}
                      formats={formats}
                      readOnly={contentConfirmed}
                      placeholder="Paste your article content here..."
                      className={`${editorFontClass} ${isRtlContent ? 'rtl-content' : 'ltr-content'}`}
                    />
                  </ScrollArea>
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

                {(linkContent || contentMethod === 'link') && !contentConfirmed && (
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

                    <div className="quill-container url-content-container single-scrollbar h-[300px]">
                      <ScrollArea className="h-full">
                        <ReactQuill
                          theme="snow"
                          value={linkContent}
                          onChange={setLinkContent}
                          modules={modules}
                          formats={formats}
                          placeholder="Edit content from URL here..."
                          className={`${editorFontClass} ${isRtlContent ? 'rtl-content' : 'ltr-content'}`}
                        />
                      </ScrollArea>
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
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    ref={fileInputRef}
                    accept=".doc,.docx"
                    onChange={handleFileUpload}
                    disabled={contentConfirmed || isParsingFile}
                  />
                  {!selectedFile && !fileContent ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload size={40} className="mb-4 text-purple-600" />
                      <label
                        htmlFor="file-upload"
                        className={`cursor-pointer text-purple-600 hover:text-purple-800 ${contentConfirmed || isParsingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Click to upload or drag and drop
                      </label>
                      <p className="mt-2 text-sm text-gray-500">Only .doc and .docx files are supported</p>
                    </div>
                  ) : isParsingFile ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Loader size={40} className="mb-4 animate-spin text-purple-600" />
                      <p>Parsing document content...</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex items-center justify-center py-2">
                      <FileText size={24} className="text-purple-600 mr-2" />
                      <span>{selectedFile.name}</span>
                      {!contentConfirmed && (
                        <button
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => {
                            setSelectedFile(null);
                            setFileContent('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>

                {fileParsingError && !isParsingFile && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md mt-4">
                    <div className="flex items-center">
                      <AlertTriangle size={20} className="text-red-500 mr-2" />
                      <div>
                        <p className="font-medium text-red-600">Parsing Error</p>
                        <p className="text-sm text-red-500">{fileParsingError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(fileContent || contentMethod === 'file') && !contentConfirmed && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium flex items-center">
                        <FileText size={16} className="mr-2" />
                        <span>Content from Document</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        You can edit the extracted content below
                      </div>
                    </div>

                    <div className="quill-container file-upload-container single-scrollbar h-[300px]">
                      <ScrollArea className="h-full">
                        <ReactQuill
                          theme="snow"
                          value={fileContent}
                          onChange={setFileContent}
                          modules={modules}
                          formats={formats}
                          placeholder="Edit content from document here..."
                          className={`${editorFontClass} ${isRtlContent ? 'rtl-content' : 'ltr-content'}`}
                        />
                      </ScrollArea>
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
                  value={primaryKeywordInput}
                  onChange={handlePrimaryKeywordInputChange}
                />
                <button
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                  onClick={handleGeneratePrimaryKeywords}
                  disabled={!contentConfirmed || isGeneratingPrimary}
                >
                  {isGeneratingPrimary ? (
                    <Loader size={16} className="mr-2 animate-spin text-gray-600" />
                  ) : (
                    <Search size={16} className="mr-2 text-gray-600" />
                  )}
                  Suggest
                </button>
              </div>

              {showPrimaryKeywordSuggestions && primaryKeywordSuggestions.length > 0 && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="mb-3 font-medium">Suggested keywords:</div>
                  <div className="space-y-2">
                    {isGeneratingPrimary ? (
                      <div className="flex justify-center py-4">
                        <Loader size={24} className="animate-spin text-[#F76D01]" />
                        <span className="ml-2">Generating suggestions...</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {primaryKeywordSuggestions.map((keyword) => (
                          <div
                            key={keyword.id}
                            onClick={() => handlePrimaryKeywordSelect(keyword.text)}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-sm ${
                              primaryKeyword === keyword.text 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {keyword.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500 flex-1 mr-2">
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
                <div className="flex-1 min-h-[80px] relative">
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Type and press Enter to add keywords..."
                      value={secondaryKeywordInput}
                      onChange={(e) => setSecondaryKeywordInput(e.target.value)}
                      onKeyDown={handleSecondaryKeywordInputKeyDown}
                    />
                  </div>
                  
                  {secondaryKeywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
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
                  )}
                </div>
                <button
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md h-fit flex items-center gap-1 transition-colors"
                  onClick={handleGenerateSecondaryKeywords}
                  disabled={!primaryKeyword || isGeneratingSecondary}
                >
                   {isGeneratingSecondary ? (
                    <Loader size={16} className="mr-2 animate-spin text-gray-600" />
                  ) : (
                    <Search size={16} className="mr-2 text-gray-600" />
                  )}
                  Suggest
                </button>
              </div>

              {showSecondaryKeywordSuggestions && secondaryKeywordSuggestions.length > 0 && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="mb-3 font-medium">Suggested (select multiple, max 5):</div>
                  <div className="space-y-2">
                    {isGeneratingSecondary ? (
                      <div className="flex justify-center py-4">
                        <Loader size={24} className="animate-spin text-[#F76D01]" />
                        <span className="ml-2">Generating suggestions...</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {secondaryKeywordSuggestions.map((keyword) => (
                          <div
                            key={keyword.id}
                            onClick={() => handleSecondaryKeywordToggle(keyword.text)}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-sm ${
                              secondaryKeywords.includes(keyword.text)
                                ? 'bg-purple-600 text-white'
                                : secondaryKeywords.length >= 5
                                ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {keyword.text}
                            {!secondaryKeywords.includes(keyword.text) && secondaryKeywords.length >= 5 && (
                              <span className="ml-2 text-xs">(max 5 reached)</span>
                            )}
                          </div>
                        ))}
                      </div>
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
