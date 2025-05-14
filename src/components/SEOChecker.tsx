import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Link, Upload, RefreshCw, Search, Pencil, AlertTriangle, Check, Loader, BarChart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
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

// Define interface for competitor analysis
interface CompetitorAnalysis {
  wordCount: {
    min: number;
    max: number;
    avg: number;
  };
  headingsCount: {
    min: number;
    max: number;
    avg: number;
  };
  paragraphsCount: {
    min: number;
    max: number;
    avg: number;
  };
  imagesCount: {
    min: number;
    max: number;
    avg: number;
  };
  competitors: Array<{
    url: string;
    title: string;
    stats: {
      wordCount: number;
      headingsCount: number;
      paragraphsCount: number;
      imagesCount: number;
    };
  }>;
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

// ContentStatBox Component with competitor-based recommendations
const ContentStatBox = ({ 
  label, 
  value, 
  range,
  avgValue,
  isWithinRange
}: { 
  label: string; 
  value: number; 
  range: string;
  avgValue?: number;
  isWithinRange?: boolean;
}) => (
  <div className="p-3 bg-white border border-gray-200 rounded-lg text-center transition-all hover:shadow-md">
    <div className="text-lg font-semibold">{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-xs text-gray-400">{range}</div>
    {avgValue !== undefined && (
      <div className="mt-1 flex items-center justify-center gap-1">
        <span className={`text-xs ${isWithinRange ? 'text-green-500' : 'text-amber-500'}`}>
          {isWithinRange ? 'Optimal' : 'Improve'}
        </span>
        {avgValue > 0 && (
          <span className="text-xs text-gray-500">
            (Avg: {avgValue})
          </span>
        )}
      </div>
    )}
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
  const [loadingCompetitorData, setLoadingCompetitorData] = useState(false);
  
  const { 
    content = "", 
    primaryKeyword = "",
    secondaryKeywords = [],
    targetCountry = "us"
  } = location.state || {};
  
  const [contentStats, setContentStats] = useState({ words: 0, headings: 0, paragraphs: 0, images: 0 });
  const [seoScore, setSeoScore] = useState(0);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationProps[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [showCompetitorView, setShowCompetitorView] = useState(false);
  
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
    
    // Fetch competitor analysis
    fetchCompetitorAnalysis();
    
    return () => {
      clearInterval(progressInterval);
    };
  }, [content, primaryKeyword, navigate, targetCountry]);
  
  // Function to fetch competitor analysis
  const fetchCompetitorAnalysis = async () => {
    if (!primaryKeyword || !targetCountry) return;
    
    try {
      setLoadingCompetitorData(true);
      
      console.log(`Fetching competitor analysis for keyword "${primaryKeyword}" in country "${targetCountry}"`);
      
      const { data, error } = await supabase.functions.invoke('analyze-competitors', {
        body: {
          keyword: primaryKeyword,
          country: targetCountry,
          userId: user?.id,
          workspaceId: currentWorkspace?.id
        }
      });
      
      if (error) {
        console.error('Error fetching competitor analysis:', error);
        throw error;
      }
      
      console.log('Competitor analysis:', data);
      
      if (data && data.success && data.analysis) {
        setCompetitorAnalysis(data.analysis);
        setShowCompetitorView(true);
      }
    } catch (error) {
      console.error('Failed to fetch competitor analysis:', error);
      toast({
        title: 'Competitor Analysis Failed',
        description: 'Could not fetch competitor data. Using standard recommendations instead.',
        variant: 'destructive'
      });
    } finally {
      setLoadingCompetitorData(false);
    }
  };
  
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
    if (competitorAnalysis && showCompetitorView) {
      return `${competitorAnalysis.wordCount.min} - ${competitorAnalysis.wordCount.max}`;
    }
    
    // Fallback to the original calculation
    const idealMin = Math.max(300, Math.round(contentStats.words * 1.2));
    const idealMax = Math.round(idealMin * 1.25);
    return `${idealMin} - ${idealMax}`;
  };
  
  // Generate heading count range guidance
  const getHeadingCountRange = () => {
    if (competitorAnalysis && showCompetitorView) {
      return `${competitorAnalysis.headingsCount.min} - ${competitorAnalysis.headingsCount.max}`;
    }
    
    // Fallback to the original calculation
    const min = Math.max(1, Math.floor(contentStats.words / 300));
    const max = Math.max(2, Math.ceil(contentStats.words / 150));
    return `${min} - ${max}`;
  };
  
  // Generate paragraph count range guidance
  const getParagraphCountRange = () => {
    if (competitorAnalysis && showCompetitorView) {
      return `${competitorAnalysis.paragraphsCount.min} - ${competitorAnalysis.paragraphsCount.max}`;
    }
    
    // Fallback to the original calculation
    const min = Math.max(2, Math.floor(contentStats.words / 150));
    const max = Math.max(4, Math.ceil(contentStats.words / 75));
    return `${min} - ${max}`;
  };
  
  // Generate image count range guidance
  const getImageCountRange = () => {
    if (competitorAnalysis && showCompetitorView) {
      return `${competitorAnalysis.imagesCount.min} - ${competitorAnalysis.imagesCount.max}`;
    }
    
    // Fallback to the original calculation
    const min = Math.max(1, Math.floor(contentStats.words / 400));
    const max = Math.max(3, Math.ceil(contentStats.words / 200));
    return `${min} - ${max}`;
  };
  
  // Check if content stats are within competitor ranges
  const isWordCountWithinRange = () => {
    if (!competitorAnalysis) return true;
    return contentStats.words >= competitorAnalysis.wordCount.min && 
           contentStats.words <= competitorAnalysis.wordCount.max;
  };
  
  const isHeadingsCountWithinRange = () => {
    if (!competitorAnalysis) return true;
    return contentStats.headings >= competitorAnalysis.headingsCount.min && 
           contentStats.headings <= competitorAnalysis.headingsCount.max;
  };
  
  const isParagraphsCountWithinRange = () => {
    if (!competitorAnalysis) return true;
    return contentStats.paragraphs >= competitorAnalysis.paragraphsCount.min && 
           contentStats.paragraphs <= competitorAnalysis.paragraphsCount.max;
  };
  
  const isImagesCountWithinRange = () => {
    if (!competitorAnalysis) return true;
    return contentStats.images >= competitorAnalysis.imagesCount.min && 
           contentStats.images <= competitorAnalysis.imagesCount.max;
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
  
  // Toggle between competitor view and standard view
  const toggleCompetitorView = () => {
    setShowCompetitorView(!showCompetitorView);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className={`text-xl font-bold ${isRtlContent ? 'font-arabic' : 'font-english'}`}>
          BlogArticle / {primaryKeyword}
        </div>
        <div className="flex gap-2">
          {competitorAnalysis && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleCompetitorView}
              className="flex items-center gap-1"
            >
              <BarChart className="h-4 w-4" />
              {showCompetitorView ? 'Standard View' : 'Competitor View'}
            </Button>
          )}
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/seo-checker')}
          >
            Reset
          </Button>
        </div>
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
              {loadingCompetitorData ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex flex-col items-center">
                    <Loader className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Loading competitor data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {showCompetitorView && competitorAnalysis && (
                    <div className="mb-3 bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-700">
                        Showing recommendations based on top {competitorAnalysis.competitors.length} competitors for "{primaryKeyword}" in selected country.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <ContentStatBox 
                      label="Words" 
                      value={contentStats.words} 
                      range={getWordCountRange()} 
                      avgValue={competitorAnalysis && showCompetitorView ? competitorAnalysis.wordCount.avg : undefined}
                      isWithinRange={isWordCountWithinRange()}
                    />
                    <ContentStatBox 
                      label="Headings" 
                      value={contentStats.headings} 
                      range={getHeadingCountRange()} 
                      avgValue={competitorAnalysis && showCompetitorView ? competitorAnalysis.headingsCount.avg : undefined}
                      isWithinRange={isHeadingsCountWithinRange()}
                    />
                    <ContentStatBox 
                      label="Paragraphs" 
                      value={contentStats.paragraphs} 
                      range={getParagraphCountRange()} 
                      avgValue={competitorAnalysis && showCompetitorView ? competitorAnalysis.paragraphsCount.avg : undefined}
                      isWithinRange={isParagraphsCountWithinRange()}
                    />
                    <ContentStatBox 
                      label="Images" 
                      value={contentStats.images} 
                      range={getImageCountRange()} 
                      avgValue={competitorAnalysis && showCompetitorView ? competitorAnalysis.imagesCount.avg : undefined}
                      isWithinRange={isImagesCountWithinRange()}
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* Competitor Analysis */}
            {showCompetitorView && competitorAnalysis && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-medium mb-4">Top Competitors</h2>
                
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3 pr-3">
                    {competitorAnalysis.competitors.map((competitor, index) => (
                      <div key={index} className="border border-gray-100 p-3 rounded-md hover:bg-gray-50">
                        <h3 className="font-medium text-sm line-clamp-1">{competitor.title}</h3>
                        <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline line-clamp-1">
                          {competitor.url}
                        </a>
                        <div className="grid grid-cols-4 gap-1 mt-2">
                          <div className="text-xs text-gray-500">
                            <span className="block font-medium">Words</span>
                            {competitor.stats.wordCount}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="block font-medium">Headings</span>
                            {competitor.stats.headingsCount}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="block font-medium">Paragraphs</span>
                            {competitor.stats.paragraphsCount}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="block font-medium">Images</span>
                            {competitor.stats.imagesCount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
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
              
              <ScrollArea className="h-[300px]">
                <div className="space-y-1 pr-3">
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
              </ScrollArea>
              
              <Button variant="seoButton" className="w-full mt-6">
                Improve SEO (Beta)
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="content-display-container">
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
