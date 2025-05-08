
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Good afternoon, Malek!</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex-grow">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Your <span className="text-[#F76D01]">SEO & Content AI Agent</span> is all set, what's on your mind?
                </h2>
                <p className="text-gray-600">Get insights from your favorite marketing tools in every response.</p>
              </div>
              
              <div className="max-w-3xl">
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <Input 
                    placeholder="Create a pillar-cluster strategy for 'AI writing tools' in the UK..." 
                    className="border-0 bg-transparent focus-visible:ring-0 p-0"
                  />
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="size-8">
                        <span className="sr-only">Microphone</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19 10v1a7 7 0 01-14 0v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Button>
                      
                      <Button variant="outline" size="icon" className="size-8">
                        <span className="sr-only">Upload</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17 8l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span>Auto</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span>AI Agent</span>
                        <div className="w-8 h-4 bg-gray-200 rounded-full relative flex items-center">
                          <div className="absolute h-3 w-3 bg-[#F76D01] rounded-full left-[2px] transition-all"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>3 SEO & Content AI Agent messages left</span>
                  </div>
                  <a href="#" className="text-[#F76D01]">Upgrade</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold">Unlock premium SEO & content tools</h2>
            <p className="text-sm text-gray-600 max-w-2xl">Get AI SEO Agent access, Generative Engine Optimization tools, higher limits on Article Writer, real-time data from Ahrefs & Google Search Console and access to Site Audit for up to 200 pages for 1 user & upto 5 projects.</p>
          </div>
          <div>
            <div className="text-sm">
              <span className="font-semibold">$16</span>/month, billed annually
            </div>
            <Button className="mt-2 bg-[#F76D01] hover:bg-[#e65d00]">Upgrade Now</Button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">SEO & Content workflow</h2>
        <p className="text-gray-600 mb-6">Take your content from idea to results, effortlessly.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="mb-3 bg-red-50 w-8 h-8 rounded-full flex items-center justify-center text-red-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Research</h3>
            <p className="text-sm text-gray-600">Dominate your niche using AI for keyword and topic research.</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="mb-3 bg-orange-50 w-8 h-8 rounded-full flex items-center justify-center text-orange-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Content (AI Article Writer)</h3>
            <p className="text-sm text-gray-600">Craft on-brand, factually accurate content effortlessly.</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="mb-3 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center text-blue-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3v3a2 2 0 01-2 2H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 14V7a2 2 0 00-2-2h-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 8v11a2 2 0 002 2h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 18h5a2 2 0 000-4h-5a2 2 0 000 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Optimize</h3>
            <p className="text-sm text-gray-600">Enhance your content for search engines and user engagement.</p>
          </div>
          
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="mb-3 bg-green-50 w-8 h-8 rounded-full flex items-center justify-center text-green-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 20v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Measure</h3>
            <p className="text-sm text-gray-600">Track performance metrics and optimize your strategy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
