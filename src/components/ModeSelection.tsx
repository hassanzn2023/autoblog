
import React from 'react';
import { Link } from 'react-router-dom';

const ModeCard = ({ 
  title, 
  duration, 
  description, 
  features, 
  badge, 
  badgeColor = "seo-badge-recommended", 
  icon, 
  link 
}: {
  title: string;
  duration: string;
  description: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  link: string;
}) => (
  <div className="seo-card max-w-md w-full">
    {badge && (
      <div className="mb-2">
        <span className={`seo-badge ${badgeColor}`}>{badge}</span>
      </div>
    )}
    
    <div className="h-32 bg-seo-purple-light rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="text-sm text-gray-500">🕒 {duration}</div>
    </div>
    
    <p className="font-medium mb-2">{description}</p>
    
    <ul className="space-y-1 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <span className="mr-2 text-gray-500">•</span>
          {feature}
        </li>
      ))}
    </ul>
    
    <Link to={link} className="seo-button seo-button-outline block text-center">
      Click to start
    </Link>
  </div>
);

const LinkIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" 
      stroke="#6e41e2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" 
      stroke="#6e41e2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LightningIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" 
      stroke="#6e41e2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ModeSelection = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Choose your SEO optimization mode:</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <ModeCard 
          title="10-Steps Article (Full Control)"
          duration="5 mins"
          description="Full control over:"
          features={[
            "Article Type (Listicles, How-to Guides, news articles, etc.)",
            "Reference/Competitor Selection",
            "Keywords",
            "Word Length (500-5000 words)",
            "Outline",
            "Writing Style, CTA",
            "Image, FAQs and other settings"
          ]}
          badge="Recommended"
          icon={<LinkIcon />}
          link="/autofix/pro"
        />
        
        <ModeCard 
          title="Instant Article (Quick Optimize)"
          duration="1 min"
          description="You Provide:"
          features={[
            "Topic/Title or Content",
            "Article Type (Listicles, How-to Guides, news articles, etc.)",
            "Keywords (Optional)",
            "Reference/Competitor Selection (Optional)",
            "We Handle the Rest!"
          ]}
          badge="Beta"
          badgeColor="seo-badge-beta"
          icon={<LightningIcon />}
          link="/autofix/normal"
        />
      </div>
    </div>
  );
};

export default ModeSelection;
