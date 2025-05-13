import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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

  // فصل حقول الملاحظات
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
  const modules = { /* ... */ };
  const formats = [ /* ... */ ];

  const handleUrlExtraction = async () => { /* ... (الكود الحالي جيد) ... */ return false; };

  const handleContentConfirm = async () => {
    if (contentMethod === 'link' && !content) {
      const success = await handleUrlExtraction();
      if (!success) return;
    }
    if (!content.trim()) {
      toast({ title: "Content Required", description: "Please add your content before confirming.", variant: "destructive" });
      return;
    }
    setContentConfirmed(true);
    toast({ title: "Content Confirmed", description: "Your content has been added successfully." });
    // لا تستدعي أي دالة توليد هنا
  };

  const handlePrimaryKeywordSelect = (keywordText: string) => {
    setPrimaryKeyword(keywordText);
  };

  const handleSecondaryKeywordToggle = (keywordText: string) => {
    if (secondaryKeywords.includes(keywordText)) {
      setSecondaryKeywords(secondaryKeywords.filter(k => k !== keywordText));
    } else {
      if (secondaryKeywords.length < 5) {
        setSecondaryKeywords([...secondaryKeywords, keywordText]);
      } else {
        toast({ title: "Maximum Keywords Reached", description: "You can select up to 5 secondary keywords.", variant: "default" });
      }
    }
  };

  const handleGeneratePrimaryKeywords = async (isRegeneration: boolean = false) => {
    if (!contentConfirmed || !content) {
      toast({ title: "Content Required", description: "Please confirm your article content first.", variant: "destructive" });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
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
        toast({ title: "No Suggestions", description: "Could not generate primary keyword suggestions.", variant: "default" });
      }
    } catch (error: any) {
      toast({ title: "Primary Suggestion Failed", description: error.message || "Failed to process primary keywords.", variant: "destructive" });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };

  const handleGenerateSecondaryKeywords = async (isRegeneration: boolean = false) => {
    if (!contentConfirmed || !content) {
      toast({ title: "Content Required", description: "Please confirm your article content first.", variant: "destructive" });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
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
        toast({ title: "No Suggestions", description: "Could not generate secondary keyword suggestions.", variant: "default" });
      }
    } catch (error: any) {
      toast({ title: "Secondary Suggestion Failed", description: error.message || "Failed to process secondary keywords.", variant: "destructive" });
    } finally {
      setIsGeneratingSecondary(false);
    }
  };

  const handleRetryExtraction = async () => { /* ... */ };
  const handleStartOptimization = () => { /* ... */ };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => { /* ... */ };
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => { /* ... */ };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick SEO Optimization</h1>
      <div className="space-y-8">
        {/* Content Section */}
        <div className={`p-6 border rounded-lg ${contentConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-200'} shadow-sm`}>
          <h2 className="text-lg font-medium mb-4">1. Add your content</h2>
          <div className="space-y-4">
            {/* ... (خيارات إدخال المحتوى) ... */}
            {!contentConfirmed && (contentMethod === 'text' || (contentMethod === 'link' && content) || (contentMethod === 'file' && content)) && (
              <div className="text-center mt-4">
                <Button variant="seoButton" onClick={handleContentConfirm} className="z-10 relative" disabled={ (contentMethod === 'link' && isLoadingUrl) || (contentMethod === 'file' && isParsingFile)}>
                  Confirm Content
                </Button>
              </div>
            )}
            {contentConfirmed && (
              <div className="flex items-center text-green-600 mt-4">
                <Check className="mr-2" />
                <span>Content added/confirmed.</span>
              </div>
            )}
          </div>
        </div>

        {/* Keywords Section - يظهر فقط بعد تأكيد المحتوى */}
        {contentConfirmed && (
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">2. Add Keywords</h2>
            <div className="space-y-6">
              {/* Primary Keyword Section */}
              <div className="space-y-2 p-4 border rounded-md">
                <Label htmlFor="quickFormPrimaryKeywordInput" className="block font-medium">Primary Keyword:</Label>
                <div className="flex gap-2">
                  <Input
                    id="quickFormPrimaryKeywordInput"
                    type="text"
                    className="flex-1 p-3 border border-gray-300 rounded-md"
                    placeholder="Enter your main keyword..."
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                    disabled={isGeneratingPrimary}
                  />
                  <Button
                    variant="outline" //  غيرت هذا ليكون مطابقًا لـ KeywordResearchStep
                    onClick={() => handleGeneratePrimaryKeywords(false)}
                    className="flex items-center gap-2" //  إضافة flex و gap
                    disabled={!contentConfirmed || isGeneratingPrimary || isGeneratingSecondary}
                  >
                    {isGeneratingPrimary && !primaryRegenerationNote ? (
                      <><Loader size={16} className="animate-spin mr-2" /> Suggesting...</>
                    ) : (
                      <><Search size={16} className="mr-2 text-gray-600" /> Suggest (3)</> // إضافة أيقونة وعدد
                    )}
                  </Button>
                </div>

                {isGeneratingPrimary && !primaryRegenerationNote && (
                    <div className="flex justify-center py-2"><Loader size={20} className="animate-spin text-purple-600" /></div>
                )}

                {primaryKeywordSuggestions.length > 0 && (
                  <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div className="mb-3 font-medium">Suggested (select one):</div>
                    <div className="flex flex-wrap gap-2"> {/* استخدام flex-wrap لعرض الاقتراحات */}
                      {primaryKeywordSuggestions.map((keyword) => (
                        <div
                          key={keyword.id}
                          className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${primaryKeyword === keyword.text ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                          onClick={() => handlePrimaryKeywordSelect(keyword.text)}
                        >
                          {keyword.text}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <Label htmlFor="quickFormPrimaryRegenNote" className="text-sm text-gray-500">Refine Primary Suggestions:</Label> {/*  تغيير طفيف في النص */}
                      <div className="flex gap-2 items-center mt-1">
                        <Input
                          id="quickFormPrimaryRegenNote"
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="e.g., focus on AI in marketing"
                          value={primaryRegenerationNote}
                          onChange={(e) => setPrimaryRegenerationNote(e.target.value)}
                          disabled={isGeneratingPrimary}
                        />
                        <Button
                          variant="outline"
                          size="sm" //  مطابقة لـ KeywordResearchStep
                          onClick={() => handleGeneratePrimaryKeywords(true)}
                          className="flex items-center gap-1" //  إضافة flex و gap
                          disabled={isGeneratingPrimary || !contentConfirmed || !primaryRegenerationNote.trim()}
                        >
                          {isGeneratingPrimary && primaryRegenerationNote ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                           {/* لا يوجد نص هنا إذا كان هناك أيقونة فقط، أو يمكنك إضافة "Re-generate" */}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Keywords Section */}
              <div className="space-y-2 p-4 border rounded-md">
                <Label className="block font-medium">Secondary Keywords (Optional):</Label>
                <div className="flex-1 p-3 border border-gray-300 rounded-md min-h-[80px] bg-white mb-2">
                  {secondaryKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {secondaryKeywords.map((keyword, index) => (
                        <div key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1">
                          <span>{keyword}</span>
                          <button onClick={() => handleSecondaryKeywordToggle(keyword)} className="text-blue-500 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No secondary keywords selected.</span>
                  )}
                </div>
                <Button
                  variant="outline" //  مطابقة
                  onClick={() => handleGenerateSecondaryKeywords(false)}
                  className="flex items-center gap-2" // إضافة flex و gap
                  disabled={!contentConfirmed || isGeneratingSecondary || isGeneratingPrimary} //  تحديث الشرط
                >
                  {isGeneratingSecondary && !secondaryRegenerationNote ? (
                     <><Loader size={16} className="animate-spin mr-2" /> Suggesting...</>
                  ) : (
                     <><Search size={16} className="mr-2 text-gray-600" /> Suggest (5)</> // إضافة أيقونة وعدد
                  )}
                </Button>

                {isGeneratingSecondary && !secondaryRegenerationNote && (
                    <div className="flex justify-center py-2"><Loader size={20} className="animate-spin text-purple-600" /></div>
                )}

                {secondaryKeywordSuggestions.length > 0 && (
                  <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div className="mb-3 font-medium">Suggested (select multiple, max 5):</div>
                    <div className="flex flex-wrap gap-2"> {/* استخدام flex-wrap */}
                      {secondaryKeywordSuggestions.map((keyword) => (
                        <label key={keyword.id} className={`flex items-center cursor-pointer px-3 py-1.5 rounded-full text-sm ${secondaryKeywords.includes(keyword.text) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} ${(!secondaryKeywords.includes(keyword.text) && secondaryKeywords.length >= 5) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input type="checkbox" className="sr-only" checked={secondaryKeywords.includes(keyword.text)} onChange={() => handleSecondaryKeywordToggle(keyword.text)} disabled={!secondaryKeywords.includes(keyword.text) && secondaryKeywords.length >= 5}/>
                          {keyword.text}
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <Label htmlFor="quickFormSecondaryRegenNote" className="text-sm text-gray-500">Refine Secondary Suggestions:</Label> {/*  تغيير طفيف في النص */}
                      <div className="flex gap-2 items-center mt-1">
                        <Input
                          id="quickFormSecondaryRegenNote"
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="e.g., long-tail, for beginners"
                          value={secondaryRegenerationNote}
                          onChange={(e) => setSecondaryRegenerationNote(e.target.value)}
                          disabled={isGeneratingSecondary}
                        />
                        <Button
                          variant="outline"
                          size="sm" //  مطابقة
                          onClick={() => handleGenerateSecondaryKeywords(true)}
                          className="flex items-center gap-1" // إضافة flex و gap
                          disabled={isGeneratingSecondary || !contentConfirmed || !secondaryRegenerationNote.trim()}
                        >
                          {isGeneratingSecondary && secondaryRegenerationNote ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                           {/* لا يوجد نص هنا إذا كان هناك أيقونة فقط، أو يمكنك إضافة "Re-generate" */}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button variant="seoButton" className="w-full text-center py-3" onClick={handleStartOptimization} disabled={isOptimizing || !contentConfirmed || !primaryKeyword.trim()}>
          {isOptimizing ? ( <div className="flex items-center justify-center"><Loader className="mr-2 h-5 w-5 animate-spin text-white" /><span>Analyzing...</span></div>) : ( "Start Quick Optimization" )}
        </Button>
      </div>
    </div>
  );
};

export default QuickOptimizationForm;