
import React, { useState } from 'react';
import WorkspaceSwitcher from '../WorkspaceSwitcher';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const WorkspaceSelector = () => {
  const { createWorkspace, workspaces } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  
  const handleCreateWorkspace = async () => {
    if (workspaces.length >= 3 || !newWorkspaceName.trim()) return;
    
    try {
      setIsCreating(true);
      await createWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="p-3 border-b border-gray-200">
      <WorkspaceSwitcher />
    </div>
  );
};

export default WorkspaceSelector;
