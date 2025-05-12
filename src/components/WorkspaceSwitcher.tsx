
import React, { useState } from 'react';
import { ChevronDown, Plus, Settings } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';

const WorkspaceSwitcher = () => {
  const { currentWorkspace, workspaces, setCurrentWorkspace, createWorkspace, loading } = useWorkspace();
  const [newWorkspaceDialogOpen, setNewWorkspaceDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workspace name",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has reached the workspace limit
    if (workspaces.length >= 3) {
      toast({
        title: "Limit Reached",
        description: "You can only create up to 3 workspaces",
        variant: "destructive",
      });
      return;
    }
    
    const newWorkspace = await createWorkspace(newWorkspaceName);
    if (newWorkspace) {
      setCurrentWorkspace(newWorkspace);
      setNewWorkspaceDialogOpen(false);
      setNewWorkspaceName('');
    }
  };

  if (loading) {
    return (
      <div className="p-3 border-b border-gray-200">
        <div className="w-full h-8 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between px-2 py-1 text-sm text-gray-600">
            <span>{currentWorkspace?.name || 'Select Workspace'}</span>
            <ChevronDown size={16} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <Button
                key={workspace.id}
                variant={currentWorkspace?.id === workspace.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => setCurrentWorkspace(workspace)}
              >
                {workspace.name}
              </Button>
            ))}
          </div>
          
          {workspaces.length < 3 && (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => setNewWorkspaceDialogOpen(true)}
              >
                <Plus className="mr-2" size={16} />
                New Workspace
              </Button>
            </>
          )}
        </PopoverContent>
      </Popover>
      
      <Dialog open={newWorkspaceDialogOpen} onOpenChange={setNewWorkspaceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Add a new workspace to organize your SEO projects.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="Enter workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewWorkspaceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace}>
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkspaceSwitcher;
