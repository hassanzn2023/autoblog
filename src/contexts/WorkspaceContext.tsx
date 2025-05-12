
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/types/database.types';

type WorkspacesRow = Database['public']['Tables']['workspaces']['Row'];
type WorkspacesInsert = Database['public']['Tables']['workspaces']['Insert'];
type WorkspaceMembersRow = Database['public']['Tables']['workspace_members']['Row'];

interface Workspace {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, any> | null;
}

interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

interface WorkspaceContextProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  switchWorkspace: (id: string) => void;
  updateWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  getWorkspaceMember: (userId: string, workspaceId: string) => Promise<WorkspaceMember | null>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

// Define the function before using it
async function fetchWorkspaces(userId: string): Promise<Workspace[]> {
  try {
    if (!userId) {
      console.log('No user ID provided to fetchWorkspaces');
      return [];
    }
    
    // Query workspace_members to get workspace IDs where the user is a member
    const { data: membershipData, error: membershipError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching workspace memberships:', membershipError);
      toast({
        title: "Error loading workspace memberships",
        description: handleSupabaseError(membershipError, "Failed to load your workspace memberships"),
        variant: "destructive",
      });
      return [];
    }
    
    if (!membershipData || membershipData.length === 0) {
      console.log('No workspace memberships found for user');
      return [];
    }

    // Extract workspace IDs
    const workspaceIds = membershipData.map(item => {
      if (item && 'workspace_id' in item) {
        return item.workspace_id;
      }
      return null;
    }).filter(Boolean) as string[];

    if (workspaceIds.length === 0) {
      return [];
    }

    // Get the workspaces with those IDs
    const { data: workspacesData, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds);

    if (workspacesError) {
      console.error('Error fetching workspaces:', workspacesError);
      toast({
        title: "Error loading workspaces",
        description: handleSupabaseError(workspacesError, "Failed to load your workspaces"),
        variant: "destructive",
      });
      return [];
    }
    
    if (!workspacesData || workspacesData.length === 0) {
      console.log('No workspaces found with the membership IDs');
      return [];
    }

    return workspacesData as unknown as Workspace[];
  } catch (error: any) {
    console.error('Error fetching workspaces:', error.message);
    toast({
      title: "Error loading workspaces",
      description: "An unexpected error occurred while loading your workspaces",
      variant: "destructive",
    });
    return [];
  }
}

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [user]);

  const loadWorkspaces = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userWorkspaces = await fetchWorkspaces(user.id);
      
      // Always ensure workspaces is an array, even if the fetch failed
      setWorkspaces(Array.isArray(userWorkspaces) ? userWorkspaces : []);
      
      // Get the stored current workspace ID from localStorage
      const storedWorkspaceId = localStorage.getItem(`workspace_${user.id}`);
      
      // Set the current workspace
      if (storedWorkspaceId && userWorkspaces.some(w => w.id === storedWorkspaceId)) {
        // If the stored workspace exists, use it
        setCurrentWorkspace(userWorkspaces.find(w => w.id === storedWorkspaceId) || null);
      } else if (userWorkspaces.length > 0) {
        // Otherwise use the first workspace
        setCurrentWorkspace(userWorkspaces[0]);
        localStorage.setItem(`workspace_${user.id}`, userWorkspaces[0].id);
      } else {
        // No workspaces, create a default one
        console.log('No workspaces found, creating a default workspace');
        const defaultWorkspace = await createWorkspace('Default Workspace');
        if (defaultWorkspace) {
          setWorkspaces([defaultWorkspace]);
          setCurrentWorkspace(defaultWorkspace);
          if (user.id) {
            localStorage.setItem(`workspace_${user.id}`, defaultWorkspace.id);
          }
        } else {
          // If creating default workspace fails, ensure we have an empty array
          setWorkspaces([]);
          setCurrentWorkspace(null);
        }
      }
    } catch (error: any) {
      console.error('Error loading workspaces:', error.message);
      setWorkspaces([]); // Ensure workspaces is always an array
      toast({
        title: "Error",
        description: "Failed to load workspaces. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!user) return null;
    
    try {
      console.log('Creating workspace:', name);
      // Use direct Supabase queries instead of Edge Function
      // First create the workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          created_by: user.id
        })
        .select()
        .single();
        
      if (workspaceError) {
        console.error('Error creating workspace:', workspaceError);
        throw workspaceError;
      }
      
      if (!workspaceData) {
        throw new Error('Failed to create workspace');
      }
      
      // Then add the user as an owner to the workspace
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceData.id,
          user_id: user.id,
          role: 'owner'
        });
        
      if (memberError) {
        console.error('Error creating workspace membership:', memberError);
        throw memberError;
      }
      
      // Refresh workspaces after creation
      const updatedWorkspaces = await fetchWorkspaces(user.id);
      
      // Always ensure workspaces is an array
      setWorkspaces(Array.isArray(updatedWorkspaces) ? updatedWorkspaces : [workspaceData as unknown as Workspace]);
      
      // Find the new workspace in the updated list or use the one we just created
      const newWorkspace = (Array.isArray(updatedWorkspaces) && updatedWorkspaces.find(w => w.id === workspaceData.id)) || 
        (workspaceData as unknown as Workspace);
      
      // Switch to the new workspace
      setCurrentWorkspace(newWorkspace);
      localStorage.setItem(`workspace_${user.id}`, newWorkspace.id);
      
      toast({
        title: "Success",
        description: `Workspace "${name}" created successfully`
      });
      
      return newWorkspace;
    } catch (error: any) {
      console.error('Error creating workspace:', error.message);
      toast({
        title: "Error",
        description: handleSupabaseError(error, "Failed to create workspace"),
        variant: "destructive",
      });
      return null;
    }
  };

  const switchWorkspace = (id: string) => {
    if (!user) return;
    
    const workspace = workspaces.find(w => w.id === id);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem(`workspace_${user.id}`, workspace.id);
      
      toast({
        title: "Workspace Changed",
        description: `Switched to workspace: ${workspace.name}`
      });
    }
  };

  const updateWorkspace = async (id: string, name: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ name } as any)
        .eq('id', id as any);
        
      if (error) throw error;
      
      // Update local state
      const updatedWorkspaces = workspaces.map(w => 
        w.id === id ? { ...w, name } : w
      );
      
      setWorkspaces(updatedWorkspaces);
      
      if (currentWorkspace && currentWorkspace.id === id) {
        setCurrentWorkspace({ ...currentWorkspace, name });
      }
      
      toast({
        title: "Success",
        description: "Workspace updated successfully"
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

  const deleteWorkspace = async (id: string) => {
    if (!user || workspaces.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one workspace",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if the user is the owner
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('user_id', user.id as any)
        .eq('workspace_id', id as any)
        .single();
        
      if (membershipError) throw membershipError;
      
      const membershipRole = membership ? (membership as any).role : null;
      
      if (!membership || membershipRole !== 'owner') {
        toast({
          title: "Permission Denied",
          description: "Only workspace owners can delete workspaces",
          variant: "destructive",
        });
        return;
      }
      
      // Delete the workspace
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id as any);
        
      if (error) throw error;
      
      // Update local state
      const updatedWorkspaces = workspaces.filter(w => w.id !== id);
      setWorkspaces(updatedWorkspaces);
      
      // If the deleted workspace was the current one, switch to another
      if (currentWorkspace && currentWorkspace.id === id) {
        const newCurrentWorkspace = updatedWorkspaces[0];
        setCurrentWorkspace(newCurrentWorkspace);
        localStorage.setItem(`workspace_${user.id}`, newCurrentWorkspace.id);
      }
      
      toast({
        title: "Success",
        description: "Workspace deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting workspace:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to delete workspace",
        variant: "destructive",
      });
    }
  };

  const getWorkspaceMember = async (userId: string, workspaceId: string): Promise<WorkspaceMember | null> => {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_id', userId as any)
        .eq('workspace_id', workspaceId as any)
        .single();
        
      if (error) throw error;
      
      return data as unknown as WorkspaceMember;
    } catch (error: any) {
      console.error('Error fetching workspace member:', error.message);
      return null;
    }
  };

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspaces, 
        currentWorkspace, 
        loading, 
        createWorkspace, 
        switchWorkspace, 
        updateWorkspace, 
        deleteWorkspace,
        getWorkspaceMember 
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
