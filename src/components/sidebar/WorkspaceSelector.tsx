
import React from 'react';
import WorkspaceSwitcher from '../WorkspaceSwitcher';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWorkspace } from '@/contexts/WorkspaceContext';

const WorkspaceSelector = () => {
  const { error } = useWorkspace();
  
  return (
    <div className="p-3 border-b border-gray-200">
      {error && (
        <Alert variant="destructive" className="mb-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}
      <WorkspaceSwitcher />
    </div>
  );
};

export default WorkspaceSelector;
