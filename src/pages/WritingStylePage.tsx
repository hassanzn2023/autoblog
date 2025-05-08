
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trophy } from 'lucide-react';
import WritingStyleModal from '../components/WritingStyleModal';

const WritingStylePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Writing Style</h1>
      <p className="text-gray-600 mb-8">Boost brand consistency: upload content, our AI learns and replicates your tone.</p>
      
      <div className="flex justify-center items-center flex-col max-w-2xl mx-auto">
        <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Trophy size={40} className="text-[#F76D01]" />
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-center">Create your first writing style</h2>
        <p className="text-gray-600 text-center mb-6">
          Writing Style helps you generate content in your defined brand voice,
          ensuring consistent tone and messaging across all content generations.
        </p>
        
        <Button 
          className="bg-[#F76D01] hover:bg-[#e65d00]"
          onClick={() => setIsModalOpen(true)}
        >
          Get started
        </Button>
      </div>
      
      <WritingStyleModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default WritingStylePage;
