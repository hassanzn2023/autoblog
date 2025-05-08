
import React from 'react';
import TemplateCard from './TemplateCard';
import EmptyTemplateCard from './EmptyTemplateCard';
import { Template } from '@/types/template';

interface TemplatesTabContentProps {
  templates: Template[];
  onUseTemplate: (id: string) => void;
  onPreviewTemplate: (template: Template) => void;
  onCreateTemplate: () => void;
  showEmptyCard?: boolean;
  filterType?: 'official' | 'community' | 'yours' | 'all';
}

const TemplatesTabContent = ({
  templates,
  onUseTemplate,
  onPreviewTemplate,
  onCreateTemplate,
  showEmptyCard = false,
  filterType = 'all'
}: TemplatesTabContentProps) => {
  const filteredTemplates = filterType === 'all' 
    ? templates 
    : templates.filter(template => template.type === filterType);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTemplates.map(template => (
        <TemplateCard 
          key={template.id}
          template={template}
          onUse={onUseTemplate}
          onPreview={onPreviewTemplate}
        />
      ))}
      
      {showEmptyCard && (
        <EmptyTemplateCard onCreateTemplate={onCreateTemplate} />
      )}
    </div>
  );
};

export default TemplatesTabContent;
