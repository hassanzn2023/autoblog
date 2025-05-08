
import React, { useState } from 'react';
import { X } from 'lucide-react';
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

interface BlogProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BlogProjectModal: React.FC<BlogProjectModalProps> = ({ isOpen, onClose }) => {
  const [projectName, setProjectName] = useState('');

  const handleCreate = () => {
    // Here you would handle the creation of a new blog project
    if (projectName.trim()) {
      // Redirect to the configuration wizard for the new blog project
      window.location.href = `/blog/config/new?name=${encodeURIComponent(projectName)}`;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Blog Project</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Create a new blog project to manage your content.</p>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Label htmlFor="project-name" className="flex-shrink-0 w-24">Project Name</Label>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter blog project name"
              className="border-[#F76D01] focus-visible:ring-[#F76D01]"
            />
            <p className="text-xs text-gray-500 ml-24">This is purely for your reference...</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
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

export default BlogProjectModal;
