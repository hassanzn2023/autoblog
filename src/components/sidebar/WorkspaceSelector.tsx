
import React, { useState } from 'react';
import { ChevronsUpDown, Check, Plus } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const WorkspaceSelector = () => {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, loading } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    setCreating(true);
    try {
      const workspace = await createWorkspace(newWorkspaceName.trim());
      if (workspace) {
        setDialogOpen(false);
        setNewWorkspaceName('');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-4 py-2 border-b border-gray-200">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : currentWorkspace?.name || "Select workspace"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search workspace..." />
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup>
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() => {
                    switchWorkspace(workspace.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {workspace.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <CommandItem className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Workspace
                  </CommandItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Workspace Name</Label>
                      <Input
                        id="name"
                        placeholder="My Workspace"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateWorkspace} 
                      disabled={creating || !newWorkspaceName.trim()}
                      className="w-full"
                    >
                      {creating ? "Creating..." : "Create Workspace"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WorkspaceSelector;
