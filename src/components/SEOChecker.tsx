
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Link, Upload, RefreshCw, Search, Pencil, AlertTriangle, Check, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  generateKeywordSuggestions, 
  generateSecondaryKeywordSuggestions
} from '@/services/openaiService';
import { extractContentFromUrl } from '@/services/contentExtractorService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

// Define props interface for SEOChecker
interface SEOCheckerProps {
  initialContent?: string;
  initialPrimaryKeyword?: string;
  initialSecondaryKeywords?: string[];
}

// Helper function to detect language
const isRTL = (text: string) => {
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
};

// SEO Score Meter Component with Improved Animation
const SEOScoreMeter = ({ score }: { score: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const rotation = (animatedScore / 100) * 180 - 90;
  
  useEffect(() => {
    // Animate the score from 0 to the actual score
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= score) {
            clearInterval(interval);
            return score;
          }
          return prev + 1;
        });
      }, 15);
      
      return () => clearInterval(interval);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [score]);
  
  // Get color based on score
  const getScoreColor = () => {
    if (animatedScore < 50) return 'text-red-500';
    if (animatedScore < 70) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  return (
    <div className="seo-meter-container">
      <div className="seo-meter-gauge">
        <div className="seo-meter-bg"></div>
        <div className="seo-meter-mask"></div>
        <div
          className="seo-meter-needle"
          style={{
            transform: `rotate(${rotation}deg)`
          }}
        ></div>
        <div className="seo-meter-dot"></div>
      </div>
      <div className="seo-meter-score">
        <div className={`seo-meter-score-value ${getScoreColor()}`}>
          {animatedScore}
          <span className="seo-meter-score-max">/100</span>
        </div>
        <div className="seo-meter-label">Suggested 65+</div>
      </div>
    </div>
  );
};

// ContentStatBox Component
const ContentStatBox = ({ 
  label, 
  value, 
  range 
}: { 
  label: string; 
  value: number; 
  range: string; 
}) => (
  <div className="p-3 bg-white border border-gray-200 rounded-lg text-center transition-all hover:shadow-md">
    <div className="text-lg font-semibold">{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-xs text-gray-400">{range}</div>
  </div>
);

// Recommendation Component with severity levels
interface RecommendationProps {
  severity: 'critical' | 'important' | 'suggestion'; // Renamed from status for clarity
  text: string;
  solution?: string;
  action?: string;
}

const Recommendation = ({ severity, text, solution, action }: RecommendationProps) => {
  const [showSolution, setShowSolution] = useState(false);
  
  const severityIcons = {
    critical: <AlertTriangle size={18} className="text-red-500" />,
    important: <AlertTriangle size={18} className="text-yellow-500" />,
    suggestion: <Check size={18} className="text-green-500" />
  };
  
  const severityColors = {
    critical: "border-l-4 border-red-500",
    important: "border-l-4 border-yellow-500",
    suggestion: "border-l-4 border-green-500"
  };
  
  return (
    <div className={`flex items-start gap-3 py-3 px-2 ${severityColors[severity]} mb-2 bg-white rounded-r-md transition-all hover:shadow-sm`}>
      <div className="mt-0.5">
        {severityIcons[severity]}
      </div>
      <div className="flex-1">
        <div className="font-medium">{text}</div>
        {solution && (
          <div className="mt-1">
            {showSolution ? (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">{solution}</div>
            ) : (
              <button 
                onClick={() => setShowSolution(true)} 
                className="text-xs text-blue-500 hover:underline"
              >
                View solution
              </button>
            )}
          </div>
        )}
      </div>
      {action && (
        <Button variant="outline" size="sm">
          {action}
        </Button>
      )}
    </div>
  );
};

// Improved content stats calculation with better HTML parsing
const calculateContentStats = (content: string) => {
  if (!content) return { words: 0, headings: 0, paragraphs: 0, images: 0 };
  
  // Count words (split by spaces and filter out empty strings)
  const textContent = content.replace(/<[^>]+>/g, ' ');
  const words = textContent.split(/\s+/).filter(word => word.length > 0).length;
  
  // Count headings (look for h1-h6 tags only, not strong tags)
  const headingRegex = /<h[1-6][^>]*>.*?<\/h[1-6]>/gi;
  const headings = (content.match(headingRegex) || []).length;
  
  // Count paragraphs (look for p tags)
  const paragraphRegex = /<p[^>]*>.*?<\/p>/gs;
  const paragraphs = (content.match(paragraphRegex) || []).length || 1;
  
  // Count image references
  const imageRegex = /<img.*?>/gi;
  const images = (content.match(imageRegex) || []).length;
  
  return { words, headings, paragraphs, images };
};

// Interface for SEO Analysis Result from Edge Function
interface SEOCategory {
  name: string;
  score: number;
  issues: Array<{
    severity: 'critical' | 'important' | 'suggestion';
    issue: string;
    solution: string;
  }>;
}

interface SEOAnalysisResult {
  overallScore: number;
  categories: SEOCategory[];
  summary: string;
  rawResponse?: boolean;
}

// SEO Checker Result Component
const SEOCheckerResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const [analyzing, setAnalyzing] = useState(true);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const { 
    content = "", 
    primaryKeyword = "",
    secondaryKeywords = []
  } = location.state || {};
  
  const [contentStats, setContentStats] = useState({ words: 0, headings: 0, paragraphs: 0, images: 0 });
  const [seoScore, setSeoScore] = useState(0);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationProps[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Check if the content is RTL or LTR
  const isRtlContent = isRTL(content);
  
  // ReactQuill read-only modules
  const readOnlyModules = { toolbar: false };
  
  useEffect(() => {
    if (!content || !primaryKeyword) {
      navigate('/seo-checker');
      return;
    }
    
    // Calculate content stats
    const stats = calculateContentStats(content);
    setContentStats(stats);
    
    // Start animation for analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 5;
      });
    }, 300);
    
    // Perform SEO analysis with GPT
    performSEOAnalysis();
    
    return () => {
      clearInterval(progressInterval);
    };
  }, [content, primaryKeyword, navigate]);
  
  // Function to perform SEO analysis using the Edge Function
  const performSEOAnalysis = async () => {
    try {
      if (!user || !currentWorkspace) {
        // Fall back to basic analysis if user not authenticated
        const score = calculateBasicSEOScore(content, primaryKeyword);
        const basicRecs = generateBasicRecommendations(content, primaryKeyword);
        
        setSeoScore(score);
        setRecommendations(basicRecs);
        setAnalyzing(false);
        setAnalysisProgress(100);
        return;
      }
      
      // Call the Edge Function for advanced SEO analysis
      const { data, error } = await supabase.functions.invoke('analyze-seo-content', {
        body: {
          content,
          primaryKeyword,
          secondaryKeywords,
          userId: user.id,
          workspaceId: currentWorkspace.id
        }
      });
      
      if (error) {
        console.error('Error calling analyze-seo-content function:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from SEO analysis');
      }
      
      // Update state with analysis results
      setSeoAnalysis(data);
      setSeoScore(data.overallScore);
      
      // Convert analysis results to recommendations format
      const analysisRecommendations: RecommendationProps[] = [];
      
      // Set active category to the first one
      if (data.categories && data.categories.length > 0) {
        setActiveCategory(data.categories[0].name);
        
        // Extract all issues from all categories
        data.categories.forEach(category => {
          category.issues.forEach(issue => {
            analysisRecommendations.push({
              severity: issue.severity as 'critical' | 'important' | 'suggestion',
              text: issue.issue,
              solution: issue.solution
            });
          });
        });
      }
      
      setRecommendations(analysisRecommendations);
    } catch (error) {
      console.error('SEO analysis failed:', error);
      setAnalysisFailed(true);
      
      // Fall back to basic analysis
      const score = calculateBasicSEOScore(content, primaryKeyword);
      const basicRecs = generateBasicRecommendations(content, primaryKeyword);
      
      setSeoScore(score);
      setRecommendations(basicRecs);
      
      toast({
        title: 'SEO Analysis Warning',
        description: 'Advanced analysis failed. Showing basic recommendations instead.',
        variant: 'destructive'
      });
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(100);
    }
  };
  
  // Basic SEO score calculation as fallback
  const calculateBasicSEOScore = (content: string, primaryKeyword: string) => {
    const stats = calculateContentStats(content);
    let score = 50; // Start with a base score
    
    // Add points for longer content
    if (stats.words > 300) score += 10;
    if (stats.words > 600) score += 5;
    if (stats.words > 1000) score += 5;
    
    // Add points for good structure
    if (stats.headings >= 1) score += 5;
    if (stats.headings >= 3) score += 5;
    if (stats.paragraphs >= 4) score += 5;
    
    // Add points for images
    if (stats.images >= 1) score += 5;
    if (stats.images >= 2) score += 5;
    
    // Check keyword presence and density
    const keywordRegex = new RegExp(primaryKeyword, 'gi');
    const keywordOccurrences = (content.match(keywordRegex) || []).length;
    const keywordDensity = keywordOccurrences / stats.words;
    
    if (keywordOccurrences >= 1) score += 5;
    if (keywordDensity >= 0.01 && keywordDensity <= 0.03) score += 10; // Optimal density
    else if (keywordDensity > 0.03) score -= 5; // Keyword stuffing penalty
    
    return Math.min(100, Math.max(0, Math.round(score))); // Ensure score is between 0-100
  };
  
  // Generate basic recommendations as fallback
  const generateBasicRecommendations = (content: string, primaryKeyword: string): RecommendationProps[] => {
    const stats = calculateContentStats(content);
    const recommendations: RecommendationProps[] = [];
    
    // Content length recommendations
    if (stats.words < 300) {
      recommendations.push({
        severity: 'critical',
        text: 'Content is too short',
        solution: 'Add more supporting content to improve ranking. Aim for at least 300 words.',
        action: "Fix"
      });
    } else if (stats.words < 600) {
      recommendations.push({
        severity: 'important',
        text: 'Content could be more comprehensive',
        solution: 'Consider expanding your content to around 600-1000 words for better ranking potential.',
        action: "Fix"
      });
    } else {
      recommendations.push({
        severity: 'suggestion',
        text: 'Content length is good',
        solution: 'Your content has a good length. Continue to focus on quality and relevance.'
      });
    }
    
    // Image recommendations
    if (stats.images < 1) {
      recommendations.push({
        severity: 'important',
        text: 'No images detected',
        solution: 'Add at least one image to improve engagement and visual appeal.',
        action: "See"
      });
    }
    
    // Header structure recommendations
    if (stats.headings < 2 && stats.words > 300) {
      recommendations.push({
        severity: 'important',
        text: 'Insufficient heading structure',
        solution: 'Add more headings to structure your content better. Break up long sections with H2 and H3 headings.',
        action: "Fix"
      });
    }
    
    // Keyword recommendations
    const keywordRegex = new RegExp(primaryKeyword, 'gi');
    const keywordOccurrences = (content.match(keywordRegex) || []).length;
    const keywordDensity = keywordOccurrences / stats.words;
    
    if (keywordOccurrences === 0) {
      recommendations.push({
        severity: 'critical',
        text: 'Primary keyword not found',
        solution: `Add your primary keyword "${primaryKeyword}" to the content, especially in the first paragraph and headings.`,
        action: "Fix"
      });
    } else if (keywordDensity > 0.03) {
      recommendations.push({
        severity: 'important',
        text: 'Keyword stuffing detected',
        solution: 'Reduce the number of times you use the primary keyword to avoid keyword stuffing penalties.',
        action: "Fix"
      });
    } else if (keywordDensity < 0.01) {
      recommendations.push({
        severity: 'important',
        text: 'Low keyword density',
        solution: 'Consider using your primary keyword a few more times, but keep it natural.',
        action: "Fix"
      });
    }
    
    return recommendations;
  };
  
  // Generate word count range guidance
  const getWordCountRange = () => {
    const idealMin = Math.max(300, Math.round(contentStats.words * 1.2));
    const idealMax = Math.round(idealMin * 1.25);
    return `${idealMin} - ${idealMax}`;
  };
  
  // Generate heading count range guidance
  const getHeadingCountRange = () => {
    const min = Math.max(1, Math.floor(contentStats.words / 300));
    const max = Math.max(2, Math.ceil(contentStats.words / 150));
    return `${min} - ${max}`;
  };
  
  // Generate paragraph count range guidance
  const getParagraphCountRange = () => {
    const min = Math.max(2, Math.floor(contentStats.words / 150));
    const max = Math.max(4, Math.ceil(contentStats.words / 75));
    return `${min} - ${max}`;
  };
  
  // Generate image count range guidance
  const getImageCountRange = () => {
    const min = Math.max(1, Math.floor(contentStats.words / 400));
    const max = Math.max(3, Math.ceil(contentStats.words / 200));
    return `${min} - ${max}`;
  };

  // Filter recommendations based on active category
  const getFilteredRecommendations = () => {
    if (!seoAnalysis || !activeCategory) return recommendations;
    
    const categoryData = seoAnalysis.categories.find(cat => cat.name === activeCategory);
    if (!categoryData) return recommendations;
    
    return categoryData.issues.map(issue => ({
      severity: issue.severity as 'critical' | 'important' | 'suggestion',
      text: issue.issue,
      solution: issue.solution
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className={`text-xl font-bold ${isRtlContent ? 'font-arabic' : 'font-english'}`}>
          BlogArticle / {primaryKeyword}
        </div>
        <button 
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
          onClick={() => navigate('/seo-checker')}
        >
          Reset
        </button>
      </div>
      
      {analyzing ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="h-12 w-12 animate-spin text-[#F76D01] mb-4" />
          <h2 className="text-xl font-medium">Analyzing your content...</h2>
          <p className="text-gray-500 mt-2">This will take just a moment</p>
          
          <div className="w-64 mt-8">
            <Progress value={analysisProgress} className="h-2" />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* SEO Score */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-medium mb-4">Content SEO Score</h2>
              <SEOScoreMeter score={seoScore} />
              <div className="flex justify-between mt-4 text-sm">
                <a href="#" className="text-purple-600 hover:underline transition-colors">Learn more</a>
                <a href="#" className="text-purple-600 hover:underline transition-colors">Score works</a>
              </div>
            </div>
            
            {/* Content Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid grid-cols-2 gap-3">
                <ContentStatBox 
                  label="Words" 
                  value={contentStats.words} 
                  range={getWordCountRange()} 
                />
                <ContentStatBox 
                  label="Headings" 
                  value={contentStats.headings} 
                  range={getHeadingCountRange()} 
                />
                <ContentStatBox 
                  label="Paragraphs" 
                  value={contentStats.paragraphs} 
                  range={getParagraphCountRange()} 
                />
                <ContentStatBox 
                  label="Images" 
                  value={contentStats.images} 
                  range={getImageCountRange()} 
                />
              </div>
            </div>
            
            {/* Categories and Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              {seoAnalysis && seoAnalysis.categories && seoAnalysis.categories.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {seoAnalysis.categories.map((category) => (
                    <button 
                      key={category.name}
                      onClick={() => setActiveCategory(category.name)}
                      className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                        activeCategory === category.name 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
              
              <h2 className="text-lg font-medium mb-4">
                {activeCategory || "Recommendations"}
              </h2>
              
              <div className="space-y-1">
                {!analysisFailed && activeCategory && seoAnalysis 
                  ? getFilteredRecommendations().map((rec, index) => (
                    <Recommendation 
                      key={index}
                      severity={rec.severity}
                      text={rec.text}
                      solution={rec.solution}
                      action={rec.action}
                    />
                  ))
                  : recommendations.map((rec, index) => (
                    <Recommendation 
                      key={index}
                      severity={rec.severity}
                      text={rec.text}
                      solution={rec.solution}
                      action={rec.action}
                    />
                  ))
                }
              </div>
              
              <Button variant="seoButton" className="w-full mt-6">
                Improve SEO (Beta)
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="h-full">
                <ReactQuill 
                  value={content} 
                  readOnly={true}
                  modules={readOnlyModules}
                  theme="snow"
                  className={`${isRtlContent ? 'font-arabic rtl-content' : 'font-english ltr-content'}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main SEO Checker component that shows either the form or results
const SEOChecker: React.FC<SEOCheckerProps> = ({ initialContent, initialPrimaryKeyword, initialSecondaryKeywords }) => {
  const location = useLocation();
  
  // Check if we're viewing results or the input form
  const isViewingResults = location.state && location.state.primaryKeyword;
  
  return (
    <div className="p-6">
      {isViewingResults ? <SEOCheckerResult /> : <QuickOptimizationForm />}
    </div>
  );
};

// Import QuickOptimizationForm component
import QuickOptimizationForm from './QuickOptimizationForm';

export default SEOChecker;
