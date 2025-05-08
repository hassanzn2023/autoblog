
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Template } from '@/types/template';

interface TemplateCardProps {
  template: Template;
  onUse: (id: string) => void;
  onPreview: (template: Template) => void;
}

const TemplateCard = ({ template, onUse, onPreview }: TemplateCardProps) => {
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'official':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'community':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'yours':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

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
            onClick={() => onUse(template.id)}
          >
            Use Template <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
