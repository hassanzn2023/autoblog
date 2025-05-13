import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // تأكد من أن هذا المسار صحيح لمشروعك
import { Search, X, Loader, RefreshCw, Pencil, Link as LinkIcon, ExternalLink, AlertTriangle, Upload, FileText, Check } from 'lucide-react';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions, KeywordSuggestion } from '@/services/openaiService';
import { parseWordDocument } from '@/services/documentParserService';
import { extractContentFromUrl } from '@/services/contentExtractorService';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

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
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [contentConfirmed, setContentConfirmed] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);

  const [primaryKeywordSuggestions, setPrimaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  const [secondaryKeywordSuggestions, setSecondaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);

  const [primaryRegenerationNote, setPrimaryRegenerationNote] = useState('');
  const [secondaryRegenerationNote, setSecondaryRegenerationNote] = useState('');

  const [isGeneratingPrimary, setIsGeneratingPrimary] = useState(false);
  const [isGeneratingSecondary, setIsGeneratingSecondary] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileParsingError, setFileParsingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRtlContent, setIsRtlContent] = useState(false);

  useEffect(() => {
    setIsRtlContent(isRTL(content));
  }, [content]);

  const editorFontClass = isRtlContent ? 'font-arabic' : 'font-english';

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

  // لا يوجد useEffects للتوليد التلقائي هنا

  const handleUrlExtraction = async () => {
    if (!url.trim()) {
      toast({ title: "URL Required", description: "Please enter a valid URL.", variant: "destructive" });
      return false;
    }
    let processedUrl = url;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
      setUrl(processedUrl);
    }
    setIsLoadingUrl(true);
    setExtractionError(null);
    try {
      const extractedContent = await extractContentFromUrl(processedUrl);
      if (extractedContent && !extractedContent.error) {
        setContent(extractedContent.content || '');
        setIsRtlContent(extractedContent.rtl ?? isRTL(extractedContent.textContent || ''));
        toast({ title: "Content Extracted", description: `Successfully extracted from "${extractedContent.title || 'URL'}"` });
        return true;
      } else {
        const errorMessage = extractedContent.error || "Unable to extract content.";
        setExtractionError(errorMessage);
        toast({ title: "Extraction Failed", description: errorMessage, variant: "destructive" });
        return false;
      }
    } catch (error: any) {
      console.error("Error extracting content from URL:", error);
      const message = error.message || "Unknown error during URL extraction.";
      setExtractionError(message);
      toast({ title: "Extraction Error", description: message, variant: "destructive" });
      return false;
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleContentConfirm = async () => {
    if (contentMethod === 'link' && !content && url.trim()) { // تأكد من وجود رابط قبل محاولة الاستخراج
      const success = await handleUrlExtraction();
      if (!success) return;
    }
    if (!content.trim()) {
      toast({ title: "Content Required", description: "Please add your content before confirming.", variant: "destructive" });
      return;
    }
    setContentConfirmed(true);
    toast({ title: "Content Confirmed", description: "Your content has been added successfully." });
    // لا يوجد استدعاء تلقائي لتوليد الكلمات هنا
  };

  const handlePrimaryKeywordSelect = (keywordText: string) => {
    setPrimaryKeyword(keywordText);
  };

  const handleSecondaryKeywordToggle = (keywordText: string) => {
    if (secondaryKeywords.includes(keywordText)) {
      setSecondaryKeywords(prev => prev.filter(k => k !== keywordText));
    } else {
      if (secondaryKeywords.length < 7) { // تم تغيير الحد إلى 7 كما هو الحال في KeywordResearchStep
        setSecondaryKeywords(prev => [...prev, keywordText]);
      } else {
        toast({ title: "Maximum Keywords Reached", description: "You can select up to 7 secondary keywords.", variant: "default" });
      }
    }
  };

  const handleGeneratePrimaryKeywords = async (isRegeneration: boolean = false) => {
    if (!contentConfirmed || !content) {
      toast({ title: "Content Not Confirmed", description: "Please confirm your article content first.", variant: "destructive" });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({ title: "Authentication Required", description: "You must be logged in to perform this action.", variant: "destructive" });
      return;
    }

    setIsGeneratingPrimary(true);
    try {
      const noteToSend = isRegeneration ? primaryRegenerationNote : '';
      const suggestions = await generateKeywordSuggestions(content, 3, noteToSend, user.id, currentWorkspace.id);
      setPrimaryKeywordSuggestions(suggestions || []);
      if (suggestions && suggestions.length > 0) {
        toast({ title: isRegeneration ? "Primary Keywords Re-generated" : "Primary Keywords Suggested", description: "Review the suggestions." });
        if (isRegeneration) setPrimaryRegenerationNote('');
      } else if (!isRegeneration) {
        toast({ title: "No Suggestions", description: "Could not generate primary keyword suggestions at this time.", variant: "default" });
      }
    } catch (error: any) {
      console.error("Error generating primary keywords:", error);
      toast({ title: "Primary Suggestion Failed", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };

  const handleGenerateSecondaryKeywords = async (isRegeneration: boolean = false) => {
    if (!contentConfirmed || !content) {
      toast({ title: "Content Not Confirmed", description: "Please confirm your article content first.", variant: "destructive" });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({ title: "Authentication Required", description: "You must be logged in to perform this action.", variant: "destructive" });
      return;
    }

    setIsGeneratingSecondary(true);
    try {
      const noteToSend = isRegeneration ? secondaryRegenerationNote : '';
      const suggestions = await generateSecondaryKeywordSuggestions(primaryKeyword || '', content, 5, noteToSend, user.id, currentWorkspace.id);
      setSecondaryKeywordSuggestions(suggestions || []);
      if (suggestions && suggestions.length > 0) {
        toast({ title: isRegeneration ? "Secondary Keywords Re-generated" : "Secondary Keywords Suggested", description: "Review the suggestions." });
        if (isRegeneration) setSecondaryRegenerationNote('');
      } else if (!isRegeneration) {
        toast({ title: "No Suggestions", description: "Could not generate secondary keyword suggestions at this time.", variant: "default" });
      }
    } catch (error: any) {
      console.error("Error generating secondary keywords:", error);
      toast({ title: "Secondary Suggestion Failed", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsGeneratingSecondary(false);
    }
  };

  const handleRetryExtraction = () => handleUrlExtraction(); // تبسيط

  const handleStartOptimization = () => {
    if (!contentConfirmed) {
      toast({ title: "Content Not Confirmed", description: "Please confirm your content.", variant: "destructive" });
      return;
    }
    if (!primaryKeyword.trim()) {
      toast({ title: "Primary Keyword Required", description: "Please add or select a primary keyword.", variant: "destructive" });
      return;
    }
    setIsOptimizing(true);
    toast({ title: "Optimization Started", description: "Analyzing your content..." });
    setTimeout(() => {
      navigate('/seo-checker', { state: { content, primaryKeyword, secondaryKeywords } });
      setIsOptimizing(false);
    }, 1000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setFileParsingError("Please upload a valid Word document (.docx or .doc).");
      toast({ title: "Invalid File Type", description: "Only .docx and .doc files are supported.", variant: "destructive" });
      return;
    }
    setIsParsingFile(true);
    setFileParsingError(null);
    try {
      const result = await parseWordDocument(file);
      setContent(result.html);
      toast({ title: "File Uploaded", description: "Document parsed successfully." });
    } catch (error: any) {
      console.error("Error parsing file:", error);
      const message = error.message || "Failed to parse Word document.";
      setFileParsingError(message);
      toast({ title: "Parsing Error", description: message, variant: "destructive" });
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
        // محاكاة حدث تغيير الإدخال
        const mockEvent = { target: { files: event.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
        handleFileUpload(mockEvent);
    }
  };
  // JSX (واجهة المستخدم)
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Quick SEO Optimization</h1>
      <div className="space-y-8">
        {/* Content Section */}
        <div className={`p-6 border rounded-lg ${contentConfirmed ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'} shadow-sm`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">1. Add Your Content</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
              {(['text', 'link', 'file'] as const).map((method) => (
                <Label key={method} className={`flex items-center cursor-pointer p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${contentMethod === method ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input
                    type="radio"
                    name="contentMethod"
                    checked={contentMethod === method}
                    onChange={() => setContentMethod(method)}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={contentConfirmed}
                  />
                  {method === 'text' ? 'Add Text' : method === 'link' ? 'Add Link' : 'Upload File'}
                </Label>
              ))}
            </div>

            {contentMethod === 'text' && (
              <div className="quill-container">
                <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} formats={formats} readOnly={contentConfirmed} placeholder="Paste your article content here..." className={`${editorFontClass} ${isRtlContent ? 'rtl-editor' : 'ltr-editor'} bg-white dark:bg-gray-800 dark:text-gray-200 rounded-md`} />
              </div>
            )}
            {contentMethod === 'link' && (
              <div>
                <div className="flex gap-2 mb-4">
                  <Input type="url" className="flex-1 p-3 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" placeholder="Enter URL (e.g., https://example.com/article)" value={url} onChange={(e) => setUrl(e.target.value)} disabled={contentConfirmed || isLoadingUrl} />
                  {!contentConfirmed && (
                    <Button variant="outline" onClick={handleUrlExtraction} disabled={isLoadingUrl || !url.trim()} className="whitespace-nowrap">
                      {isLoadingUrl ? <Loader size={16} className="mr-2 animate-spin" /> : <ExternalLink size={16} className="mr-2" />} Extract
                    </Button>
                  )}
                </div>
                {isLoadingUrl && <div className="p-3 border rounded-md mb-4 text-center"><Loader size={20} className="animate-spin text-blue-600 inline mr-2" /> Extracting content...</div>}
                {extractionError && !isLoadingUrl && (
                  <div className="p-3 border border-red-300 bg-red-50 dark:bg-red-900/30 dark:border-red-700 rounded-md mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-500" />
                    <div className="flex-1"><p className="font-medium text-red-600 dark:text-red-400">Extraction Failed:</p><p className="text-sm text-red-500 dark:text-red-400">{extractionError}</p></div>
                    <Button variant="outline" size="sm" onClick={handleRetryExtraction}><RefreshCw size={14} className="mr-1" /> Retry</Button>
                  </div>
                )}
                {content && !contentConfirmed && (
                  <div className="mb-4">
                     <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Extracted Content (Editable):</Label>
                    <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} formats={formats} placeholder="Edit extracted content..." className={`${editorFontClass} ${isRtlContent ? 'rtl-editor' : 'ltr-editor'} bg-white dark:bg-gray-800 dark:text-gray-200 rounded-md`} />
                  </div>
                )}
              </div>
            )}
             {contentMethod === 'file' && (
              <div onDragOver={handleDragOver} onDrop={handleDrop} className={`border-2 border-dashed ${fileParsingError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-md p-6 text-center`}>
                <input type="file" id="file-upload-quick" className="hidden" ref={fileInputRef} accept=".doc,.docx" onChange={handleFileUpload} disabled={contentConfirmed || isParsingFile} />
                {!selectedFile && !content && !isParsingFile && (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload size={36} className="mb-3 text-gray-400 dark:text-gray-500" />
                    <Label htmlFor="file-upload-quick" className={`cursor-pointer font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ${contentConfirmed || isParsingFile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Choose a file
                    </Label>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">or drag and drop (.doc, .docx)</p>
                  </div>
                )}
                {isParsingFile && <div className="flex flex-col items-center justify-center py-4"><Loader size={36} className="mb-3 animate-spin text-blue-600" /><p>Parsing document...</p></div>}
                {selectedFile && !isParsingFile && !content && <div className="flex items-center justify-center py-2"><FileText size={24} className="text-gray-500 mr-2" /><span>{selectedFile.name}</span></div> }
                {fileParsingError && !isParsingFile && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{fileParsingError}</p>}
                {content && !contentConfirmed && contentMethod === 'file' && (
                    <div className="mt-4">
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parsed Content (Editable):</Label>
                        <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} formats={formats} placeholder="Edit parsed content..." className={`${editorFontClass} ${isRtlContent ? 'rtl-editor' : 'ltr-editor'} bg-white dark:bg-gray-800 dark:text-gray-200 rounded-md`} />
                    </div>
                )}
              </div>
            )}

            {!contentConfirmed && (content.trim() || (contentMethod === 'link' && url.trim())) && (
              <div className="text-center mt-6">
                <Button variant="default" onClick={handleContentConfirm} className="w-full sm:w-auto" disabled={(contentMethod === 'link' && isLoadingUrl) || (contentMethod === 'file' && isParsingFile) || !content.trim()}>
                  Confirm Content
                </Button>
              </div>
            )}
            {contentConfirmed && (
              <div className="flex items-center text-green-600 dark:text-green-400 mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md">
                <Check className="mr-2 h-5 w-5" />
                <span className="font-medium">Content Confirmed. You can now add keywords.</span>
              </div>
            )}
          </div>
        </div>

        {/* Keywords Section */}
        {contentConfirmed && (
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">2. Add Keywords</h2>
            <div className="space-y-6">
              {/* Primary Keyword Section */}
              <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                <Label htmlFor="quickFormPrimaryKeywordInput" className="text-base font-medium text-gray-700 dark:text-gray-300">Primary Keyword</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter your main keyword, or click "Suggest" for AI recommendations.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input id="quickFormPrimaryKeywordInput" type="text" className="flex-1 p-2 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200" placeholder="e.g., best coffee makers" value={primaryKeyword} onChange={(e) => setPrimaryKeyword(e.target.value)} disabled={isGeneratingPrimary} />
                  <Button variant="outline" onClick={() => handleGeneratePrimaryKeywords(false)} disabled={isGeneratingPrimary || isGeneratingSecondary} className="w-full sm:w-auto">
                    {isGeneratingPrimary && !primaryRegenerationNote ? <><Loader size={16} className="animate-spin mr-2" />Suggesting...</> : <><Search size={16} className="mr-2" />Suggest (3)</>}
                  </Button>
                </div>
                {isGeneratingPrimary && !primaryRegenerationNote && <div className="flex justify-center p-2"><Loader size={20} className="animate-spin text-blue-600" /></div>}
                {primaryKeywordSuggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestions (Select one):</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {primaryKeywordSuggestions.map((keyword) => (
                        <Button key={keyword.id} variant={primaryKeyword === keyword.text ? "default" : "outline"} size="sm" onClick={() => handlePrimaryKeywordSelect(keyword.text)} className={`transition-all ${primaryKeyword === keyword.text ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}>
                          {keyword.text}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <Label htmlFor="quickFormPrimaryRegenNote" className="text-sm font-medium text-gray-700 dark:text-gray-300">Refine Suggestions (Optional):</Label>
                      <div className="flex flex-col sm:flex-row gap-2 items-center mt-1">
                        <Input id="quickFormPrimaryRegenNote" type="text" placeholder="e.g., focus on affordability" value={primaryRegenerationNote} onChange={(e) => setPrimaryRegenerationNote(e.target.value)} className="flex-1 p-2 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200" disabled={isGeneratingPrimary} />
                        <Button variant="outline" size="sm" onClick={() => handleGeneratePrimaryKeywords(true)} disabled={isGeneratingPrimary || !primaryRegenerationNote.trim()} className="w-full sm:w-auto">
                          {isGeneratingPrimary && primaryRegenerationNote ? <><Loader size={16} className="animate-spin mr-2" />Re-generating...</> : <RefreshCw size={16} />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Keywords Section */}
              <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                <Label className="text-base font-medium text-gray-700 dark:text-gray-300">Secondary Keywords <span className="text-xs text-gray-400 dark:text-gray-500">(Optional, up to 7)</span></Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add related terms, or click "Suggest" for AI recommendations.</p>
                <div className="p-2 border border-gray-200 dark:border-gray-600 rounded-md min-h-[60px] bg-gray-50 dark:bg-gray-700/50 mb-2">
                  {secondaryKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {secondaryKeywords.map((keyword, index) => (
                        <div key={index} className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-md text-sm flex items-center gap-1.5">
                          <span>{keyword}</span>
                          <button onClick={() => handleSecondaryKeywordToggle(keyword)} className="text-blue-500 hover:text-red-500 dark:text-blue-300 dark:hover:text-red-400" aria-label={`Remove ${keyword}`}><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (<p className="text-xs text-gray-400 dark:text-gray-500 italic">No secondary keywords selected yet.</p>)}
                </div>
                <Button variant="outline" onClick={() => handleGenerateSecondaryKeywords(false)} disabled={isGeneratingSecondary || isGeneratingPrimary} className="w-full sm:w-auto">
                  {isGeneratingSecondary && !secondaryRegenerationNote ? <><Loader size={16} className="animate-spin mr-2" />Suggesting...</> : <><Search size={16} className="mr-2" />Suggest (5)</>}
                </Button>
                {isGeneratingSecondary && !secondaryRegenerationNote && <div className="flex justify-center p-2"><Loader size={20} className="animate-spin text-blue-600" /></div>}
                {secondaryKeywordSuggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestions (Select up to 7):</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {secondaryKeywordSuggestions.map((keyword) => (
                        <Button key={keyword.id} variant={secondaryKeywords.includes(keyword.text) ? "default" : "outline"} size="sm" onClick={() => handleSecondaryKeywordToggle(keyword.text)} disabled={!secondaryKeywords.includes(keyword.text) && secondaryKeywords.length >= 7} className={`transition-all ${secondaryKeywords.includes(keyword.text) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}>
                          {keyword.text}
                        </Button>
                      ))}
                    </div>
                     <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <Label htmlFor="quickFormSecondaryRegenNote" className="text-sm font-medium text-gray-700 dark:text-gray-300">Refine Suggestions (Optional):</Label>
                      <div className="flex flex-col sm:flex-row gap-2 items-center mt-1">
                        <Input id="quickFormSecondaryRegenNote" type="text" placeholder="e.g., for advanced users" value={secondaryRegenerationNote} onChange={(e) => setSecondaryRegenerationNote(e.target.value)} className="flex-1 p-2 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200" disabled={isGeneratingSecondary} />
                        <Button variant="outline" size="sm" onClick={() => handleGenerateSecondaryKeywords(true)} disabled={isGeneratingSecondary || !secondaryRegenerationNote.trim()} className="w-full sm:w-auto">
                          {isGeneratingSecondary && secondaryRegenerationNote ? <><Loader size={16} className="animate-spin mr-2" />Re-generating...</> : <RefreshCw size={16} />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button variant="default" size="lg" className="w-full text-center py-3 text-base" onClick={handleStartOptimization} disabled={isOptimizing || !contentConfirmed || !primaryKeyword.trim()}>
          {isOptimizing ? <><Loader className="mr-2 h-5 w-5 animate-spin" />Analyzing & Optimizing...</> : "Start Quick Optimization"}
        </Button>
      </div>
    </div>
  );
};

export default QuickOptimizationForm;