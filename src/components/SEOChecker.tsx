
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Link, Upload, RefreshCw, Search, Pencil, AlertTriangle, Check, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  generateKeywordSuggestions, 
  generateSecondaryKeywordSuggestions,
  analyzeSEOScore,
  extractContentFromUrl
} from '@/services/openaiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Progress } from '@/components/ui/progress';

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
    <div className="relative w-48 h-24 mx-auto">
      {/* Meter background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full rounded-t-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"></div>
      </div>
      
      {/* Meter foreground (white cover) */}
      <div className="absolute top-0 left-0 w-full h-full flex justify-center">
        <div className="w-40 h-40 bg-white rounded-full translate-y-10"></div>
      </div>
      
      {/* Needle with animation */}
      <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center origin-bottom">
        <div 
          className="w-1 h-16 bg-gray-800 rounded-full origin-bottom transform transition-transform duration-500"
          style={{ transform: `rotate(${rotation}deg)` }}
        ></div>
        <div className="absolute bottom-0 w-4 h-4 bg-gray-800 rounded-full -translate-x-2 -translate-y-2"></div>
      </div>
      
      {/* Score text with animation */}
      <div className="absolute bottom-0 left-0 w-full text-center">
        <div className={`text-2xl font-bold ${getScoreColor()} transition-colors`}>
          {animatedScore}/100
        </div>
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

// Recommendation Component
interface RecommendationProps {
  status: 'success' | 'warning' | 'error';
  text: string;
  action?: string;
}

const Recommendation = ({ status, text, action }: RecommendationProps) => {
  const statusIcons = {
    success: <Check size={18} className="text-green-500" />,
    warning: <AlertTriangle size={18} className="text-yellow-500" />,
    error: <AlertTriangle size={18} className="text-red-500" />
  };
  
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-200 last:border-b-0">
      <div className="mt-0.5">
        {statusIcons[status]}
      </div>
      <div className="flex-1">
        {text}
      </div>
      {action && (
        <Button variant="outline" size="sm">
          {action}
        </Button>
      )}
    </div>
  );
};

// Calculate content stats
const calculateContentStats = (content: string) => {
  if (!content) return { words: 0, headings: 0, paragraphs: 0, images: 0 };
  
  // Count words (split by spaces and filter out empty strings)
  const textContent = content.replace(/<[^>]+>/g, ' ');
  const words = textContent.split(/\s+/).filter(word => word.length > 0).length;
  
  // Count headings (look for h1-h6 tags)
  const headingRegex = /<h[1-6][^>]*>.*?<\/h[1-6]>|<strong>.*?<\/strong>/gi;
  const headings = (content.match(headingRegex) || []).length;
  
  // Count paragraphs (look for p tags)
  const paragraphRegex = /<p>.*?<\/p>/gs;
  const paragraphs = (content.match(paragraphRegex) || []).length || 1;
  
  // Count image references
  const imageRegex = /<img.*?>/gi;
  const images = (content.match(imageRegex) || []).length;
  
  return { words, headings, paragraphs, images };
};

// Generate SEO recommendations based on content
const generateRecommendations = (content: string, primaryKeyword: string) => {
  const stats = calculateContentStats(content);
  const recommendations: RecommendationProps[] = [];
  
  // Add successful keyword integration recommendation
  recommendations.push({
    status: 'success',
    text: `Basic optimization for "${primaryKeyword}" complete.`
  });
  
  // Add warning for Pro mode
  recommendations.push({
    status: 'warning',
    text: "For full control, try Pro Mode."
  });
  
  // Add content length recommendation if needed
  if (stats.words < 300) {
    recommendations.push({
      status: 'error',
      text: "Add more supporting content to improve ranking.",
      action: "Fix"
    });
  }
  
  // Add image recommendation if needed
  if (stats.images < 1) {
    recommendations.push({
      status: 'error',
      text: "Add at least one image to improve engagement.",
      action: "See"
    });
  }
  
  // Add header structure recommendation if needed
  if (stats.headings < 2 && stats.words > 300) {
    recommendations.push({
      status: 'error',
      text: "Add more headings to structure your content.",
      action: "Fix"
    });
  }
  
  return recommendations;
};

// Calculate SEO score based on content metrics
const calculateSEOScore = (content: string, primaryKeyword: string) => {
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

// SEO Checker Result Component
const SEOCheckerResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(true);
  
  const { 
    content = "", 
    primaryKeyword = "",
    secondaryKeywords = []
  } = location.state || {};
  
  const [contentStats, setContentStats] = useState({ words: 0, headings: 0, paragraphs: 0, images: 0 });
  const [seoScore, setSeoScore] = useState(0);
  const [recommendations, setRecommendations] = useState<RecommendationProps[]>([]);
  
  // ReactQuill read-only modules
  const readOnlyModules = { toolbar: false };
  
  useEffect(() => {
    if (!content || !primaryKeyword) {
      navigate('/seo-checker');
      return;
    }
    
    // Calculate content stats and SEO score
    const stats = calculateContentStats(content);
    const score = calculateSEOScore(content, primaryKeyword);
    const recs = generateRecommendations(content, primaryKeyword);
    
    // Simulate analysis delay for UX
    const timer = setTimeout(() => {
      setContentStats(stats);
      setSeoScore(score);
      setRecommendations(recs);
      setAnalyzing(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [content, primaryKeyword, navigate]);
  
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold">BlogArticle / {primaryKeyword}</div>
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
            <Progress value={Math.random() * 100} className="h-2" />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* SEO Score */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-medium mb-4">Content SEO Score</h2>
              <SEOScoreMeter score={seoScore} />
              <div className="text-center text-sm text-gray-500 mt-2">
                Suggested 65+
              </div>
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
            
            {/* Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-medium mb-4">Recommendations</h2>
              <div className="space-y-1">
                {recommendations.map((rec, index) => (
                  <Recommendation 
                    key={index}
                    status={rec.status}
                    text={rec.text}
                    action={rec.action}
                  />
                ))}
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
const SEOChecker = () => {
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
