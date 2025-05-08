
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, ChevronDown, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ProModeForm = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [contentMethod, setContentMethod] = useState<'text' | 'link' | 'file'>('text');
  const [contentConfirmed, setContentConfirmed] = useState(false);
  const [activeStep, setActiveStep] = useState<string>("add-content");
  
  // Track completion status of each step
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    "add-content": false,
    "basic-settings": false,
    "title-meta": false,
    "headings": false,
    "post-design": false,
    "keywords": false,
    "links": false
  });
  
  const handleStepComplete = (stepId: string) => {
    setCompletedSteps({
      ...completedSteps,
      [stepId]: true
    });
    
    // Open next step
    const steps = ["add-content", "basic-settings", "title-meta", "headings", "post-design", "keywords", "links"];
    const currentIndex = steps.indexOf(stepId);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setActiveStep(nextStep);
    }
  };
  
  const handleContentConfirm = () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add your content before confirming.",
        variant: "destructive"
      });
      return;
    }
    
    setContentConfirmed(true);
    handleStepComplete("add-content");
    
    toast({
      title: "Content Confirmed",
      description: "Your content has been added successfully.",
    });
  };
  
  const handleStartOptimization = () => {
    // Check if all steps are completed
    const allCompleted = Object.values(completedSteps).every(status => status);
    
    if (!allCompleted) {
      toast({
        title: "Complete All Steps",
        description: "Please complete all steps before starting optimization.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate loading
    toast({
      title: "Optimization Started",
      description: "Analyzing and optimizing your content...",
    });
    
    // Navigate to the results page after a delay
    setTimeout(() => {
      navigate('/seo-checker');
    }, 1500);
  };
  
  const isAllCompleted = Object.values(completedSteps).every(status => status);
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-6">SEO Checker and Optimizer (Pro Mode)</h1>
      
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            {/* SEO Score Preview */}
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-16">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path 
                    d="M 0,50 A 50,50 0 0,1 100,50" 
                    fill="none" 
                    stroke="#f0f0f0" 
                    strokeWidth="10"
                  />
                  <path 
                    d="M 0,50 A 50,50 0 0,1 50,0" 
                    fill="none" 
                    stroke="#F44336" 
                    strokeWidth="10"
                  />
                  <path 
                    d="M 50,0 A 50,50 0 0,1 100,50" 
                    fill="none" 
                    stroke="#4CAF50" 
                    strokeWidth="10"
                  />
                  <text x="50" y="60" textAnchor="middle" className="text-xs font-bold">SEO</text>
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-medium text-center mb-2">Improve your search engine rankings</h2>
            <p className="text-center text-sm text-gray-500 mb-4">
              This tool measures the quality and relevance of your writing against competitor...
            </p>
          </div>
          
          <Accordion type="single" value={activeStep} onValueChange={setActiveStep} className="w-full">
            <AccordionItem value="add-content" className="border rounded-lg mb-2 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                    {completedSteps["add-content"] ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <span className="text-sm">1</span>
                    )}
                  </div>
                  <span>Add your content</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-4 py-3">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="contentMethod" 
                        checked={contentMethod === 'text'} 
                        onChange={() => setContentMethod('text')} 
                        className="mr-2" 
                      />
                      Add Text
                    </label>
                    
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="contentMethod" 
                        checked={contentMethod === 'link'} 
                        onChange={() => setContentMethod('link')} 
                        className="mr-2" 
                      />
                      Add Link
                    </label>
                    
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="contentMethod" 
                        checked={contentMethod === 'file'} 
                        onChange={() => setContentMethod('file')} 
                        className="mr-2" 
                      />
                      Upload File
                    </label>
                  </div>
                  
                  {contentMethod === 'text' && (
                    <textarea 
                      className="w-full h-32 p-3 border border-gray-300 rounded-md"
                      placeholder="Paste your article content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={contentConfirmed}
                    />
                  )}
                  
                  {contentMethod === 'link' && (
                    <input 
                      type="url" 
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Enter URL to your content..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={contentConfirmed}
                    />
                  )}
                  
                  {contentMethod === 'file' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setContent(e.target.files[0].name);
                          }
                        }}
                        disabled={contentConfirmed}
                      />
                      <label 
                        htmlFor="file-upload"
                        className="cursor-pointer text-seo-purple hover:text-seo-purple/80"
                      >
                        Click to upload or drag and drop
                      </label>
                      {content && <p className="mt-2 text-sm text-gray-500">{content}</p>}
                    </div>
                  )}
                  
                  <button 
                    className="seo-button seo-button-primary"
                    onClick={handleContentConfirm}
                    disabled={contentConfirmed}
                  >
                    Confirm Content
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="basic-settings" className="border rounded-lg mb-2 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                    {completedSteps["basic-settings"] ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <span className="text-sm">2</span>
                    )}
                  </div>
                  <span>Basic settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-4 py-3">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Assistant model</label>
                    <div className="flex gap-2">
                      <select className="flex-1 p-2 border border-gray-300 rounded-md">
                        <option>Default SEO Model</option>
                        <option>Custom Assistant 1</option>
                        <option>Custom Assistant 2</option>
                      </select>
                      <button className="seo-button seo-button-secondary">
                        Create New
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2">Primary Keyword</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder="Enter your main keyword..."
                      />
                      <button className="seo-button seo-button-secondary">
                        Suggest
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2">Secondary Keywords</label>
                    <div className="flex gap-2">
                      <textarea 
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder="Enter your secondary keywords, separated by commas..."
                        rows={2}
                      />
                      <button className="seo-button seo-button-secondary h-fit">
                        Suggest
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="seo-button seo-button-primary"
                    onClick={() => handleStepComplete("basic-settings")}
                  >
                    Confirm Settings
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Additional accordion items - simplified for brevity */}
            {["title-meta", "headings", "post-design", "keywords", "links"].map((step, index) => (
              <AccordionItem 
                key={step} 
                value={step} 
                className="border rounded-lg mb-2 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                      {completedSteps[step] ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <span className="text-sm">{index + 3}</span>
                      )}
                    </div>
                    <span>
                      {step === "title-meta" && "Title & Meta Fixer"}
                      {step === "headings" && "Heading Optimization"}
                      {step === "post-design" && "Post Design"}
                      {step === "keywords" && "Keyword Integration"}
                      {step === "links" && "Links Injection"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t px-4 py-3">
                  <div className="h-24 flex items-center justify-center text-gray-500">
                    <span>Settings for {step.replace("-", " ")} go here</span>
                  </div>
                  
                  <button 
                    className="seo-button seo-button-primary mt-4"
                    onClick={() => handleStepComplete(step)}
                  >
                    Confirm {step.replace("-", " ")}
                  </button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {isAllCompleted && (
            <button 
              className="seo-button seo-button-primary w-full mt-6"
              onClick={handleStartOptimization}
            >
              Start Optimization
            </button>
          )}
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Your confirmed content will appear here for optimization.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProModeForm;
