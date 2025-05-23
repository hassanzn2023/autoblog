
import React, { useState } from 'react';
import { X, ArrowLeft, Upload, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface WritingStyleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WritingStyleModal = ({ open, onOpenChange }: WritingStyleModalProps) => {
  const [selectedStyle, setSelectedStyle] = useState<string>("Default");

  return (
    <>
      {/* Writing Style Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <span></span>
        </PopoverTrigger>
        <PopoverContent 
          align="start" 
          className="w-[350px] p-0 bg-white border border-gray-200 shadow-md rounded-md"
        >
          <div className="p-3 border-b">
            <p className="text-sm text-gray-700">How should responses be written?</p>
          </div>
          <div className="p-2">
            <div 
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
              onClick={() => setSelectedStyle("Default")}
            >
              <span>Default</span>
              {selectedStyle === "Default" && <Check size={16} className="text-[#F76D01]" />}
            </div>
            <div className="mt-2 p-3">
              <Button 
                variant="outline" 
                className="w-full border border-gray-200 hover:bg-gray-50"
                onClick={() => onOpenChange(true)}
              >
                Create & edit styles
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Full Writing Style Modal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md md:max-w-lg p-0 bg-white overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="mr-2 p-1 h-auto" onClick={() => onOpenChange(false)}>
                <ArrowLeft size={16} />
              </Button>
              <DialogTitle className="text-lg font-semibold">Create a writing style</DialogTitle>
            </div>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div className="space-y-6">
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Add URLs</h3>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <span className="text-xl font-medium">+</span>
                  </Button>
                </div>
                <p className="text-sm text-gray-500">We'll scan and analyze them</p>
              </div>
              
              <div className="border rounded-md p-4 space-y-2">
                <h3 className="font-medium">Add files</h3>
                <p className="text-sm text-gray-500">PDF file reflecting your brand</p>
                
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                  <Upload className="mb-2 text-gray-400" />
                  <p className="text-sm font-medium">Drag and drop your files here</p>
                  <p className="text-xs text-gray-500 mt-1">PDF/DOC/DOCX files only, max 10MB per file</p>
                </div>
              </div>
              
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Add text snippet</h3>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <span className="text-xl font-medium">+</span>
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Write or paste your text</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                    <path d="M55.818 22.727L60 18.545L50.909 9.455L46.727 13.636M55.818 22.727L40.455 38.091L32.727 40L34.636 32.273L50 16.909M55.818 22.727L50 16.909" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-medium mb-2">Share your writing through files, links, or snippets, and we'll create a style tailored to you!</h3>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between p-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="bg-[#F76D01] hover:bg-[#e65d00]">Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WritingStyleModal;
