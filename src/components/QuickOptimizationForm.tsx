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

  //  لا تزال هذه الحالات موجودة للتحكم في عرض/إخفاء واجهة الاقتراحات
  const [showPrimaryKeywordSuggestions, setShowPrimaryKeywordSuggestions] = useState(false);
  const [showSecondaryKeywordSuggestions, setShowSecondaryKeywordSuggestions] = useState(false);

  const [primaryKeywordSuggestions, setPrimaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  const [secondaryKeywordSuggestions, setSecondaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);

  // --- فصل حقول الملاحظات ---
  const [primaryRegenerationNote, setPrimaryRegenerationNote] = useState('');
  const [secondaryRegenerationNote, setSecondaryRegenerationNote] = useState('');
  // --- نهاية فصل حقول الملاحظات ---

  //  const [isLoading, setIsLoading] = useState(false); //  غير مستخدمة
  const [isGeneratingPrimary, setIsGeneratingPrimary] = useState(false);
  const [isGeneratingSecondary, setIsGeneratingSecondary] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  //  const [extractionAttempts, setExtractionAttempts] = useState(0); //  غير مستخدمة

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

  // --- لا يوجد useEffects للتوليد التلقائي هنا ---

  const handleUrlExtraction = async () => { /* ... (الكود الحالي جيد) ... */ return false; };

  // --- تعديل handleContentConfirm لإزالة التوليد التلقائي ---
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
    // لا تستدعي handleGeneratePrimaryKeywords هنا
  };
  // --- نهاية تعديل handleContentConfirm ---

  const handlePrimaryKeywordSelect = (keywordText: string) => {
    setPrimaryKeyword(keywordText);
    setShowPrimaryKeywordSuggestions(false); //  إبقاء هذا لإخفاء القائمة بعد الاختيار
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

  // --- تعديل handleGeneratePrimaryKeywords ---
  const handleTriggerPrimarySuggestions = async (isRegen: boolean = false) => {
    if (!contentConfirmed || !content) {
      toast({ title: "Content Required", description: "Please confirm your content first.", variant: "destructive" });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsGeneratingPrimary(true);
    setShowPrimaryKeywordSuggestions(true); //  إظهار قسم الاقتراحات عند بدء التوليد

    try {
      const noteToSend = isRegen ? primaryRegenerationNote : ''; // استخدام الملاحظة الصحيحة
      const suggestions = await generateKeywordSuggestions(
        content,
        3,
        noteToSend,
        user.id,
        currentWorkspace.id
      );
      setPrimaryKeywordSuggestions(suggestions || []);
      if (suggestions && suggestions.length > 0) {
        //   لا نقم بتحديد أول اقتراح تلقائيًا إلا إذا كان هذا هو السلوك المرغوب
        // if (!primaryKeyword && !isRegen) {
        //   setPrimaryKeyword(suggestions[0].text);
        // }
        toast({ title: isRegen ? "Primary Keywords Re-generated" : "Primary Keywords Suggested", description: "Please select a primary keyword." });
        if (isRegen) setPrimaryRegenerationNote('');
      } else if (!isRegen) {
        toast({ title: "No Suggestions", description: "Unable to generate primary keyword suggestions.", variant: "default" });
      }
    } catch (error: any) {
      console.error("Error generating primary keywords:", error);
      toast({ title: "Generation Error", description: error.message || "An error occurred while generating keywords.", variant: "destructive" });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };
  // --- نهاية تعديل handleGeneratePrimaryKeywords ---

  // --- تعديل handleGenerateSecondaryKeywords ---
  const handleTriggerSecondarySuggestions = async (isRegen: boolean = false) => {
    if (!contentConfirmed || !content) {
      toast({ title: "Content Required", description: "Please confirm your content first.", variant: "destructive" });
      return;
    }
    //  الخطة الأصلية سمحت بتوليد الكلمات الثانوية بدون أساسية، لذا لا يوجد شرط على primaryKeyword هنا للاقتراح الأولي
    if (!user?.id || !currentWorkspace?.id) {
      toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsGeneratingSecondary(true);
    setShowSecondaryKeywordSuggestions(true); // إظهار قسم الاقتراحات

    try {
      const noteToSend = isRegen ? secondaryRegenerationNote : ''; // استخدام الملاحظة الصحيحة
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword || '',
        content,
        5,
        noteToSend,
        user.id,
        currentWorkspace.id
      );
      setSecondaryKeywordSuggestions(suggestions || []);
      if (suggestions && suggestions.length > 0) {
        toast({ title: isRegen ? "Secondary Keywords Re-generated" : "Secondary Keywords Suggested", description: "Please select up to 5 secondary keywords." });
        if (isRegen) setSecondaryRegenerationNote('');
      } else if (!isRegen) {
        toast({ title: "No Suggestions", description: "Unable to generate secondary keyword suggestions.", variant: "default" });
      }
    } catch (error: any) {
      console.error("Error generating secondary keywords:", error);
      toast({ title: "Generation Error", description: error.message || "An error occurred while generating keywords.", variant: "destructive" });
    } finally {
      setIsGeneratingSecondary(false);
    }
  };
  // --- نهاية تعديل handleGenerateSecondaryKeywords ---

  const handleRetryExtraction = async () => { /* ... */ };
  const handleStartOptimization = () => { /* ... */ };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => { /* ... */ };
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => { /* ... */ };

  // --- JSX المحدث ---
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick SEO Optimization</h1>
      <div className="space-y-8">
        {/* Content Section */}
        <div className={`p-6 border rounded-lg ${contentConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-200'} shadow-sm`}>
          {/* ... (كود قسم المحتوى يبقى كما هو) ... */}
           <h2 className="text-lg font-medium mb-4">1. Add your content</h2>
          {/* ... (خيارات إدخال المحتوى، نفس الكود السابق جيد هنا) ... */}
            {!contentConfirmed && (contentMethod === 'text' || (contentMethod === 'link' && content) || (contentMethod === 'file' && content)) && (
              <div className="text-center mt-4">
                <Button
                  variant="seoButton"
                  onClick={handleContentConfirm}
                  className="z-10 relative"
                  disabled={ (contentMethod === 'link' && isLoadingUrl) || (contentMethod === 'file' && isParsingFile)}
                >
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

        {/* Keywords Section - يظهر فقط بعد تأكيد المحتوى */}
        {contentConfirmed && (
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">2. Add Keywords</h2>
            <div className="space-y-6">
              {/* Primary Keyword Section */}
              <div className="space-y-2">
                <Label htmlFor="quickFormPrimaryKeywordInputOuter" className="block font-medium">Primary Keyword:</Label>
                <div className="flex gap-2">
                  <Input
                    id="quickFormPrimaryKeywordInputOuter"
                    type="text"
                    className="flex-1 p-3 border border-gray-300 rounded-md"
                    placeholder="Enter your main keyword..."
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                    disabled={isGeneratingPrimary}
                  />
                  <Button
                    variant="outline" //  تغيير إلى outline ليتناسب مع التصميم الحالي
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                    onClick={() => {
                        if (!showPrimaryKeywordSuggestions) { //  إذا كانت القائمة مخفية، قم بالتوليد وإظهارها
                            handleTriggerPrimarySuggestions(false);
                        } else { //  إذا كانت القائمة ظاهرة، قم بإخفائها فقط
                            setShowPrimaryKeywordSuggestions(false);
                        }
                    }}
                    disabled={!contentConfirmed || isGeneratingPrimary}
                  >
                    <Search size={16} className="text-gray-600" />
                    {showPrimaryKeywordSuggestions ? "Hide Suggestions" : "Suggest"}
                  </Button>
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
                              name="primaryKeywordRadio" //  اسم موحد للـ radio buttons
                              className="mr-2"
                              checked={primaryKeyword === keyword.text}
                              onChange={() => handlePrimaryKeywordSelect(keyword.text)}
                            />
                            {keyword.text}
                          </label>
                        ))
                      ) : (
                        <p>No suggestions available. Try regenerating or adjusting content.</p>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500 flex-1 mr-2"> {/*  تعديل لـ flex-1 mr-2 */}
                        <Input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Regeneration note..."
                          value={primaryRegenerationNote} //  استخدام الملاحظة الصحيحة
                          onChange={(e) => setPrimaryRegenerationNote(e.target.value)}
                          disabled={isGeneratingPrimary}
                        />
                      </div>
                      <Button
                        variant="outline" //  تغيير إلى outline
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                        onClick={() => handleTriggerPrimarySuggestions(true)} //  استدعاء مع isRegen = true
                        disabled={isGeneratingPrimary || !primaryRegenerationNote.trim()}
                      >
                        {isGeneratingPrimary && primaryRegenerationNote ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <RefreshCw size={16} />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Keywords Section */}
              <div className="space-y-2">
                <Label className="block font-medium">Secondary Keywords (Optional):</Label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 border border-gray-300 rounded-md min-h-[80px] bg-white">
                    {/* ... (عرض الكلمات الثانوية المختارة - الكود الحالي جيد) ... */}
                     {secondaryKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {secondaryKeywords.map((keyword, index) => (
                            <div key={index} className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">
                              <span>{keyword}</span>
                              <button onClick={() => handleSecondaryKeywordToggle(keyword)} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
                            </div>
                          ))}
                        </div>
                      ) : (<span className="text-gray-400">Select up to 5 secondary keywords</span>)}
                  </div>
                  <Button
                    variant="outline" //  تغيير إلى outline
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md h-fit flex items-center gap-1 transition-colors"
                    onClick={() => {
                        if (!showSecondaryKeywordSuggestions) {
                            handleTriggerSecondarySuggestions(false);
                        } else {
                            setShowSecondaryKeywordSuggestions(false);
                        }
                    }}
                    disabled={!contentConfirmed || isGeneratingSecondary} //  يمكن إزالة الاعتماد على primaryKeyword إذا أردنا
                  >
                    <Search size={16} className="text-gray-600" />
                    {showSecondaryKeywordSuggestions ? "Hide Suggestions" : "Suggest"}
                  </Button>
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
                        <p>No suggestions available. Try regenerating or adjusting content/primary keyword.</p>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500 flex-1 mr-2">
                        <div className="flex items-center gap-1"> {/*  تعديل بسيط هنا */}
                          <Input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Regeneration note..."
                            value={secondaryRegenerationNote} //  استخدام الملاحظة الصحيحة
                            onChange={(e) => setSecondaryRegenerationNote(e.target.value)}
                            disabled={isGeneratingSecondary}
                          />
                           {/* <Pencil size={16} className="text-gray-400" />  //  يمكن إزالة هذه الأيقونة إذا لم تكن مرغوبة */}
                        </div>
                      </div>
                      <Button
                        variant="outline" //  تغيير إلى outline
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                        onClick={() => handleTriggerSecondarySuggestions(true)} //  استدعاء مع isRegen = true
                        disabled={isGeneratingSecondary || !secondaryRegenerationNote.trim()}
                      >
                        {isGeneratingSecondary && secondaryRegenerationNote ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <RefreshCw size={16} />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          variant="seoButton"
          className="w-full text-center py-3"
          onClick={handleStartOptimization}
          disabled={isOptimizing || !contentConfirmed || !primaryKeyword.trim()}
        >
          {isOptimizing ? ( /* ... */ ) : ( "Start Quick Optimization" )}
        </Button>
      </div>
    </div>
  );
};

export default QuickOptimizationForm;