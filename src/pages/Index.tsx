
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-6">
          <div className="h-16 w-16 bg-seo-purple rounded-lg mx-auto flex items-center justify-center shadow-lg mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-seo-text-primary">SEO Optimizer Suite</h1>
          <p className="text-xl text-seo-text-secondary mb-8">
            Optimize your content for search engines and boost your rankings with advanced SEO tools.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link to="/autofix/modes" className="seo-button seo-button-primary flex items-center gap-2 px-6 py-3">
            <span>Get Started</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
