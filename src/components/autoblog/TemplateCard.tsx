
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Template } from '@/types/template';
import { getTypeColor } from '@/utils/templateUtils';

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  onPreview: (template: Template) => void;
}

const TemplateCard = ({ template, onUse, onPreview }: TemplateCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge className={getTypeColor(template.type)}>
              {template.type === 'official' ? 'Official' : 
               template.type === 'community' ? 'Community' : 'Yours'}
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-1">{template.description}</CardDescription>
      </CardHeader>
      <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between p-3">
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600"
          onClick={() => onPreview(template)}
        >
          Preview
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600"
          >
            <Copy size={16} />
          </Button>
          <Button
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            size="sm"
            onClick={() => onUse(template)}
          >
            Use Template <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
