
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions } from '@/services/openaiService';
import { extractContentFromUrl } from '@/services/contentExtractorService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Loader } from 'lucide-react';

interface SEOCheckerProps {
  initialContent: string;
  initialPrimaryKeyword: string;
  initialSecondaryKeywords: string[];
}

const SEOChecker: React.FC<SEOCheckerProps> = ({
  initialContent,
  initialPrimaryKeyword,
  initialSecondaryKeywords,
}) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const [content, setContent] = useState(initialContent);
  const [primaryKeyword, setPrimaryKeyword] = useState(initialPrimaryKeyword);
  const [secondaryKeywords, setSecondaryKeywords] = useState(initialSecondaryKeywords);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isRtlContent, setIsRtlContent] = useState(false);
  
  // Detect RTL content
  useEffect(() => {
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    setIsRtlContent(rtlRegex.test(content));
  }, [content]);
  
  // Debug received props
  useEffect(() => {
    console.log('SEOChecker Component Received:', {
      contentLength: initialContent?.length || 0,
      primaryKeyword: initialPrimaryKeyword,
      secondaryKeywords: initialSecondaryKeywords,
    });
  }, [initialContent, initialPrimaryKeyword, initialSecondaryKeywords]);
  
  useEffect(() => {
    // If we have content and no primary keyword, try to generate one automatically
    if (content && !primaryKeyword && user?.id && currentWorkspace?.id) {
      handleGeneratePrimaryKeywords();
    }
  }, [content, primaryKeyword, user, currentWorkspace]);
  
  const handleGeneratePrimaryKeywords = async () => {
    if (!content) {
      toast({
        title: "Content Required",
        description: "Please add content before generating keywords.",
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
    
    try {
      console.log("Generating primary keywords automatically...");
      setIsAnalyzing(true);
      
      // Generate primary keywords
      const suggestions = await generateKeywordSuggestions(
        content,
        3,
        "",
        user.id,
        currentWorkspace.id
      );
      
      if (suggestions && suggestions.length > 0) {
        console.log("Primary keywords generated:", suggestions);
        setPrimaryKeyword(suggestions[0].text);
        
        // Now that we have a primary keyword, generate secondary keywords
        handleGenerateSecondaryKeywords(suggestions[0].text);
      } else {
        toast({
          title: "Generation Failed",
          description: "Unable to generate keyword suggestions.",
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
      setIsAnalyzing(false);
    }
  };
  
  const handleGenerateSecondaryKeywords = async (pkeyword = primaryKeyword) => {
    if (!content || !pkeyword) {
      toast({
        title: "Information Required",
        description: "Please add content and primary keyword before generating secondary keywords.",
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
    
    try {
      console.log(`Generating secondary keywords for primary keyword: ${pkeyword}`);
      setIsAnalyzing(true);
      
      // Generate secondary keywords
      const suggestions = await generateSecondaryKeywordSuggestions(
        pkeyword,
        content,
        5,
        "",
        user.id,
        currentWorkspace.id
      );
      
      if (suggestions && suggestions.length > 0) {
        console.log("Secondary keywords generated:", suggestions);
        // Set up to 5 secondary keywords
        const newSecondaryKeywords = suggestions.slice(0, 5).map(k => k.text);
        setSecondaryKeywords(newSecondaryKeywords);
        
        toast({
          title: "Keywords Generated",
          description: "Keywords have been successfully generated.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Unable to generate secondary keyword suggestions.",
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
      setIsAnalyzing(false);
    }
  };
  
  // Start the SEO analysis
  const startAnalysis = async () => {
    if (!content || !primaryKeyword) {
      toast({
        title: "Information Required",
        description: "Please add content and primary keyword before starting analysis.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis with a timeout
      setTimeout(() => {
        const mockResults = {
          score: 78,
          recommendations: [
            "Consider adding more instances of your primary keyword",
            "Add internal links to related content",
            "Improve your meta description",
            "Add alt text to images"
          ],
          keywordDensity: {
            primary: 1.2,
            secondary: 0.8
          }
        };
        
        setAnalysisResults(mockResults);
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Complete",
          description: "SEO analysis has been completed successfully."
        });
      }, 2000);
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        title: "Analysis Error",
        description: "An error occurred during the SEO analysis.",
        variant: "destructive"
      });
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">SEO Checker & Optimization</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Content and Keywords Section */}
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Content</h2>
            
            <div className={`prose max-w-none ${isRtlContent ? 'rtl' : 'ltr'}`}>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-medium">Primary Keyword:</p>
                <div className="bg-gray-100 p-2 rounded mt-1">
                  {primaryKeyword || "No primary keyword set"}
                </div>
              </div>
              
              <div>
                <p className="font-medium">Secondary Keywords:</p>
                {secondaryKeywords && secondaryKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {secondaryKeywords.map((keyword, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                        {keyword}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 mt-1">No secondary keywords set</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Analysis Section */}
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">SEO Analysis</h2>
            
            {!analysisResults && !isAnalyzing ? (
              <div className="text-center py-6">
                <p className="mb-4 text-gray-500">Click the button below to analyze your content and get SEO recommendations.</p>
                <button 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  onClick={startAnalysis}
                >
                  Start Analysis
                </button>
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader size={40} className="animate-spin text-purple-600 mb-4" />
                <p>Analyzing your content...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="#f0f0f0" 
                        strokeWidth="10"
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="#4CAF50" 
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45 * analysisResults.score / 100} ${2 * Math.PI * 45 * (100 - analysisResults.score) / 100}`}
                        strokeDashoffset={2 * Math.PI * 45 * 25 / 100}
                        transform="rotate(-90 50 50)"
                      />
                      <text x="50" y="50" textAnchor="middle" dy="7" fontSize="20" fontWeight="bold">{analysisResults.score}</text>
                    </svg>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Keyword Density</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Primary Keyword</span>
                      <span className={analysisResults.keywordDensity.primary > 1 && analysisResults.keywordDensity.primary < 3 ? "text-green-500" : "text-amber-500"}>
                        {analysisResults.keywordDensity.primary}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Secondary Keywords</span>
                      <span className={analysisResults.keywordDensity.secondary > 0.5 && analysisResults.keywordDensity.secondary < 2 ? "text-green-500" : "text-amber-500"}>
                        {analysisResults.keywordDensity.secondary}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="space-y-2">
                    {analysisResults.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOChecker;
