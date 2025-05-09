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

// SEO Score Meter Component
const SEOScoreMeter = ({ score }: { score: number }) => {
  const rotation = (score / 100) * 180 - 90;
  
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
      
      {/* Needle */}
      <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center origin-bottom">
        <div 
          className="w-1 h-16 bg-gray-800 rounded-full origin-bottom transform transition-transform duration-1000"
          style={{ transform: `rotate(${rotation}deg)` }}
        ></div>
        <div className="absolute bottom-0 w-4 h-4 bg-gray-800 rounded-full -translate-x-2 -translate-y-2"></div>
      </div>
      
      {/* Score text */}
      <div className="absolute bottom-0 left-0 w-full text-center">
        <div className="text-2xl font-bold">{score}/100</div>
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
  <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
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

// SEO Checker Result Component
const SEOCheckerResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { primaryKeyword } = location.state || { primaryKeyword: "keywords" };
  
  // This would normally be generated from the optimization results
  const sampleContent = `
--- NORMAL MODE OPTIMIZED (SIMULATED) ---
Basic keyword integration for "best coffee beans 2024" and general readability improvements applied.

The Ultimate Guide to the Best Coffee Beans in 2024

Are you a coffee enthusiast searching for the perfect cup of joe? Look no further! In this comprehensive guide, we'll explore the best coffee beans 2024 has to offer, focusing especially on dark roast coffee varieties that deliver rich, bold flavors.

What Makes Great Coffee Beans?
When searching for the best coffee beans 2024 has introduced to the market, consider these essential factors: origin, processing method, roast level, and freshness. Single-origin beans from Ethiopia, Colombia, and Costa Rica consistently rank among the top choices for discerning coffee lovers.

Dark Roast Coffee: Rich and Bold
For fans of dark roast coffee, 2024 brings exciting new options. These beans are roasted longer, creating a deeper color and bringing natural oils to the surface. The result is a less acidic brew with notes of chocolate, caramel, and sometimes even smoky flavors that many coffee enthusiasts prefer for their morning cup.

Top Recommendations
After extensive testing, here are our top picks for the best coffee beans 2024 has to offer:
1. Ethiopian Yirgacheffe - Perfect for those who enjoy bright, fruity notes with a medium body
2. Sumatra Mandheling - Excellent dark roast coffee with earthy, herbal characteristics
3. Colombian Supremo - Balanced with caramel sweetness and mild acidity
4. Guatemalan Antigua - Notes of chocolate and spice with a smooth finish
  `;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold">BlogArticle / شف 🇦🇪</div>
        <button 
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
          onClick={() => navigate('/autofix/modes')}
        >
          Reset
        </button>
      </div>
      
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* SEO Score */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-4">Content SEO Score</h2>
            <SEOScoreMeter score={85} />
            <div className="text-center text-sm text-gray-500 mt-2">
              Suggested 65+
            </div>
            <div className="text-center mt-2">
              <a href="#" className="text-purple-600 text-sm">Learn more about how Content SEO Score works</a>
            </div>
          </div>
          
          {/* Content Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-3">
              <ContentStatBox label="Words" value={182} range="254 - 317" />
              <ContentStatBox label="Headings" value={1} range="0 - 1" />
              <ContentStatBox label="Paragraphs" value={4} range="0 - 6" />
              <ContentStatBox label="Images" value={0} range="0 - 3" />
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-4">Recommendations</h2>
            <div className="space-y-1">
              <Recommendation 
                status="success" 
                text={`Basic optimization for "${primaryKeyword}" complete.`} 
              />
              <Recommendation 
                status="warning" 
                text="For full control, try Pro Mode."
              />
              <Recommendation 
                status="error" 
                text="Add more supporting content to improve ranking." 
                action="Fix" 
              />
              <Recommendation 
                status="error" 
                text="Add at least one image to improve engagement." 
                action="See" 
              />
            </div>
            
            <button className="w-full bg-[#F76D01] hover:bg-[#E25C00] text-white py-2 rounded-md mt-6">
              Improve SEO (Beta)
            </button>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {sampleContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Optimization Form Component
const QuickOptimizationForm = () => {
  const navigate = useNavigate();
  const [contentMethod, setContentMethod] = useState<'text' | 'link' | 'file'>('text');
  const [content, setContent] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentConfirmed, setContentConfirmed] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [showPrimaryKeywordSuggestions, setShowPrimaryKeywordSuggestions] = useState(false);
  const [showSecondaryKeywordSuggestions, setShowSecondaryKeywordSuggestions] = useState(false);
  const [primaryKeywordSuggestions, setPrimaryKeywordSuggestions] = useState<Array<{id: string, text: string}>>([]);
  const [secondaryKeywordSuggestions, setSecondaryKeywordSuggestions] = useState<Array<{id: string, text: string}>>([]);
  const [regenerationNote, setRegenerationNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  
  const handleContentConfirm = async () => {
    // Validate content based on selected method
    if (contentMethod === 'text' && !content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add your content before confirming.",
        variant: "destructive"
      });
      return;
    }
    
    if (contentMethod === 'link' && !contentUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL.",
        variant: "destructive"
      });
      return;
    }
    
    if (contentMethod === 'file' && !contentFile) {
      toast({
        title: "File Required",
        description: "Please upload a file.",
        variant: "destructive"
      });
      return;
    }
    
    // Handle URL content extraction
    if (contentMethod === 'link') {
      setFetchingUrl(true);
      try {
        const extractedContent = await extractContentFromUrl(contentUrl);
        if (!extractedContent || extractedContent.length < 100) {
          toast({
            title: "URL Extraction Warning",
            description: "The extracted content seems too short. Please check the URL or try a different method.",
            variant: "warning"
          });
        }
        setContent(extractedContent);
        toast({
          title: "URL Content Extracted",
          description: "Successfully extracted content from the URL.",
        });
      } catch (error) {
        toast({
          title: "URL Extraction Failed",
          description: error instanceof Error ? error.message : "Could not extract content from the provided URL.",
          variant: "destructive"
        });
        setFetchingUrl(false);
        return;
      }
      setFetchingUrl(false);
    }
    
    // Handle file content reading
    if (contentMethod === 'file' && contentFile) {
      try {
        const text = await readFileAsText(contentFile);
        setContent(text);
      } catch (error) {
        toast({
          title: "File Reading Failed",
          description: "Could not read the uploaded file.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setContentConfirmed(true);
    toast({
      title: "Content Confirmed",
      description: "Your content has been added successfully.",
    });
    
    // Generate primary keyword suggestions after content is confirmed
    setIsLoading(true);
    try {
      const suggestions = await generateKeywordSuggestions(content);
      setPrimaryKeywordSuggestions(suggestions);
    } catch (error) {
      console.error("Error getting keyword suggestions:", error);
      toast({
        title: "Suggestion Generation Failed",
        description: "Could not generate keyword suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsText(file);
    });
  };
  
  const handlePrimaryKeywordSelect = async (keyword: string) => {
    setPrimaryKeyword(keyword);
    setShowPrimaryKeywordSuggestions(false);
    
    // Generate secondary keyword suggestions based on the primary keyword
    setIsLoading(true);
    try {
      const suggestions = await generateSecondaryKeywordSuggestions(keyword, content);
      setSecondaryKeywordSuggestions(suggestions);
      setShowSecondaryKeywordSuggestions(true);
    } catch (error) {
      console.error("Error getting secondary keyword suggestions:", error);
      toast({
        title: "Suggestion Generation Failed",
        description: "Could not generate secondary keyword suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSecondaryKeywordSelect = (keyword: string) => {
    const keywords = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k !== '');
    if (!keywords.includes(keyword)) {
      const newKeywords = [...keywords, keyword].join(', ');
      setSecondaryKeywords(newKeywords);
    }
  };
  
  const handleRegeneratePrimaryKeywords = async () => {
    if (!content) {
      toast({
        title: "Content Required",
        description: "Please confirm your content before regenerating keywords.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const suggestions = await generateKeywordSuggestions(content, 3, regenerationNote);
      setPrimaryKeywordSuggestions(suggestions);
      setRegenerationNote('');
      toast({
        title: "Keywords Regenerated",
        description: "New primary keyword suggestions have been generated.",
      });
    } catch (error) {
      console.error("Error regenerating keyword suggestions:", error);
      toast({
        title: "Regeneration Failed",
        description: "Could not regenerate keyword suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerateSecondaryKeywords = async () => {
    if (!primaryKeyword || !content) {
      toast({
        title: "Information Required",
        description: "Please confirm your content and select a primary keyword first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword, 
        content, 
        6, 
        regenerationNote
      );
      setSecondaryKeywordSuggestions(suggestions);
      setRegenerationNote('');
      toast({
        title: "Keywords Regenerated",
        description: "New secondary keyword suggestions have been generated.",
      });
    } catch (error) {
      console.error("Error regenerating secondary keyword suggestions:", error);
      toast({
        title: "Regeneration Failed",
        description: "Could not regenerate secondary keyword suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartOptimization = async () => {
    if (!contentConfirmed) {
      toast({
        title: "Content Required",
        description: "Please confirm your content before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    if (!primaryKeyword.trim()) {
      toast({
        title: "Primary Keyword Required",
        description: "Please add a primary keyword before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate loading
    setIsLoading(true);
    toast({
      title: "Optimization Started",
      description: "Analyzing and optimizing your content...",
    });
    
    // Process secondary keywords
    const secondaryKeywordsArray = secondaryKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k !== '');
    
    try {
      // Analyze content using OpenAI
      const analysis = await analyzeSEOScore(
        content,
        primaryKeyword,
        secondaryKeywordsArray
      );
      
      // Navigate to the results page after analysis is complete
      navigate('/seo-checker', { 
        state: { 
          content, 
          primaryKeyword,
          secondaryKeywords: secondaryKeywordsArray,
          analysis
        }
      });
    } catch (error) {
      console.error("Error analyzing content:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your content. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Reset suggestions when switching content methods
  useEffect(() => {
    if (!contentConfirmed) {
      setPrimaryKeywordSuggestions([]);
      setSecondaryKeywordSuggestions([]);
    }
  }, [contentMethod, contentConfirmed]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick SEO Optimization</h1>
      
      <div className="space-y-8">
        {/* Content Section */}
        <div className={`p-6 border rounded-lg ${contentConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
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
                <FileText size={16} className="mr-1 text-gray-500" />
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
                <Link size={16} className="mr-1 text-gray-500" />
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
                <Upload size={16} className="mr-1 text-gray-500" />
                Upload File
              </label>
            </div>
            
            {contentMethod === 'text' && (
              <Textarea 
                className="w-full h-32"
                placeholder="Paste your article content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={contentConfirmed}
              />
            )}
            
            {contentMethod === 'link' && (
              <div className="space-y-2">
                <Input 
                  type="url" 
                  className="w-full"
                  placeholder="Enter URL to your content..."
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  disabled={contentConfirmed || fetchingUrl}
                />
                {fetchingUrl && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    <span>Fetching content from URL...</span>
                  </div>
                )}
              </div>
            )}
            
            {contentMethod === 'file' && (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setContentFile(e.target.files[0]);
                      setContent(e.target.files[0].name); // Just for display
                    }
                  }}
                  disabled={contentConfirmed}
                  accept=".txt,.doc,.docx,.pdf,.md"
                />
                <label 
                  htmlFor="file-upload"
                  className={`cursor-pointer text-blue-600 hover:text-blue-800 ${contentConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Click to upload or drag and drop
                </label>
                {content && contentMethod === 'file' && <p className="mt-2 text-sm text-gray-500">{content}</p>}
              </div>
            )}
            
            {!contentConfirmed ? (
              <Button 
                className="bg-[#F76D01] hover:bg-[#E25C00] text-white"
                onClick={handleContentConfirm}
                disabled={isLoading || fetchingUrl}
              >
                {isLoading || fetchingUrl ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    {fetchingUrl ? "Fetching Content..." : "Processing..."}
                  </>
                ) : (
                  "Confirm Content"
                )}
              </Button>
            ) : (
              <div className="flex items-center text-green-600">
                <Check className="mr-2" />
                <span>Content added/confirmed.</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Keywords Section */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-medium mb-4">2. Add Keywords</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block font-medium">Primary Keyword:</label>
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  className="flex-1"
                  placeholder="Enter your main keyword..."
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                />
                <Button 
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setShowPrimaryKeywordSuggestions(!showPrimaryKeywordSuggestions)}
                  disabled={!contentConfirmed || isLoading}
                >
                  <Search size={16} />
                  Suggest
                </Button>
              </div>
              
              {showPrimaryKeywordSuggestions && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="mb-3 font-medium">Suggested (select one):</div>
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-sm text-gray-600">Generating suggestions...</span>
                      </div>
                    ) : primaryKeywordSuggestions.length > 0 ? (
                      primaryKeywordSuggestions.map((keyword) => (
                        <label key={keyword.id} className="flex items-center cursor-pointer">
                          <input 
                            type="radio" 
                            name="primaryKeyword" 
                            className="mr-2"
                            checked={primaryKeyword === keyword.text}
                            onChange={() => handlePrimaryKeywordSelect(keyword.text)}
                          />
                          {keyword.text}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No suggestions available. Try adding more content.</p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500 flex-1 mr-2">
                      <div className="flex items-center gap-1">
                        <Input 
                          type="text" 
                          className="w-full"
                          placeholder="Regeneration note..."
                          value={regenerationNote}
                          onChange={(e) => setRegenerationNote(e.target.value)}
                        />
                        <Pencil size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={handleRegeneratePrimaryKeywords}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">Secondary Keywords (Optional):</label>
              <div className="flex gap-2">
                <Textarea 
                  className="flex-1"
                  placeholder="Enter your secondary keywords, separated by commas..."
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  rows={2}
                />
                <Button
                  variant="outline"
                  className="h-fit flex items-center gap-1"
                  onClick={() => setShowSecondaryKeywordSuggestions(!showSecondaryKeywordSuggestions)}
                  disabled={!primaryKeyword.trim() || isLoading}
                >
                  <Search size={16} />
                  Suggest
                </Button>
              </div>
              
              {showSecondaryKeywordSuggestions && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="mb-3 font-medium">Suggested (select multiple):</div>
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-sm text-gray-600">Generating suggestions...</span>
                      </div>
                    ) : secondaryKeywordSuggestions.length > 0 ? (
                      secondaryKeywordSuggestions.map((keyword) => (
                        <label key={keyword.id} className="flex items-center cursor-pointer">
                          <Checkbox
                            id={`secondary-${keyword.id}`}
                            className="mr-2"
                            checked={secondaryKeywords.includes(keyword.text)}
                            onCheckedChange={() => handleSecondaryKeywordSelect(keyword.text)}
                          />
                          <span>{keyword.text}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No suggestions available. Try selecting a different primary keyword.</p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500 flex-1 mr-2">
                      <div className="flex items-center gap-1">
                        <Input 
                          type="text" 
                          className="w-full"
                          placeholder="Regeneration note..."
                          value={regenerationNote}
                          onChange={(e) => setRegenerationNote(e.target.value)}
                        />
                        <Pencil size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={handleRegenerateSecondaryKeywords}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
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
        
        <Button 
          className="bg-[#F76D01] hover:bg-[#E25C00] text-white w-full text-center py-6 text-lg"
          onClick={handleStartOptimization}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Start Quick Optimization"
          )}
        </Button>
      </div>
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

export default SEOChecker;
