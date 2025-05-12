
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workspace name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreating(true);
      const newWorkspace = await createWorkspace(newWorkspaceName);
      
      if (newWorkspace) {
        setCurrentWorkspace(newWorkspace);
        setNewWorkspaceDialogOpen(false);
        setNewWorkspaceName('');
        setPopoverOpen(false);
        
        toast({
          title: "Success",
          description: `Workspace "${newWorkspaceName}" created successfully`,
        });
      }
    } catch (error: any) {
      console.error("Workspace creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create workspace",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <div className="w-full h-8 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium bg-white hover:bg-gray-50 transition-colors rounded-md">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-[#F76D01] rounded-sm"></div>
              <span className="truncate">{currentWorkspace?.name || 'Select Workspace'}</span>
            </div>
            <ChevronDown size={16} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <Button
                key={workspace.id}
                variant={currentWorkspace?.id === workspace.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => {
                  setCurrentWorkspace(workspace);
                  setPopoverOpen(false);
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#F76D01] rounded-sm"></div>
                  <span className="truncate">{workspace.name}</span>
                </div>
              </Button>
            ))}
          </div>
          
          {workspaces.length < 3 && (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => {
                  setNewWorkspaceDialogOpen(true);
                  setPopoverOpen(false);
                }}
              >
                <Plus className="mr-2" size={16} />
                Create New Workspace
              </Button>
            </>
          )}
        </PopoverContent>
      </Popover>
      
      <Dialog open={newWorkspaceDialogOpen} onOpenChange={setNewWorkspaceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
            <Button variant="outline" onClick={() => setNewWorkspaceDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={isCreating || !newWorkspaceName.trim()}>
              {isCreating ? 'Creating...' : 'Create Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkspaceSwitcher;
