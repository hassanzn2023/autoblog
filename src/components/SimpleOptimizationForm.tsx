
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Search } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions, KeywordSuggestion } from '@/services/openaiService';
import { extractContentFromUrl } from '@/services/contentExtractorService';
import { parseWordDocument } from '@/services/documentParserService';

const SimpleOptimizationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const [contentMethod, setContentMethod] = useState<'text' | 'link' | 'file'>('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [contentConfirmed, setContentConfirmed] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isRtlContent, setIsRtlContent] = useState(false);
  const [primaryKeywordSuggestions, setPrimaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  const [secondaryKeywordSuggestions, setSecondaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  const [isGeneratingPrimary, setIsGeneratingPrimary] = useState(false);
  const [isGeneratingSecondary, setIsGeneratingSecondary] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Detection for RTL text
  useEffect(() => {
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    setIsRtlContent(rtlRegex.test(content));
  }, [content]);
  
  const editorFontClass = isRtlContent ? 'font-arabic' : 'font-english';
  
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
  
  // Handle URL extraction
  const handleUrlExtraction = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoadingUrl(true);
      
      let processedUrl = url;
      if (!/^https?:\/\//i.test(processedUrl)) {
        processedUrl = 'https://' + processedUrl;
        setUrl(processedUrl);
      }
      
      const extractedContent = await extractContentFromUrl(processedUrl);
      
      if (extractedContent.content) {
        setContent(extractedContent.content);
        
        toast({
          title: "Content Extracted",
          description: "Content successfully extracted from URL",
        });
      } else {
        toast({
          title: "Extraction Failed",
          description: "Unable to extract content from URL",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error extracting URL content:", error);
      toast({
        title: "Extraction Error",
        description: "Failed to extract content from URL",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUrl(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setSelectedFile(file);
    
    try {
      const result = await parseWordDocument(file);
      setContent(result.html);
      
      toast({
        title: "Document Parsed",
        description: "Document content loaded successfully",
      });
    } catch (error) {
      console.error("Error parsing document:", error);
      toast({
        title: "Parsing Error",
        description: "Failed to parse document",
        variant: "destructive"
      });
    }
  };
  
  const handleContentConfirm = async () => {
    if (contentMethod === 'link' && !content) {
      await handleUrlExtraction();
    }
    
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add your content before confirming",
        variant: "destructive"
      });
      return;
    }
    
    setContentConfirmed(true);
    
    toast({
      title: "Content Confirmed",
      description: "Content has been confirmed",
    });
    
    // Auto-generate primary keywords immediately after content is confirmed
    handleGeneratePrimaryKeywords();
  };
  
  const handleGeneratePrimaryKeywords = async () => {
    if (!content) return;
    
    try {
      setIsGeneratingPrimary(true);
      
      const suggestions = await generateKeywordSuggestions(
        content,
        3,
        "",
        user?.id,
        currentWorkspace?.id
      );
      
      setPrimaryKeywordSuggestions(suggestions);
      
      if (suggestions.length > 0 && !primaryKeyword) {
        setPrimaryKeyword(suggestions[0].text);
        
        // Auto-generate secondary keywords based on the first primary keyword
        handleGenerateSecondaryKeywords(suggestions[0].text);
      }
    } catch (error) {
      console.error("Error generating primary keywords:", error);
    } finally {
      setIsGeneratingPrimary(false);
    }
  };
  
  const handleGenerateSecondaryKeywords = async (primaryKey: string = primaryKeyword) => {
    if (!primaryKey || !content) return;
    
    try {
      setIsGeneratingSecondary(true);
      
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKey,
        content,
        5,
        "",
        user?.id,
        currentWorkspace?.id
      );
      
      setSecondaryKeywordSuggestions(suggestions);
    } catch (error) {
      console.error("Error generating secondary keywords:", error);
    } finally {
      setIsGeneratingSecondary(false);
    }
  };
  
  const handleSelectPrimaryKeyword = (keyword: string) => {
    setPrimaryKeyword(keyword);
    handleGenerateSecondaryKeywords(keyword);
  };
  
  const handleToggleSecondaryKeyword = (keyword: string) => {
    if (secondaryKeywords.includes(keyword)) {
      setSecondaryKeywords(secondaryKeywords.filter(k => k !== keyword));
    } else if (secondaryKeywords.length < 5) {
      setSecondaryKeywords([...secondaryKeywords, keyword]);
    } else {
      toast({
        title: "Maximum Keywords Reached",
        description: "You can select up to 5 secondary keywords",
        variant: "default"
      });
    }
  };
  
  const handleStartOptimization = () => {
    if (!contentConfirmed) {
      toast({
        title: "Content Required",
        description: "Please confirm your content first",
        variant: "destructive"
      });
      return;
    }
    
    if (!primaryKeyword) {
      toast({
        title: "Primary Keyword Required",
        description: "Please select a primary keyword",
        variant: "destructive"
      });
      return;
    }
    
    setIsOptimizing(true);
    
    setTimeout(() => {
      navigate('/seo-checker', {
        state: {
          content,
          primaryKeyword,
          secondaryKeywords
        }
      });
    }, 500);
  };
  
  return (
    <div className="max-w-2xl mx-auto" dir={isRtlContent ? 'rtl' : 'ltr'}>
      <h1 className="text-xl font-bold text-center mb-6">Quick SEO Optimization</h1>
      
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="p-4 border-b">
          <h2 className="text-center">1. Add your content</h2>
          
          <div className="flex justify-center space-x-4 my-4">
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
            <div className={`mb-4 ${editorFontClass}`}>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                readOnly={contentConfirmed}
                placeholder="Paste your article content here..."
                className={isRtlContent ? 'rtl-content' : 'ltr-content'}
              />
            </div>
          )}
          
          {contentMethod === 'link' && (
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Enter URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={contentConfirmed || isLoadingUrl}
                />
                <Button 
                  variant="outline" 
                  onClick={handleUrlExtraction}
                  disabled={contentConfirmed || isLoadingUrl || !url.trim()}
                >
                  {isLoadingUrl ? <Loader size={16} className="animate-spin" /> : "Extract"}
                </Button>
              </div>
              
              {content && !contentConfirmed && (
                <div className={`mt-4 ${editorFontClass}`}>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    formats={formats}
                    readOnly={contentConfirmed}
                    placeholder="Extracted content will appear here..."
                    className={isRtlContent ? 'rtl-content' : 'ltr-content'}
                  />
                </div>
              )}
            </div>
          )}
          
          {contentMethod === 'file' && (
            <div className="mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden"
                  accept=".doc,.docx"
                  onChange={handleFileUpload}
                  disabled={contentConfirmed}
                />
                <label 
                  htmlFor="file-upload"
                  className={`cursor-pointer text-purple-600 hover:text-purple-800 ${contentConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Click to upload or drag and drop
                </label>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-500">{selectedFile.name}</p>
                )}
              </div>
              
              {content && !contentConfirmed && (
                <div className={`mt-4 ${editorFontClass}`}>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    formats={formats}
                    readOnly={contentConfirmed}
                    placeholder="Document content will appear here..."
                    className={isRtlContent ? 'rtl-content' : 'ltr-content'}
                  />
                </div>
              )}
            </div>
          )}
          
          {!contentConfirmed && (
            <div className="text-center">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white" 
                onClick={handleContentConfirm}
                disabled={(!content && contentMethod !== 'link') || (contentMethod === 'link' && !url.trim() && !content)}
              >
                Confirm Content
              </Button>
            </div>
          )}
        </div>
        
        {contentConfirmed && (
          <div className="p-4 border-b">
            <h2 className="text-center mb-4">2. Add Keywords</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Primary Keyword:</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter your main keyword..."
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => handleGeneratePrimaryKeywords()}
                    disabled={isGeneratingPrimary}
                    className="whitespace-nowrap"
                  >
                    {isGeneratingPrimary ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-1" /> 
                        Suggest
                      </>
                    )}
                  </Button>
                </div>
                
                {primaryKeywordSuggestions.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 mt-1">
                      {primaryKeywordSuggestions.map((keyword) => (
                        <div 
                          key={keyword.id} 
                          className={`px-2 py-1 rounded-full text-sm cursor-pointer ${
                            primaryKeyword === keyword.text 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => handleSelectPrimaryKeyword(keyword.text)}
                        >
                          {keyword.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block mb-1">Secondary Keywords (Optional):</label>
                <div className="flex gap-2">
                  <Input
                    disabled
                    placeholder="Select up to 5 secondary keywords"
                    value={secondaryKeywords.join(', ')}
                    className="bg-gray-50"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => handleGenerateSecondaryKeywords()}
                    disabled={!primaryKeyword || isGeneratingSecondary}
                    className="whitespace-nowrap"
                  >
                    {isGeneratingSecondary ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-1" /> 
                        Suggest
                      </>
                    )}
                  </Button>
                </div>
                
                {secondaryKeywordSuggestions.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 mt-1">
                      {secondaryKeywordSuggestions.map((keyword) => (
                        <div 
                          key={keyword.id} 
                          className={`px-2 py-1 rounded-full text-sm cursor-pointer ${
                            secondaryKeywords.includes(keyword.text) 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => handleToggleSecondaryKeyword(keyword.text)}
                        >
                          {keyword.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Button 
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6" 
        onClick={handleStartOptimization}
        disabled={!contentConfirmed || !primaryKeyword || isOptimizing}
      >
        {isOptimizing ? (
          <>
            <Loader size={16} className="animate-spin mr-2" />
            Optimizing...
          </>
        ) : (
          "Start Quick Optimization"
        )}
      </Button>
    </div>
  );
};

export default SimpleOptimizationForm;
