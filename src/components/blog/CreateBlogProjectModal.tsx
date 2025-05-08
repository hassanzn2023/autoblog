
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface CreateBlogProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateBlogProjectModal: React.FC<CreateBlogProjectModalProps> = ({ isOpen, onClose }) => {
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    // Redirect to the configuration page for the new blog project
    navigate(`/blog/config/new?name=${encodeURIComponent(projectName)}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Blog Project</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">A name for your new blog project.</p>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="project-name" className="text-base font-medium">Blog Project Name</Label>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Blog Project"
              className="border-[#F76D01] focus-visible:ring-[#F76D01]"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
          <Button 
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            onClick={handleCreate}
            disabled={!projectName.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBlogProjectModal;
