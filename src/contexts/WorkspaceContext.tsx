
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface Workspace {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  settings: any;
}

interface WorkspaceContextProps {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [user]);

  const fetchWorkspaces = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Directly query workspaces for the user, avoiding nested/recursive queries
      const { data: memberships, error: membershipError } = await supabase
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;
      
      if (memberships && memberships.length > 0) {
        // Get all workspace IDs from memberships
        const workspaceIds = memberships.map(membership => membership.workspace_id);
        
        // Fetch workspace details
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds);
        
        if (workspacesError) throw workspacesError;
        
        if (workspacesData && workspacesData.length > 0) {
          setWorkspaces(workspacesData);
          
          if (!currentWorkspace) {
            setCurrentWorkspace(workspacesData[0]);
          }
        }
      } else {
        // If no workspaces found, create a default one
        if (user) {
          const defaultName = profile?.first_name 
            ? `${profile.first_name}'s Workspace` 
            : 'Default Workspace';
            
          const newWorkspace = await createWorkspace(defaultName);
          if (newWorkspace) {
            setWorkspaces([newWorkspace]);
            setCurrentWorkspace(newWorkspace);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching workspaces:', error.message);
      toast({
        title: "Error",
        description: "Failed to load workspaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!user) return null;
    
    try {
      // First check if user has reached the workspace limit
      if (workspaces.length >= 3) {
        toast({
          title: "Limit Reached",
          description: "You can only create up to 3 workspaces",
          variant: "destructive",
        });
        return null;
      }

      // Create the workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([{ name, created_by: user.id }])
        .select()
        .single();
        
      if (workspaceError) throw workspaceError;
      
      // Insert the creator as the owner of the workspace
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([{ 
          workspace_id: workspaceData.id, 
          user_id: user.id, 
          role: 'owner' 
        }]);
      
      if (memberError) throw memberError;
      
      // Refresh the workspace list
      await fetchWorkspaces();
      
      toast({
        title: "Success",
        description: "Workspace created successfully",
      });
      
      return workspaceData;
    } catch (error: any) {
      console.error('Error creating workspace:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to create workspace",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('workspaces')
        .update(data)
        .eq('id', id);
        
      if (error) throw error;
      
      await fetchWorkspaces();
      
      toast({
        title: "Success",
        description: "Workspace updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating workspace:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to update workspace",
        variant: "destructive",
      });
    }
  };

  return (
    <WorkspaceContext.Provider 
      value={{ 
        currentWorkspace, 
        workspaces, 
        setCurrentWorkspace, 
        createWorkspace, 
        updateWorkspace,
        fetchWorkspaces,
        loading 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
