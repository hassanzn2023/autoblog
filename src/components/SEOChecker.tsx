
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Info, X } from 'lucide-react';

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

interface RecommendationProps {
  status: 'success' | 'warning' | 'error';
  text: string;
  action?: string;
}

const Recommendation = ({ status, text, action }: RecommendationProps) => {
  const statusIcons = {
    success: <Check size={18} className="text-seo-success" />,
    warning: <AlertTriangle size={18} className="text-seo-warning" />,
    error: <X size={18} className="text-seo-error" />
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
        <button className="seo-button py-1 px-3 seo-button-secondary text-sm">
          {action}
        </button>
      )}
    </div>
  );
};

const SEOChecker = () => {
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
          className="seo-button seo-button-secondary"
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
              <a href="#" className="text-seo-purple text-sm">Learn more about how Content SEO Score works</a>
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
            
            <button className="seo-button seo-button-primary w-full mt-6">
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

export default SEOChecker;
