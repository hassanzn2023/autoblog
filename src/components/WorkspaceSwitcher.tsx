
import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Loader2, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const WorkspaceSwitcher = () => {
  const { currentWorkspace, workspaces, setCurrentWorkspace, createWorkspace, loading, fetchWorkspaces, error, connectionStatus } = useWorkspace();
  const { user } = useAuth();
  const [newWorkspaceDialogOpen, setNewWorkspaceDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ensure workspaces are loaded properly
  useEffect(() => {
    if (user && workspaces.length === 0 && !loading) {
      console.log("No workspaces found, triggering fetch");
      fetchWorkspaces();
    }
  }, [workspaces, loading, fetchWorkspaces, user]);

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
      console.log("Creating new workspace with name:", newWorkspaceName);
      const newWorkspace = await createWorkspace(newWorkspaceName);
      
      if (newWorkspace) {
        setNewWorkspaceDialogOpen(false);
        setNewWorkspaceName('');
        setPopoverOpen(false);
        
        toast({
          title: "Success",
          description: `Workspace "${newWorkspaceName}" created successfully`,
          variant: "success",
        });
        console.log("Workspace created:", newWorkspace);
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
  
  const handleRefreshWorkspaces = async () => {
    try {
      setIsRefreshing(true);
      await fetchWorkspaces();
      toast({
        title: "Refreshed",
        description: "Workspace list has been refreshed",
        variant: "success",
      });
    } catch (error) {
      console.error("Error refreshing workspaces:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh workspaces list",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const isTemporaryWorkspace = (workspace: any) => {
    return workspace?.id?.toString().startsWith('temp-');
  };

  const getConnectionStatusIcon = () => {
    if (connectionStatus === 'connected') {
      return <Wifi size={16} className="text-green-500 ml-1" />;
    } else if (connectionStatus === 'disconnected') {
      return <WifiOff size={16} className="text-red-500 ml-1" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between px-3 py-2 border rounded-md border-gray-200">
        <div className="flex items-center space-x-2">
          <Loader2 size={16} className="animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">Loading workspaces...</span>
        </div>
      </div>
    );
  }

  // Check if we have any real (non-temporary) workspaces
  const realWorkspacesCount = workspaces.filter(w => !isTemporaryWorkspace(w)).length;

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium bg-white hover:bg-gray-50 transition-colors rounded-md">
            {error ? (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle size={16} />
                <span className="truncate">Connection Error</span>
                {getConnectionStatusIcon()}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#F76D01] rounded-sm"></div>
                <span className="truncate">{currentWorkspace?.name || 'Select Workspace'}</span>
                {isTemporaryWorkspace(currentWorkspace) && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                    Offline
                  </Badge>
                )}
                {getConnectionStatusIcon()}
              </div>
            )}
            <ChevronDown size={16} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Your Workspaces</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleRefreshWorkspaces}
              disabled={isRefreshing || connectionStatus === 'disconnected'}
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </Button>
          </div>
          
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {workspaces.map((workspace) => (
              <Button
                key={workspace.id}
                variant={currentWorkspace?.id === workspace.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => {
                  setCurrentWorkspace(workspace);
                  setPopoverOpen(false);
                  console.log("Switching to workspace:", workspace.name);
                }}
              >
                <div className="flex items-center space-x-2 w-full">
                  <div className="w-3 h-3 bg-[#F76D01] rounded-sm"></div>
                  <span className="truncate">{workspace.name}</span>
                  {isTemporaryWorkspace(workspace) && (
                    <Badge variant="outline" className="ml-auto text-xs bg-amber-50 text-amber-700 border-amber-300">
                      Offline
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
            
            {workspaces.length === 0 && (
              <div className="text-sm text-gray-500 p-2 text-center">
                No workspaces found
              </div>
            )}
          </div>
          
          {realWorkspacesCount < 3 && connectionStatus === 'connected' && (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => {
                  setNewWorkspaceDialogOpen(true);
                  setPopoverOpen(false);
                }}
                disabled={!!error || workspaces.some(w => isTemporaryWorkspace(w))}
              >
                <Plus className="mr-2" size={16} />
                Create New Workspace
              </Button>
            </>
          )}
          
          {(error || connectionStatus === 'disconnected') && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "Connection to database lost. Working in offline mode."}
              </AlertDescription>
            </Alert>
          )}
        </PopoverContent>
      </Popover>
      
      <Dialog open={newWorkspaceDialogOpen} onOpenChange={setNewWorkspaceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Add a new workspace to organize your SEO projects.
              {realWorkspacesCount >= 2 && (
                <div className="mt-1 text-amber-600">
                  Note: You can create up to 3 workspaces.
                </div>
              )}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newWorkspaceName.trim() && !isCreating) {
                    e.preventDefault();
                    handleCreateWorkspace();
                  }
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewWorkspaceDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWorkspace} 
              disabled={isCreating || !newWorkspaceName.trim()}
              className="bg-[#F76D01] hover:bg-[#E25C00]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkspaceSwitcher;
