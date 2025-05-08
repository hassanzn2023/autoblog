
import React, { useState } from "react";
import { Pen, Send, Paperclip, ChevronRight, FileText, Plus } from "lucide-react";
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
import { Card } from "@/components/ui/card";

const Index = () => {
  const [writingStyleModalOpen, setWritingStyleModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [connectToWeb, setConnectToWeb] = useState(true);
  
  // Sample data for recent documents
  const recentDocuments = [
    {
      id: 1,
      title: "fsafagsgagdgzdfsaksfhaks f;ksabk;sabf as;f bsa; fka",
      timeAgo: "9 hours ago"
    },
    {
      id: 2,
      title: "مبتدأ؛ نعت قيد عاطفتين حد",
      timeAgo: "a day ago"
    },
    {
      id: 3,
      title: "Speed Test Guide: What Really Affects Your Internet Speed in 2025",
      timeAgo: "a day ago"
    },
    {
      id: 4,
      title: "نتحة رصين من مراجعة جوية",
      timeAgo: "a day ago"
    },
    {
      id: 5,
      title: "نتحة رصين من مراجعة جوية",
      timeAgo: "a day ago"
    }
  ];
  
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Research */}
          <div className="flex gap-6 bg-white p-6 rounded-lg border border-gray-200">
            <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
              <svg className="text-purple-600" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Research</h3>
              <p className="text-gray-600">Dominate your niche using AI for keyword and topic research.</p>
            </div>
          </div>
          
          {/* Content Writer */}
          <div className="flex gap-6 bg-white p-6 rounded-lg border border-gray-200">
            <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
              <svg className="text-purple-600" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Content (AI Article Writer)</h3>
              <p className="text-gray-600">Craft on-brand, factually accurate content effortlessly.</p>
            </div>
          </div>
          
          {/* Repurpose */}
          <div className="flex gap-6 bg-white p-6 rounded-lg border border-gray-200">
            <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
              <svg className="text-purple-600" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 2v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.5 22v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21.5 8c-3.3 3.3-8 3-12-1-4 4-8.7 4.3-12 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Repurpose</h3>
              <p className="text-gray-600">Easily transform existing content into new, engaging formats.</p>
            </div>
          </div>
          
          {/* Optimize */}
          <div className="flex gap-6 bg-white p-6 rounded-lg border border-gray-200">
            <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
              <svg className="text-purple-600" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3v3a2 2 0 01-2 2H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 18h5a2 2 0 000-4h-5a2 2 0 000 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Optimize</h3>
              <p className="text-gray-600">Analyze your content and get insights to improve its SEO Score.</p>
            </div>
          </div>
        </div>
        
        {/* Brand visibility and Site Audit Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex">
              <div className="p-6 flex items-center justify-center w-24 bg-gray-50">
                <div className="flex items-center justify-center">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#F76D01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.7 15c-.3.3-.1 1.7-1.1 2.2-.9.5-1.9-.3-2.9-.3-1 0-1.9.8-2.9.3-1-.5-.8-1.9-1.1-2.2-.3-.3-1.7-.1-2.2-1.1-.5-.9.3-1.9.3-2.9 0-1-.8-1.9-.3-2.9.5-1 1.9-.8 2.2-1.1.3-.3.1-1.7 1.1-2.2.9-.5 1.9.3 2.9.3 1 0 1.9-.8 2.9-.3 1 .5.8 1.9 1.1 2.2.3.3 1.7.1 2.2 1.1.5.9-.3 1.9-.3 2.9 0 1 .8 1.9.3 2.9-.5 1-1.9.8-2.2 1.1z" stroke="#F76D01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Is your brand visible to AI?</h3>
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Track brand visibility, AI crawler activity and content rankings across generative platforms.</p>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex">
              <div className="p-6 flex items-center justify-center w-24 bg-gray-50">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="45" stroke="#E0E0E0" strokeWidth="10" />
                      <path 
                        d="M50 5 A 45 45 0 0 1 95 50" 
                        stroke="#4CAF50" 
                        strokeWidth="10" 
                        strokeLinecap="round" 
                      />
                      <text x="50" y="55" fontFamily="Arial" fontSize="24" fill="#333" textAnchor="middle">95</text>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Run Your First Site Audit</h3>
                    <p className="text-sm text-gray-600 mt-1">To unlock insights and improve your site's health, run an audit now.</p>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="mb-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent documents</h2>
          <a href="#" className="text-purple-600 hover:underline flex items-center text-sm">
            View all <ChevronRight size={16} />
          </a>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="divide-y">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-gray-400" />
                  <span className="text-sm">{doc.title}</span>
                </div>
                <span className="text-xs text-gray-500">{doc.timeAgo}</span>
              </div>
            ))}
            <div className="py-3">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full justify-start gap-2">
                <Plus size={16} />
                Create new
              </Button>
            </div>
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
