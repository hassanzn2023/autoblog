
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, BookOpen, MessageSquare, LayoutGrid } from "lucide-react";

const GetStartedPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex items-center">
            Welcome to Writesonic <span className="ml-2">👋</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's everything you need to kickstart your content marketing journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Lets get you started</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">0 of 5 completed</span>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* First task */}
                <div className="p-6 flex">
                  <div className="mr-4 mt-1">
                    <Checkbox id="task-1" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <label 
                          htmlFor="task-1" 
                          className="font-medium text-gray-800 dark:text-white cursor-pointer"
                        >
                          Run Your First Site Audit
                        </label>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          Review key metrics like site health, keyword rankings, and opportunities for improvement.
                        </p>
                        <Button 
                          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Start Site Audit
                        </Button>
                      </div>
                      <div className="w-full md:w-64 h-36 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
                          <path d="M10 21H14C16.2091 21 18 19.2091 18 17V7C18 4.79086 16.2091 3 14 3H10C7.79086 3 6 4.79086 6 7V17C6 19.2091 7.79086 21 10 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 12H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 15H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 12H14.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 15H14.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 18H14.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Second task */}
                <div className="p-6 flex">
                  <div className="mr-4 mt-1">
                    <Checkbox id="task-2" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <label 
                          htmlFor="task-2" 
                          className="font-medium text-gray-800 dark:text-white cursor-pointer"
                        >
                          Use the AI SEO Agent to Fetch Insights
                        </label>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          Get real-time insights from top tools like Ahrefs, Google Search Console, and more to optimize your campaigns.
                        </p>
                        <Button 
                          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Try SEO & Content AI Agent
                        </Button>
                      </div>
                      <div className="w-full md:w-64 h-36 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">A</div>
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">G</div>
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">S</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Third task */}
                <div className="p-6 flex">
                  <div className="mr-4 mt-1">
                    <Checkbox id="task-3" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <label 
                          htmlFor="task-3" 
                          className="font-medium text-gray-800 dark:text-white cursor-pointer"
                        >
                          Research and Plan Content
                        </label>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          Explore trending topics, analyze competitors, and create a winning content strategy tailored to your audience.
                        </p>
                        <Button 
                          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Start Research
                        </Button>
                      </div>
                      <div className="w-full md:w-64 h-36 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
                          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Fourth task */}
                <div className="p-6 flex">
                  <div className="mr-4 mt-1">
                    <Checkbox id="task-4" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <label 
                          htmlFor="task-4" 
                          className="font-medium text-gray-800 dark:text-white cursor-pointer"
                        >
                          Generate Your First Content
                        </label>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          Create high-quality, SEO-optimized content for your blog, website, or marketing campaigns.
                        </p>
                        <Button 
                          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Create Content
                        </Button>
                      </div>
                      <div className="w-full md:w-64 h-36 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
                          <path d="M9 12H15M9 16H15M9 8H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Fifth task */}
                <div className="p-6 flex">
                  <div className="mr-4 mt-1">
                    <Checkbox id="task-5" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <label 
                          htmlFor="task-5" 
                          className="font-medium text-gray-800 dark:text-white cursor-pointer"
                        >
                          Optimize for SEO
                        </label>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          Enhance your content visibility with advanced SEO techniques and best practices.
                        </p>
                        <Button 
                          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Optimize Content
                        </Button>
                      </div>
                      <div className="w-full md:w-64 h-36 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
                          <path d="M16 8L8 16M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-between border-t border-purple-100 dark:border-purple-800">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mr-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-600 dark:text-purple-300">
                      <path d="M12 16V8M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Experience the full suite of tools and features with Writesonic</span>
                </div>
                <Button variant="link" className="text-purple-700 dark:text-purple-300 font-medium flex items-center">
                  Upgrade now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h3 className="font-medium text-gray-800 dark:text-white mb-3">Watch demo</h3>
              <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700">
                <img 
                  src="/lovable-uploads/12a27e91-58e3-46a3-abfd-541683b22530.png" 
                  alt="Demo video thumbnail" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="icon" className="rounded-full bg-white/90 hover:bg-white text-black h-12 w-12">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h3 className="font-medium text-gray-800 dark:text-white mb-3">Quick Links</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-[#F76D01] dark:hover:text-[#F76D01]">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>Help Docs</span>
                </a>
                <a href="#" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-[#F76D01] dark:hover:text-[#F76D01]">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>Talk to our team</span>
                </a>
                <a href="#" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-[#F76D01] dark:hover:text-[#F76D01]">
                  <LayoutGrid className="h-5 w-5 mr-2" />
                  <span>Join Slack community</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;
