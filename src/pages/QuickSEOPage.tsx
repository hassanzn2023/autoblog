
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions } from '@/services/openaiService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Loader } from 'lucide-react';
import AuthRequired from '@/components/AuthRequired';

const QuickSEOPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const [content, setContent] = useState('');
  const [contentMethod, setContentMethod] = useState<'text' | 'link' | 'file'>('text');
  const [contentConfirmed, setContentConfirmed] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [url, setUrl] = useState('');
  const [isGeneratingPrimary, setIsGeneratingPrimary] = useState(false);
  const [isGeneratingSecondary, setIsGeneratingSecondary] = useState(false);
  const [primarySuggestions, setPrimarySuggestions] = useState<{id: string, text: string}[]>([]);
  const [secondarySuggestions, setSecondarySuggestions] = useState<{id: string, text: string}[]>([]);
  const [regenerationNote, setRegenerationNote] = useState('');
  const [isRtlContent, setIsRtlContent] = useState(false);
  
  // Detection for RTL text
  React.useEffect(() => {
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
  
  const handleContentConfirm = () => {
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
  
  const handleSuggestPrimary = async () => {
    if (!contentConfirmed || !content) {
      toast({
        title: "Content Required",
        description: "Please confirm your content first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || !currentWorkspace) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to use this feature.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsGeneratingPrimary(true);
      
      toast({
        title: "Generating Keywords",
        description: "Please wait while we analyze your content...",
      });
      
      const suggestions = await generateKeywordSuggestions(
        content, 
        3, 
        regenerationNote,
        user.id,
        currentWorkspace.id
      );
      
      console.log('Received primary keyword suggestions:', suggestions);
      setPrimarySuggestions(suggestions);
      
      if (suggestions.length > 0 && !primaryKeyword) {
        setPrimaryKeyword(suggestions[0].text);
      }
      
      toast({
        title: "Keywords Generated",
        description: "Primary keyword suggestions have been generated successfully.",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Error generating primary keywords:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate keyword suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };
  
  const handleSuggestSecondary = async () => {
    if (!contentConfirmed || !content) {
      toast({
        title: "Content Required",
        description: "Please confirm your content first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!primaryKeyword) {
      toast({
        title: "Primary Keyword Required",
        description: "Please select a primary keyword first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || !currentWorkspace) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to use this feature.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsGeneratingSecondary(true);
      
      toast({
        title: "Generating Secondary Keywords",
        description: "Please wait while we analyze your content...",
      });
      
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword,
        content,
        5,
        regenerationNote,
        user.id,
        currentWorkspace.id
      );
      
      console.log('Received secondary keyword suggestions:', suggestions);
      setSecondarySuggestions(suggestions);
      
      toast({
        title: "Keywords Generated",
        description: "Secondary keyword suggestions have been generated successfully.",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Error generating secondary keywords:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate keyword suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSecondary(false);
    }
  };
  
  const handleSelectSecondaryKeyword = (keyword: string) => {
    if (secondaryKeywords.includes(keyword)) {
      setSecondaryKeywords(secondaryKeywords.filter(k => k !== keyword));
    } else if (secondaryKeywords.length < 5) {
      setSecondaryKeywords([...secondaryKeywords, keyword]);
    } else {
      toast({
        title: "Maximum Keywords Reached",
        description: "You can select up to 5 secondary keywords.",
        variant: "destructive"
      });
    }
  };
  
  const handleStartOptimization = () => {
    if (!primaryKeyword) {
      toast({
        title: "Primary Keyword Required",
        description: "Please select a primary keyword before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/seo-checker', { 
      state: { 
        content, 
        primaryKeyword, 
        secondaryKeywords 
      } 
    });
  };
  
  return (
    <AuthRequired>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Quick SEO Optimization</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6">
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
                <div className={isRtlContent ? 'rtl' : 'ltr'}>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    readOnly={contentConfirmed}
                    placeholder="Paste your article content here..."
                    className={contentConfirmed ? 'opacity-70' : ''}
                  />
                </div>
              )}
              
              {contentMethod === 'link' && (
                <div className="flex gap-2">
                  <Input 
                    type="url" 
                    placeholder="Enter URL to your content..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={contentConfirmed}
                    className="flex-1"
                  />
                  <Button
                    disabled={!url.trim() || contentConfirmed}
                    variant="outline"
                  >
                    Extract
                  </Button>
                </div>
              )}
              
              {contentMethod === 'file' && (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden"
                    disabled={contentConfirmed}
                  />
                  <label 
                    htmlFor="file-upload"
                    className={`cursor-pointer text-purple-600 hover:text-purple-800 ${contentConfirmed ? 'opacity-50' : ''}`}
                  >
                    Click to upload or drag and drop
                  </label>
                </div>
              )}
              
              <div className="text-center">
                <Button 
                  onClick={handleContentConfirm}
                  disabled={contentConfirmed || !content.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Confirm Content
                </Button>
                
                {contentConfirmed && (
                  <p className="text-green-600 mt-2 text-sm">Content confirmed ✓</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">2. Add Keywords</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block font-medium">Primary Keyword:</label>
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    placeholder="Enter your main keyword..."
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSuggestPrimary}
                    disabled={!contentConfirmed || isGeneratingPrimary}
                    variant="outline"
                  >
                    {isGeneratingPrimary ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        <span>Generating...</span>
                      </>
                    ) : "Suggest"}
                  </Button>
                </div>
                
                {primarySuggestions.length > 0 && (
                  <div className="mt-3">
                    <label className="text-sm text-gray-500 mb-2 block">Suggestions:</label>
                    <div className="flex flex-wrap gap-2">
                      {primarySuggestions.map((keyword) => (
                        <div
                          key={keyword.id}
                          onClick={() => setPrimaryKeyword(keyword.text)}
                          className={`text-xs py-1 px-2 rounded-full cursor-pointer ${
                            primaryKeyword === keyword.text 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {keyword.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="block font-medium">Secondary Keywords (Optional):</label>
                <div className="flex gap-2">
                  <div className="flex-1 border rounded-md p-2 min-h-[4rem] flex flex-wrap gap-2">
                    {secondaryKeywords.map((keyword, i) => (
                      <div key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                        {keyword}
                        <button 
                          onClick={() => setSecondaryKeywords(secondaryKeywords.filter((_, idx) => idx !== i))} 
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {secondaryKeywords.length === 0 && (
                      <span className="text-gray-400 text-sm">Select up to 5 secondary keywords</span>
                    )}
                  </div>
                  <Button 
                    onClick={handleSuggestSecondary}
                    disabled={!contentConfirmed || !primaryKeyword || isGeneratingSecondary}
                    variant="outline"
                  >
                    {isGeneratingSecondary ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        <span>Generating...</span>
                      </>
                    ) : "Suggest"}
                  </Button>
                </div>
                
                {secondarySuggestions.length > 0 && (
                  <div className="mt-3">
                    <label className="text-sm text-gray-500 mb-2 block">Suggestions (click to select):</label>
                    <div className="flex flex-wrap gap-2">
                      {secondarySuggestions.map((keyword) => (
                        <div
                          key={keyword.id}
                          onClick={() => handleSelectSecondaryKeyword(keyword.text)}
                          className={`text-xs py-1 px-2 rounded-full cursor-pointer ${
                            secondaryKeywords.includes(keyword.text) 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {keyword.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {(primarySuggestions.length > 0 || secondarySuggestions.length > 0) && (
                <div className="space-y-2">
                  <label className="block text-sm">Regeneration Note:</label>
                  <Input 
                    type="text"
                    placeholder="Add note for regeneration..."
                    value={regenerationNote}
                    onChange={(e) => setRegenerationNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={handleStartOptimization}
            disabled={!contentConfirmed || !primaryKeyword}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 text-lg"
          >
            Start Quick Optimization
          </Button>
        </div>
      </div>
    </AuthRequired>
  );
};

export default QuickSEOPage;
