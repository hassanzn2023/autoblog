import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; //   <--- إضافة هذا السطر
import { Input } from '@/components/ui/input'; //   <--- إضافة هذا السطر
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

  // New state variables for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileParsingError, setFileParsingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- حذف useEffects المسؤولة عن التوليد التلقائي ---
  // تم حذف كلا الـ useEffects هنا
  // --- نهاية حذف useEffects ---

  // Handle URL extraction
  const handleUrlExtraction = async () => {
    if (!url.trim()) {
      toast({ title: "URL Required", description: "Please enter a valid URL before confirming.", variant: "destructive" });
      return false;
    }
    let processedUrl = url;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
      setUrl(processedUrl);
    }
    try { /* ... */ return true; } catch (error) { /* ... */ return false; } finally { setIsLoadingUrl(false); }
  };

  // --- تعديل handleContentConfirm لإزالة الاستدعاء التلقائي ---
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
    // --- تم حذف استدعاء handleGeneratePrimaryKeywords(); من هنا ---
  };
  // --- نهاية تعديل handleContentConfirm ---

  const handlePrimaryKeywordSelect = (keyword: string) => {
    setPrimaryKeyword(keyword);
    setShowPrimaryKeywordSuggestions(false);
  };

  const handleSecondaryKeywordToggle = (keyword: string) => {
    if (secondaryKeywords.includes(keyword)) {
      setSecondaryKeywords(secondaryKeywords.filter(k => k !== keyword));
    } else {
      if (secondaryKeywords.length < 5) {
        setSecondaryKeywords([...secondaryKeywords, keyword]);
      } else {
        toast({ title: "Maximum Keywords Reached", description: "You can select up to 5 secondary keywords.", variant: "default" });
      }
    }
  };

  // --- تعديل بسيط في دوال التوليد لاستخدام regenerationNote وتلقي isRegeneration ---
  // لا يزال يستخدم regenerationNote واحدة كما في الكود الأصلي
  const handleGeneratePrimaryKeywords = async (isRegeneration: boolean = false) => {
    if (!contentConfirmed || !content) { // تأكد من تأكيد المحتوى
      toast({ title: "Content Required", description: "Please confirm your content first.", variant: "destructive" });
      return;
    }
     if (!user?.id || !currentWorkspace?.id) { /* ... */ return; }
    setIsGeneratingPrimary(true);
    // setShowPrimaryKeywordSuggestions(true); // ستبقى تتحكم في عرض القائمة كما في الكود الأصلي، لكن لن يتم تبديلها هنا تلقائياً

    try {
      const noteToSend = isRegeneration ? regenerationNote : ''; // استخدام الملاحظة عند إعادة التوليد
      const suggestions = await generateKeywordSuggestions(
        content,
        3,
        noteToSend, // تم تمرير الملاحظة هنا
        user.id,
        currentWorkspace.id
      );
      setPrimaryKeywordSuggestions(suggestions || []);
      // لا تحدد أول اقتراح تلقائياً إلا إذا كان هذا السلوك ضرورياً
      // if (suggestions && suggestions.length > 0 && !primaryKeyword && !isRegeneration) { setPrimaryKeyword(suggestions[0].text); }

      if (suggestions && suggestions.length > 0) {
        // مسح الملاحظة بعد الاستخدام في حالة إعادة التوليد فقط
        if (isRegeneration) setRegenerationNote('');
        toast({ title: isRegeneration ? "Primary Keywords Re-generated" : "Primary Keywords Generated", description: "Please review suggestions." });
      } else if (!isRegeneration) {
         toast({ title: "Generation Failed", description: "Unable to generate suggestions.", variant: "destructive" });
      }

    } catch (error: any) {
      console.error("Error generating primary keywords:", error);
      toast({ title: "Generation Error", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };

  const handleGenerateSecondaryKeywords = async (isRegeneration: boolean = false) => {
    if (!contentConfirmed || !content) { // تأكد من تأكيد المحتوى
      toast({ title: "Content Required", description: "Please confirm your content first.", variant: "destructive" });
      return;
    }
    if (!primaryKeyword && !isRegeneration) { // يمكن الإبقاء على هذا الشرط إذا كنت تريد كلمة أساسية للاقتراح الثانوي الأولي
       toast({ title: "Primary Keyword Required", description: "Please select a primary keyword first.", variant: "destructive" });
       return;
    }
    if (!user?.id || !currentWorkspace?.id) { /* ... */ return; }
    setIsGeneratingSecondary(true);
    // setShowSecondaryKeywordSuggestions(true); // ستبقى تتحكم في عرض القائمة

    try {
      const noteToSend = isRegeneration ? regenerationNote : ''; // استخدام الملاحظة عند إعادة التوليد
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword, // تمرير الكلمة الأساسية
        content,
        5,
        noteToSend, // تم تمرير الملاحظة هنا
        user.id,
        currentWorkspace.id
      );
      setSecondaryKeywordSuggestions(suggestions || []);

      if (suggestions && suggestions.length > 0) {
        if (isRegeneration) setRegenerationNote('');
        toast({ title: isRegeneration ? "Secondary Keywords Re-generated" : "Secondary Keywords Generated", description: "Please select up to 5 secondary keywords." });
      } else if (!isRegeneration) {
        toast({ title: "Generation Failed", description: "Unable to generate secondary suggestions.", variant: "destructive" });
      }

    } catch (error: any) {
      console.error("Error generating secondary keywords:", error);
      toast({ title: "Generation Error", description: error.message || "An error occurred.", variant: "destructive" });
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

  // --- JSX (تم الحفاظ على الشكل الأصلي قدر الإمكان) ---
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick SEO Optimization</h1>
      <div className="space-y-8">
        {/* Content Section */}
        <div className={`p-6 border rounded-lg ${contentConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <h2 className="text-lg font-medium mb-4">1. Add your content</h2>
          <div className="space-y-4">
            {/* ... (كود اختيار طريقة إدخال المحتوى - لم يتم تعديله) ... */}
            {contentMethod === 'text' && (
              <>
                <div className="quill-container"> {/* ... */} </div>
                {!contentConfirmed && ( <div className="text-center mt-4"><Button variant="seoButton" onClick={handleContentConfirm} className="z-10 relative">Confirm Content</Button></div> )}
              </>
            )}
            {contentMethod === 'link' && ( /* ... */ )}
            {contentMethod === 'file' && ( /* ... */ )}

            {contentConfirmed && (
              <div className="flex items-center text-green-600 mt-4">
                <CheckIcon className="mr-2" /> {/*  استخدام CheckIcon كما كان */}
                <span>Content added/confirmed.</span>
              </div>
            )}
          </div>
        </div>

        {/* Keywords Section */}
        <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-medium mb-4">2. Add Keywords</h2>
          <div className="space-y-6">
            {/* Primary Keyword Section */}
            <div className="space-y-2">
              <label className="block font-medium">Primary Keyword:</Label> {/* استخدام label */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-md"
                  placeholder="Enter your main keyword..."
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                />
                <button // استخدام button
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                  // --- تغيير onClick هنا لتبديل العرض وتشغيل التوليد إذا لزم الأمر ---
                  onClick={handleSuggestAndTogglePrimary}
                  // --- نهاية التغيير ---
                  disabled={!contentConfirmed || isGeneratingPrimary}
                >
                  <Search size={16} className="text-gray-600" />
                  Suggest
                </button>
              </div>

              {showPrimaryKeywordSuggestions && ( //  يظهر بناءً على حالة showPrimaryKeywordSuggestions
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
                            name="primaryKeyword" // تم الإبقاء على name الأصلي
                            className="mr-2"
                            checked={primaryKeyword === keyword.text}
                            onChange={() => handlePrimaryKeywordSelect(keyword.text)}
                          />
                          {keyword.text}
                        </label>
                      ))
                    ) : (
                      <p>No suggestions available</p> // النص الأصلي
                    )}
                  </div>

                  {/* قسم إعادة التوليد كما كان في الكود الأصلي */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <input // استخدام input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Regeneration note..."
                        value={regenerationNote} // استخدام regenerationNote الموحدة
                        onChange={(e) => setRegenerationNote(e.target.value)}
                      />
                    </div>
                    <button // استخدام button
                      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                       // --- تغيير onClick هنا لاستدعاء إعادة التوليد ---
                      onClick={handleRegeneratePrimary}
                      // --- نهاية التغيير ---
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

            {/* Secondary Keywords Section */}
            <div className="space-y-2">
              <label className="block font-medium">Secondary Keywords (Optional):</label> {/* استخدام label */}
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
                <button // استخدام button
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md h-fit flex items-center gap-1 transition-colors"
                  // --- تغيير onClick هنا لتبديل العرض وتشغيل التوليد إذا لزم الأمر ---
                  onClick={handleSuggestAndToggleSecondary}
                  // --- نهاية التغيير ---
                  disabled={!primaryKeyword || isGeneratingSecondary} // الشرط الأصلي
                >
                  <Search size={16} className="text-gray-600" />
                  Suggest
                </button>
              </div>

              {showSecondaryKeywordSuggestions && ( // يظهر بناءً على حالة showSecondaryKeywordSuggestions
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
                      <p>No suggestions available</p> // النص الأصلي
                    )}
                  </div>

                  {/* قسم إعادة التوليد كما كان في الكود الأصلي */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500 flex-1 mr-2">
                      <div className="flex items-center gap-1">
                        <input // استخدام input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Regeneration note..."
                          value={regenerationNote} // استخدام regenerationNote الموحدة
                          onChange={(e) => setRegenerationNote(e.target.value)}
                        />
                        <Pencil size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <button // استخدام button
                      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
                       // --- تغيير onClick هنا لاستدعاء إعادة التوليد ---
                      onClick={handleRegenerateSecondary}
                      // --- نهاية التغيير ---
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
        )}

        <Button
          variant="seoButton"
          className="w-full text-center py-3"
          onClick={handleStartOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? ( /* ... */ ) : ( "Start Quick Optimization" )}
        </Button>
      </div>
    </div>
  );
};

// تم الإبقاء على CheckIcon كما كان
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