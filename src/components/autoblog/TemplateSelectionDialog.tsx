
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import { Template } from '@/types/template';
import { templates } from '@/data/templates';
import TemplatesTabContent from './TemplatesTabContent';

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  const handleSelectTemplate = (template: Template) => {
    // Store the selected template ID in localStorage
    localStorage.setItem('selectedTemplate', template.id);
    
    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose a Template</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X size={18} />
          </Button>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600 mb-6">
            Select a template to quickly set up your campaign with pre-configured settings
          </p>
          
          <TemplatesTabContent
            templates={templates}
            onUseTemplate={handleSelectTemplate}
            onPreviewTemplate={() => {}} // We don't need preview functionality here
            onCreateTemplate={() => {
              onOpenChange(false);
              navigate('/autoblog/template');
            }}
            filterType="all"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionDialog;
