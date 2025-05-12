
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

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم مساحة العمل",
        variant: "destructive",
      });
      return;
    }
    
    const newWorkspace = await createWorkspace(newWorkspaceName);
    if (newWorkspace) {
      setCurrentWorkspace(newWorkspace);
      setNewWorkspaceDialogOpen(false);
      setNewWorkspaceName('');
      setPopoverOpen(false);
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
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-4 h-4 bg-[#F76D01] rounded-sm"></div>
              <span className="truncate">{currentWorkspace?.name || 'اختر مساحة العمل'}</span>
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
                className="w-full justify-start text-right"
                onClick={() => {
                  setCurrentWorkspace(workspace);
                  setPopoverOpen(false);
                }}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
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
                className="w-full justify-start text-right"
                onClick={() => {
                  setNewWorkspaceDialogOpen(true);
                  setPopoverOpen(false);
                }}
              >
                <Plus className="mr-2 rtl:ml-2 rtl:mr-0" size={16} />
                إنشاء مساحة عمل جديدة
              </Button>
            </>
          )}
        </PopoverContent>
      </Popover>
      
      <Dialog open={newWorkspaceDialogOpen} onOpenChange={setNewWorkspaceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إنشاء مساحة عمل جديدة</DialogTitle>
            <DialogDescription>
              أضف مساحة عمل جديدة لتنظيم مشاريع SEO الخاصة بك.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">اسم مساحة العمل</Label>
              <Input
                id="workspace-name"
                placeholder="أدخل اسم مساحة العمل"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewWorkspaceDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateWorkspace}>
              إنشاء مساحة العمل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkspaceSwitcher;
