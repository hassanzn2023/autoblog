import React, { useState, useEffect } from 'react'; // أضفت useEffect كمثال إذا احتجت إليه
import { ChevronsUpDown, Check, Plus } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'; // أضفت CommandList
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const WorkspaceSelector = () => {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, loading } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);

  // طباعة القيم عند كل إعادة عرض
  console.log('[WorkspaceSelector] Rendering. Loading:', loading, 'Workspaces:', workspaces ? JSON.parse(JSON.stringify(workspaces)) : 'undefined', 'Is workspaces array?', Array.isArray(workspaces));
  
  // useEffect لمراقبة التغيرات في workspaces من الـ context
  useEffect(() => {
    console.log('[WorkspaceSelector] useEffect [workspaces, loading] - Workspaces from context updated or loading changed. Loading:', loading, 'Workspaces:', workspaces ? JSON.parse(JSON.stringify(workspaces)) : 'undefined');
    if (!loading && !Array.isArray(workspaces)) {
        console.warn('[WorkspaceSelector] CRITICAL in useEffect: After loading, `workspaces` is NOT an array!', workspaces);
    }
  }, [workspaces, loading]);


  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    setCreating(true);
    try {
      const workspace = await createWorkspace(newWorkspaceName.trim()); // هذه الدالة من الـ context
      if (workspace) {
        setDialogOpen(false);
        setNewWorkspaceName('');
        // toast من الـ context الآن
      }
    } catch (error) { // هذا الـ catch قد لا يُستدعى إذا كان createWorkspace يعالج الأخطاء ويعيد null
      console.error("[WorkspaceSelector] Error calling createWorkspace prop:", error);
      // toast من الـ context الآن
    } finally {
      setCreating(false);
    }
  };

  const handleEmptyWorkspaceClick = () => {
    toast({
      title: "No workspaces available",
      description: "Please create a new workspace using the button below.",
      variant: "default"
    });
    setOpen(false);
  };

  // إضافة شرط التحميل هنا كما ناقشنا سابقًا
  if (loading) {
    console.log('[WorkspaceSelector] In loading state, returning loading button.');
    return (
      <div className="px-4 py-2 border-b border-gray-200">
         <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          disabled={true}
        >
          Loading workspaces...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  // التحقق الدفاعي قبل استخدام workspaces
  // هذا مهم جدًا، حتى لو كان الـ context من المفترض أن يوفر مصفوفة دائمًا
  const workspacesList = Array.isArray(workspaces) ? workspaces : [];
  if (!Array.isArray(workspaces)) {
      console.warn('[WorkspaceSelector] `workspaces` from context is NOT AN ARRAY at render time (after loading check)! Received:', workspaces, '. Using [] instead.');
  }


  return (
    <div className="px-4 py-2 border-b border-gray-200">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            // لا حاجة لـ disabled={loading} هنا بسبب التحقق أعلاه
          >
            {currentWorkspace?.name || "Select workspace"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search workspace..." />
            <CommandList> {/* إضافة CommandList للفصل الصحيح للعناصر */}
              <CommandEmpty>No workspace found.</CommandEmpty>
              {workspacesList.length > 0 ? (
                <CommandGroup>
                  {workspacesList.map((workspace) => {
                    if (!workspace || typeof workspace.id === 'undefined' || typeof workspace.name === 'undefined') {
                        console.warn('[WorkspaceSelector] Invalid workspace object in map:', workspace);
                        return null; // تخطي العناصر غير الصالحة
                    }
                    return (
                      <CommandItem
                        key={workspace.id}
                        onSelect={() => {
                          console.log('[WorkspaceSelector] Switching to workspace ID:', workspace.id);
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
                    );
                  })}
                </CommandGroup>
              ) : (
                <CommandGroup>
                  <CommandItem 
                    disabled 
                    className="cursor-not-allowed opacity-70"
                    onSelect={handleEmptyWorkspaceClick} // تأكد أن هذا لا يسبب مشاكل إذا كانت workspacesList فارغة بسبب خطأ
                  >
                    No workspaces available
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup> {/* مجموعة منفصلة لزر الإنشاء */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <CommandItem 
                      className="cursor-pointer"
                      onSelect={() => { // إضافة onSelect لإغلاق Popover عند فتح Dialog
                          console.log('[WorkspaceSelector] Create New Workspace item selected.');
                          // setOpen(false); // أزل هذا إذا كنت تريد أن يبقى Popover مفتوحًا
                          setDialogOpen(true); // افتح الـ Dialog
                      }}
                    >
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
                        <Label htmlFor="name-ws-selector">Workspace Name</Label> {/* غيرت id لتجنب التضارب المحتمل */}
                        <Input
                          id="name-ws-selector"
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WorkspaceSelector;