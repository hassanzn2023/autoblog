
import React from 'react';
import WorkspaceSwitcher from '../WorkspaceSwitcher';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Badge } from '@/components/ui/badge';

const WorkspaceSelector = () => {
  const { error, connectionStatus, currentWorkspace } = useWorkspace();
  
  const isTemporaryWorkspace = currentWorkspace?.id?.toString().startsWith('temp-');
  
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
      
      {connectionStatus === 'disconnected' && !error && (
        <Alert variant="warning" className="mb-2 py-2">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Working offline. Some features are limited.
          </AlertDescription>
        </Alert>
      )}
      
      {isTemporaryWorkspace && !error && (
        <div className="flex items-center mb-2">
          <Badge variant="outline" className="w-full justify-center text-xs py-1 bg-amber-50 text-amber-700 border-amber-300">
            Using temporary workspace
          </Badge>
        </div>
      )}
      
      <WorkspaceSwitcher />
    </div>
  );
};

export default WorkspaceSelector;
