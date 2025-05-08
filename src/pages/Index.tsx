import React, { useState } from "react";
import { Pen, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WritingStyleModal from "@/components/WritingStyleModal";

const Index = () => {
  const [writingStyleModalOpen, setWritingStyleModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [connectToWeb, setConnectToWeb] = useState(true);
  
  return (
    <div className="p-6 flex flex-col items-center">
      <div className="mb-8 w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-1 text-center">Good afternoon, Malek!</h1>
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6 flex flex-col items-center text-center">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Your <span className="text-[#F76D01]">SEO & Content AI Agent</span> is all set, what's on your mind?
                </h2>
                <p className="text-gray-600">Get insights from your favorite marketing tools in every response.</p>
              </div>
              
              <div className="max-w-2xl w-full">
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <Input 
                    placeholder="Create a pillar-cluster strategy for 'AI writing tools' in the UK..." 
                    className="border-0 bg-transparent focus-visible:ring-0 p-0"
                  />
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                      {/* Attachment Button with Tooltip */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="size-8"
                            >
                              <span className="sr-only">Attachment</span>
                              <Paperclip size={16} className="text-gray-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Attach a file</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Writing Style Button with Tooltip */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="size-8"
                              onClick={() => setWritingStyleModalOpen(true)}
                            >
                              <span className="sr-only">Writing Style</span>
                              <Pen size={16} className="text-gray-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Select a writing style</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Agent Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex items-center gap-2 text-sm cursor-pointer">
                            <span>{selectedAgent || "Auto"}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => setSelectedAgent("Auto")}>
                            Auto
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedAgent("Title Optimizer")}>
                            Title Optimizer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedAgent("Heading Optimizer")}>
                            Heading Optimizer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedAgent("Keyword Agent")}>
                            Keyword Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Connect to Web Toggle */}
                      <div className="flex items-center gap-2 text-sm">
                        <span>Connect to Web</span>
                        <div 
                          className={`w-10 h-5 ${connectToWeb ? 'bg-[#F76D01]' : 'bg-gray-200'} rounded-full relative flex items-center cursor-pointer`}
                          onClick={() => setConnectToWeb(!connectToWeb)}
                        >
                          <div 
                            className={`absolute h-4 w-4 bg-white rounded-full transition-all ${connectToWeb ? 'left-[22px]' : 'left-[2px]'}`}
                          ></div>
                        </div>
                      </div>

                      {/* Send Button */}
                      <Button variant="outline" size="icon" className="size-8">
                        <span className="sr-only">Send</span>
                        <Send size={16} className="text-gray-500" />
                      </Button>
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

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 max-w-4xl w-full">
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

      <div className="mb-8 max-w-4xl w-full">
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

      {/* Writing Style Modal */}
      <WritingStyleModal 
        open={writingStyleModalOpen} 
        onOpenChange={setWritingStyleModalOpen} 
      />
    </div>
  );
};

export default Index;
