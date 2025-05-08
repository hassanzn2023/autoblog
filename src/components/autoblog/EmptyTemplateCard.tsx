
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface EmptyTemplateCardProps {
  onCreateTemplate: () => void;
}

const EmptyTemplateCard = ({ onCreateTemplate }: EmptyTemplateCardProps) => {
  return (
    <Card className="border-dashed border-2 flex flex-col items-center justify-center hover:border-[#F76D01] transition-colors">
      <CardContent className="p-8 text-center">
        <div className="w-12 h-12 bg-[#FFF3EB] rounded-full flex items-center justify-center mx-auto mb-4">
          <PlusCircle size={24} className="text-[#F76D01]" />
        </div>
        <h3 className="font-medium text-lg mb-2">Create Custom Template</h3>
        <p className="text-gray-500 mb-6">
          Design your own autoblog template to reuse or share with others
        </p>
        <Button
          className="bg-white hover:bg-gray-50 text-[#F76D01] border border-[#F76D01]"
          onClick={onCreateTemplate}
        >
          Create Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyTemplateCard;
