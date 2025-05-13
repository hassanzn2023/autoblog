import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Search, X, Loader, RefreshCw, Pencil, Link as LinkIcon, ExternalLink, AlertTriangle, Upload, FileText, Check } from 'lucide-react';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions, KeywordSuggestion as ImportedKeywordSuggestion } from '@/services/openaiService'; // تم تغيير اسم النوع المستورد
import { parseWordDocument } from '@/services/documentParserService';
import { extractContentFromUrl } from '@/services/contentExtractorService';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// استخدام النوع المستورد مباشرة
// interface Keyword {
//   id: string;
//   text: string;
// }

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
  const [showPrimaryKeywordSuggestions, setShowPrimaryKeywordSuggestions] = useState(false);
  const [showSecondaryKeywordSuggestions, setShowSecondaryKeywordSuggestions] = useState(false);
  const [primaryKeywordSuggestions, setPrimaryKeywordSuggestions] = useState<ImportedKeywordSuggestion[]>([]); // استخدام النوع المستورد
  const [secondaryKeywordSuggestions, setSecondaryKeywordSuggestions] = useState<ImportedKeywordSuggestion[]>([]); // استخدام النوع المستورد
  
  // --- سأبقي regenerationNote واحدة مبدئيًا للحفاظ على الشكل، ولكن الأفضل فصلها ---
  const [regenerationNote, setRegenerationNote] = useState('');
  // const [primaryRegenerationNote, setPrimaryRegenerationNote] = useState('');
  // const [secondaryRegenerationNote, setSecondaryRegenerationNote] = useState('');
  // --- نهاية ---

  // const [isLoading, setIsLoading] = useState(false); // غير مستخدمة
  const [isGeneratingPrimary, setIsGeneratingPrimary] = useState(false);
  const [isGeneratingSecondary, setIsGeneratingSecondary] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  // const [extractionAttempts, setExtractionAttempts] = useState(0); // غير مستخدمة

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

  // --- حذف useEffects المسؤولة عن التوليد التلقائي ---
  // useEffect(() => {
  //   if (contentConfirmed && content) {
  //     // handleGeneratePrimaryKeywords(); // محذوف
  //   }
  // }, [contentConfirmed]);

  // useEffect(() => {
  //   if (primaryKeyword && contentConfirmed && content) {
  //     // handleGenerateSecondaryKeywords(); // محذوف
  //   }
  // }, [primaryKeyword]);
  // --- نهاية حذف useEffects ---


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
    setShowPrimaryKeywordSuggestions(false); //  الحفاظ على هذا السلوك لإخفاء القائمة بعد الاختيار
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

  // --- تعديل دوال التوليد ---
  const handleSuggestAndTogglePrimary = () => {
    if (!showPrimaryKeywordSuggestions || primaryKeywordSuggestions.length === 0) {
      // إذا كانت القائمة مخفية أو فارغة، قم بالتوليد والعرض
      handleGeneratePrimaryKeywordsInternal(false); // استدعاء دالة التوليد الفعلية
    }
    setShowPrimaryKeywordSuggestions(!showPrimaryKeywordSuggestions); // تبديل حالة العرض
  };

  const handleRegeneratePrimary = () => {
    handleGeneratePrimaryKeywordsInternal(true); // استدعاء دالة التوليد الفعلية مع وضع إعادة التوليد
  };

  const handleGeneratePrimaryKeywordsInternal = async (isRegeneration: boolean) => {
    if (!contentConfirmed || !content) { //  التأكد من تأكيد المحتوى
      toast({ title: "Content Required", description: "Please confirm your content before generating keywords.", variant: "destructive" });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({ title: "Authentication Required", description: "Please log in to generate keywords.", variant: "destructive" });
      return;
    }
    setIsGeneratingPrimary(true);
    // setShowPrimaryKeywordSuggestions(true); // سيتم التحكم به بواسطة handleSuggestAndTogglePrimary

    try {
      const noteToSend = isRegeneration ? regenerationNote : ''; //  استخدام regenerationNote الموحدة مؤقتًا
      const suggestions = await generateKeywordSuggestions(
        content,
        3,
        noteToSend,
        user.id,
        currentWorkspace.id
      );
      setPrimaryKeywordSuggestions(suggestions || []);
      if (suggestions && suggestions.length > 0) {
        // لا تقم بتحديد أول اقتراح تلقائيًا إلا إذا كان هذا هو السلوك المرغوب فيه بشدة
        // if (!primaryKeyword && !isRegeneration) {
        //   setPrimaryKeyword(suggestions[0].text);
        // }
        if (isRegeneration) setRegenerationNote(''); //  مسح الملاحظة بعد الاستخدام
        toast({ title: isRegeneration ? "Primary Keywords Re-generated" : "Primary Keywords Generated", description: "Please select a primary keyword." });
      } else if (!isRegeneration) {
        toast({ title: "Generation Failed", description: "Unable to generate keyword suggestions. Please try again.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Error generating primary keywords:", error);
      toast({ title: "Generation Error", description: "An error occurred while generating keywords.", variant: "destructive" });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };

  const handleSuggestAndToggleSecondary = () => {
    if (!showSecondaryKeywordSuggestions || secondaryKeywordSuggestions.length === 0) {
      handleGenerateSecondaryKeywordsInternal(false);
    }
    setShowSecondaryKeywordSuggestions(!showSecondaryKeywordSuggestions);
  };

  const handleRegenerateSecondary = () => {
    handleGenerateSecondaryKeywordsInternal(true);
  };

  const handleGenerateSecondaryKeywordsInternal = async (isRegeneration: boolean) => {
    if (!contentConfirmed || !content) { // التأكد من تأكيد المحتوى
        toast({ title: "Content Required", description: "Please confirm your content first.", variant: "destructive" });
        return;
    }
    if (!primaryKeyword && !isRegeneration) { //  يمكن إبقاء هذا الشرط للاقتراح الثانوي الأولي
      toast({ title: "Primary Keyword Required", description: "Please select a primary keyword first for secondary suggestions.", variant: "destructive" });
      return;
    }
    if (!user?.id || !currentWorkspace?.id) {
      toast({ title: "Authentication Required", description: "Please log in to generate keywords.", variant: "destructive" });
      return;
    }
    setIsGeneratingSecondary(true);
    // setShowSecondaryKeywordSuggestions(true);

    try {
      const noteToSend = isRegeneration ? regenerationNote : ''; // استخدام regenerationNote الموحدة مؤقتًا
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword, //  يجب أن تكون موجودة هنا إذا وصلنا إلى هذا الحد
        content,
        5,
        noteToSend,
        user.id,
        currentWorkspace.id
      );
      setSecondaryKeywordSuggestions(suggestions || []);
      if (suggestions && suggestions.length > 0) {
        if (isRegeneration) setRegenerationNote('');
        toast({ title: isRegeneration ? "Secondary Keywords Re-generated" : "Secondary Keywords Generated", description: "Please select up to 5 secondary keywords." });
      } else if (!isRegeneration) {
        toast({ title: "Generation Failed", description: "Unable to generate secondary keyword suggestions. Please try again.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Error generating secondary keywords:", error);
      toast({ title: "Generation Error", description: "An error occurred while generating keywords.", variant: "destructive" });
    } finally {
      setIsGeneratingSecondary(false);
    }
  };
  // --- نهاية تعديل دوال التوليد ---


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
        <div className={`p-6 border rounded-lg ${contentConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
          {/* ... (كود قسم إدخال المحتوى يبقى كما هو) ... */}
        </div>

        {/* Keywords Section - تعديل طفيف في شرط العرض إذا أردت إظهاره دائمًا بعد تأكيد المحتوى */}
        {contentConfirmed && ( //  إظهار قسم الكلمات المفتاحية فقط بعد تأكيد المحتوى
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-medium mb-4">2. Add Keywords</h2>
            <div className="space-y-6">
              {/* Primary Keyword Section */}
              <div className="space-y-2">
                <Label htmlFor="quickFormPrimaryInput" className="block font-medium">Primary Keyword:</Label> {/*  تغيير بسيط في id */}
                <div className="flex gap-2">
                  <Input
                    id="quickFormPrimaryInput" //  تغيير بسيط في id
                    type="text"
                    className="flex-1 p-3 border border-gray-300 rounded-md"
                    placeholder="Enter your main keyword..."
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                  />
                  <Button //  تغيير Button إلى Button
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                    onClick={handleSuggestAndTogglePrimary} //  <---  تغيير هنا
                    disabled={!contentConfirmed || isGeneratingPrimary}
                  >
                    <Search size={16} className="text-gray-600" />
                    Suggest
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
                              name="primaryKeywordOption" //  تغيير name لتفادي التضارب
                              className="mr-2"
                              checked={primaryKeyword === keyword.text}
                              onChange={() => handlePrimaryKeywordSelect(keyword.text)}
                            />
                            {keyword.text}
                          </label>
                        ))
                      ) : (
                        <p>No suggestions available. Click "Suggest" to generate.</p> //  تعديل النص
                      )}
                    </div>

                    {(primaryKeywordSuggestions.length > 0 || isGeneratingPrimary) && ( //  إظهار قسم إعادة التوليد إذا كانت هناك اقتراحات أو جاري التوليد
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex-1 mr-2"> {/*  توسيع حقل الملاحظات */}
                          <Input //  تغيير input إلى Input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Regeneration note..."
                            value={regenerationNote} //  استخدام regenerationNote الموحدة
                            onChange={(e) => setRegenerationNote(e.target.value)}
                          />
                        </div>
                        <Button //  تغيير button إلى Button
                          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                          onClick={handleRegeneratePrimary} //  <--- تغيير هنا
                          disabled={isGeneratingPrimary || !regenerationNote.trim()} //  تعطيل إذا لم تكن هناك ملاحظة
                        >
                          {isGeneratingPrimary ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                          Regenerate
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Secondary Keywords Section */}
              <div className="space-y-2">
                <Label className="block font-medium">Secondary Keywords (Optional):</Label> {/* استخدام Label */}
                <div className="flex gap-2">
                  <div className="flex-1 p-3 border border-gray-300 rounded-md min-h-[80px] bg-white">
                    {/* ... (عرض الكلمات الثانوية المختارة - الكود الحالي جيد) ... */}
                  </div>
                  <Button //  تغيير button إلى Button
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md h-fit flex items-center gap-1 transition-colors"
                    onClick={handleSuggestAndToggleSecondary} //  <---  تغيير هنا
                    disabled={!contentConfirmed || !primaryKeyword || isGeneratingSecondary} //  التأكد من وجود كلمة أساسية
                  >
                    <Search size={16} className="text-gray-600" />
                    Suggest
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
                        <p>No suggestions available. Click "Suggest" to generate.</p> //  تعديل النص
                      )}
                    </div>

                    {(secondaryKeywordSuggestions.length > 0 || isGeneratingSecondary) && ( //  إظهار قسم إعادة التوليد
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex-1 mr-2">
                          <div className="flex items-center gap-1">
                            <Input //  تغيير input إلى Input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              placeholder="Regeneration note..."
                              value={regenerationNote} //  استخدام regenerationNote الموحدة
                              onChange={(e) => setRegenerationNote(e.target.value)}
                            />
                            <Pencil size={16} className="text-gray-400" />
                          </div>
                        </div>
                        <Button //  تغيير button إلى Button
                          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                          onClick={handleRegenerateSecondary} //  <--- تغيير هنا
                          disabled={isGeneratingSecondary || !regenerationNote.trim()} //  تعطيل إذا لم تكن هناك ملاحظة
                        >
                          {isGeneratingSecondary ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                          Regenerate
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button variant="seoButton" className="w-full text-center py-3" onClick={handleStartOptimization} disabled={isOptimizing || !contentConfirmed || !primaryKeyword.trim()}>
          {/* ... (زر البدء - الكود الحالي جيد) ... */}
        </Button>
      </div>
    </div>
  );
};

//  لا حاجة لتعريف CheckIcon إذا تم استيرادها من lucide-react
// const CheckIcon = ({ className = "" }) => ( /* ... */ );

export default QuickOptimizationForm;