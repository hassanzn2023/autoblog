
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Template } from '@/types/template';
import { toast } from '@/hooks/use-toast';

// Mock projects data (would come from an API in a real app)
const mockProjects = [
  { id: '1', name: 'Default Campaign' },
  { id: '2', name: 'Tech Blog' },
  { id: '3', name: 'Product Reviews' },
];

interface SelectProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

const SelectProjectDialog: React.FC<SelectProjectDialogProps> = ({
  open,
  onOpenChange,
  template,
}) => {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  if (!template) return null;

  const handleApplyTemplate = () => {
    if (!selectedProjectId) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }

    // Store template selection in localStorage to retrieve it on the config page
    localStorage.setItem('selectedTemplate', template.id);
    
    // Navigate to the config page with the project ID
    navigate(`/autoblog/config/${selectedProjectId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Template to Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Selected Template</h3>
            <div className="p-2 bg-gray-50 rounded border">
              <p className="font-medium">{template.name}</p>
              <p className="text-sm text-gray-500">{template.description}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Select Project</h3>
            <p className="text-sm text-gray-500">Choose which project to apply this template to</p>
            <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            onClick={handleApplyTemplate}
          >
            Apply Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectProjectDialog;
