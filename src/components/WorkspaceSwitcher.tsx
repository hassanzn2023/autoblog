
import React, { useState } from 'react';
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { DialogTrigger } from './ui/dialog';

interface WorkspaceSwitcherProps {
  className?: string;
}

export function WorkspaceSwitcher({ className }: WorkspaceSwitcherProps) {
  const { workspaces, currentWorkspace, loading, switchWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <Button variant="ghost" className={cn("w-[200px] justify-between", className)}>
        <span className="truncate">Loading workspaces...</span>
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a workspace"
          className={cn("w-[200px] justify-between", className)}
        >
          <span className="truncate">{currentWorkspace?.name || "Select workspace"}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search workspace..." />
            <CommandEmpty>No workspace found.</CommandEmpty>
            {workspaces && workspaces.length > 0 ? (
              <CommandGroup heading="Workspaces">
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    className="text-sm cursor-pointer"
                    onSelect={() => {
                      switchWorkspace(workspace.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{workspace.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup>
                <CommandItem disabled>No workspaces available</CommandItem>
              </CommandGroup>
            )}
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <DialogTrigger asChild>
                <CommandItem 
                  className="cursor-pointer"
                  onSelect={() => setOpen(false)}
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Workspace
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
