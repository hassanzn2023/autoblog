import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
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

type ConnectionStatus = 'checking' | 'connected' | 'disconnected' | 'reconnecting';

interface WorkspaceContextProps {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  loading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);
  const [useTemporaryWorkspace, setUseTemporaryWorkspace] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [reconnectInterval, setReconnectInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Maximum number of retry attempts
  const MAX_RETRY_ATTEMPTS = 3;

  // Define createLocalDefaultWorkspace function to use before fetchWorkspaces
  const createLocalDefaultWorkspace = (): Workspace => {
    // Create a temporary workspace that exists only in memory
    let workspaceName = 'Default Workspace';
    
    if (profile?.first_name) {
      workspaceName = `${profile.first_name}'s Workspace`;
    } else if (user?.email) {
      // Extract name from email (before @)
      const username = user.email.split('@')[0];
      workspaceName = `${username}'s Workspace`;
    } else if (user?.user_metadata?.first_name) {
      workspaceName = `${user.user_metadata.first_name}'s Workspace`;
    }
    
    const workspace: Workspace = {
      id: `temp-${Date.now()}`,
      name: workspaceName,
      created_by: user?.id || 'unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {}
    };
    
    console.log("Created local temporary workspace:", workspace);
    return workspace;
  };

  // Define fetchWorkspaces at the top level before it's used
  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      console.log("Cannot fetch workspaces: No authenticated user");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching workspaces for user:", user.id);
      
      // Create a mock default workspace if we've already tried multiple times
      if (fetchAttempts >= MAX_RETRY_ATTEMPTS) {
        console.log("Maximum fetch attempts reached, using local default workspace");
        const defaultWorkspace = createLocalDefaultWorkspace();
        setWorkspaces([defaultWorkspace]);
        setCurrentWorkspace(defaultWorkspace);
        setLoading(false);
        setUseTemporaryWorkspace(true);
        setConnectionStatus('disconnected');
        setError("Unable to connect to the database. Using a temporary workspace.");
        toast({
          title: "Connection Issue",
          description: "We're having trouble connecting to the database. You can continue with limited functionality.",
          variant: "destructive",
        });
        return;
      }
      
      // Increment fetch attempts
      setFetchAttempts(prev => prev + 1);
      
      // Try to check connection first
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error("Database connection failed");
      }
      
      // Try to fetch workspaces directly first
      const { data: directWorkspaces, error: directError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: true });
      
      if (!directError && directWorkspaces && directWorkspaces.length > 0) {
        console.log("Direct workspaces fetched:", directWorkspaces.length);
        
        // Use proper type assertion here
        const typedWorkspaces = Array.isArray(directWorkspaces) ? directWorkspaces as Workspace[] : [];
        setWorkspaces(typedWorkspaces);
        
        // If there's no current workspace selected, select the first one
        if (!currentWorkspace && typedWorkspaces.length > 0) {
          console.log("Setting default workspace:", typedWorkspaces[0]?.name);
          setCurrentWorkspace(typedWorkspaces[0]);
        } else if (currentWorkspace) {
          // Ensure the current workspace still exists in the fetched workspaces
          const currentExists = typedWorkspaces.some(w => w.id === currentWorkspace.id);
          if (!currentExists && typedWorkspaces.length > 0) {
            console.log("Current workspace no longer exists, selecting first workspace");
            setCurrentWorkspace(typedWorkspaces[0]);
          }
        }
        
        // Reset fetch attempts on success
        setFetchAttempts(0);
        setUseTemporaryWorkspace(false);
        setConnectionStatus('connected');
        setLoading(false);
        return;
      }
      
      // If direct fetch didn't work, try to fetch through memberships
      try {
        // Now try to get all workspace memberships for this user
        const { data: memberships, error: membershipError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id);

        if (membershipError) {
          throw membershipError;
        }
        
        console.log("Memberships found:", memberships?.length || 0);
        
        if (memberships && memberships.length > 0) {
          // Get all workspace IDs from memberships
          const workspaceIds = memberships.map(membership => membership.workspace_id);
          
          // Fetch workspace details
          const { data: workspacesData, error: workspacesError } = await supabase
            .from('workspaces')
            .select('*')
            .in('id', workspaceIds)
            .order('created_at', { ascending: true });
          
          if (workspacesError) {
            throw workspacesError;
          }
          
          console.log("Workspaces fetched:", workspacesData?.length || 0);
          
          if (workspacesData && workspacesData.length > 0) {
            // Use proper type assertion here
            const typedWorkspaces = Array.isArray(workspacesData) ? workspacesData as Workspace[] : [];
            setWorkspaces(typedWorkspaces);
            
            // If there's no current workspace selected, select the first one
            if (!currentWorkspace && typedWorkspaces.length > 0) {
              console.log("Setting default workspace:", typedWorkspaces[0]?.name);
              setCurrentWorkspace(typedWorkspaces[0]);
            } else if (currentWorkspace) {
              // Ensure the current workspace still exists in the fetched workspaces
              const currentExists = typedWorkspaces.some(w => w.id === currentWorkspace.id);
              if (!currentExists && typedWorkspaces.length > 0) {
                console.log("Current workspace no longer exists, selecting first workspace");
                setCurrentWorkspace(typedWorkspaces[0]);
              }
            }
            
            // Reset fetch attempts on success
            setFetchAttempts(0);
            setUseTemporaryWorkspace(false);
            setConnectionStatus('connected');
            setLoading(false);
            return;
          }
        }
        
        // No workspaces or memberships found, create a default one
        await createDefaultWorkspace();
        
      } catch (innerError: any) {
        console.error("Failed during membership check:", innerError.message);
        throw innerError;
      }
      
    } catch (error: any) {
      console.error('Error fetching workspaces:', error.message);
      
      // Try to create a default workspace if there was an error
      try {
        await createDefaultWorkspace();
      } catch (innerError: any) {
        console.error("Failed to create default workspace after fetch error:", innerError.message);
        setConnectionStatus('disconnected');
        setError(`Connection Error: ${error.message}`);
        
        // Create a local workspace as last resort
        const defaultWorkspace = createLocalDefaultWorkspace();
        setWorkspaces([defaultWorkspace]);
        setCurrentWorkspace(defaultWorkspace);
        setUseTemporaryWorkspace(true);
        
        toast({
          title: "Connection Error",
          description: "We couldn't connect to the database. Using a temporary workspace.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, currentWorkspace, fetchAttempts, MAX_RETRY_ATTEMPTS]);

  // Check connection status periodically
  useEffect(() => {
    const checkConnection = async () => {
      if (user) {
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          if (connectionStatus === 'disconnected' || connectionStatus === 'reconnecting') {
            console.log("Connection restored, refreshing workspaces");
            setConnectionStatus('connected');
            fetchWorkspaces();
            toast({
              title: "Connection Restored",
              description: "You are now back online.",
              variant: "success",
            });
          } else {
            setConnectionStatus('connected');
          }
        } else {
          if (connectionStatus === 'connected' || connectionStatus === 'checking') {
            console.log("Connection lost");
            setConnectionStatus('disconnected');
            toast({
              title: "Connection Lost",
              description: "You are now working offline. Some features will be limited.",
              variant: "warning",
            });
            
            // Create a temporary workspace if needed
            if (!useTemporaryWorkspace && workspaces.length === 0) {
              const defaultWorkspace = createLocalDefaultWorkspace();
              setWorkspaces([defaultWorkspace]);
              setCurrentWorkspace(defaultWorkspace);
              setUseTemporaryWorkspace(true);
            }
          } else {
            setConnectionStatus('reconnecting');
          }
        }
      }
    };
    
    // Start periodic check
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    // Initial check
    checkConnection();
    
    return () => {
      clearInterval(interval);
      if (reconnectInterval) clearInterval(reconnectInterval);
    };
  }, [connectionStatus, user, useTemporaryWorkspace, workspaces.length, fetchWorkspaces]);

  // Clear error when user changes
  useEffect(() => {
    if (user) {
      setError(null);
    }
  }, [user]);

  // Main effect to fetch workspaces when user changes
  useEffect(() => {
    if (user) {
      console.log("User is authenticated, fetching workspaces");
      fetchWorkspaces();
    } else {
      console.log("No user is authenticated, clearing workspace data");
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      setError(null);
      setUseTemporaryWorkspace(false);
      setConnectionStatus('checking');
    }
  }, [user, fetchWorkspaces]);

  const createDefaultWorkspace = async () => {
    if (!user) return;
    
    try {
      // Generate appropriate workspace name from profile or user email
      let defaultName = 'Default Workspace';
      
      if (profile?.first_name && profile?.last_name) {
        defaultName = `${profile.first_name} ${profile.last_name}'s Workspace`;
      } else if (profile?.first_name) {
        defaultName = `${profile.first_name}'s Workspace`;
      } else if (user.email) {
        const username = user.email.split('@')[0];
        defaultName = `${username}'s Workspace`;
      } else if (user.user_metadata?.first_name) {
        defaultName = `${user.user_metadata.first_name}'s Workspace`;
      }
      
      console.log("Creating default workspace with name:", defaultName);
      
      // First try to use the edge function for creating workspaces
      try {
        // Call our edge function to create the workspace (more reliable than direct DB call)
        const response = await supabase.functions.invoke('handle-workspace-creation', {
          body: {
            name: defaultName,
            user_id: user.id
          }
        });
        
        if (response.error) {
          throw new Error(response.error as string);
        }
        
        if (!response.data || !response.data.workspace) {
          throw new Error("No workspace returned after creation");
        }
        
        console.log("Workspace created via edge function:", response.data.workspace);
        
        // Use proper type assertion here
        const workspace = response.data.workspace as Workspace;
        setWorkspaces([workspace]);
        setCurrentWorkspace(workspace);
        setError(null);
        setUseTemporaryWorkspace(false);
        setConnectionStatus('connected');
        
        // Reset fetch attempts on success
        setFetchAttempts(0);
        return;
      } catch (functionError) {
        console.error("Error using edge function, falling back to direct method:", functionError);
        // Continue to fallback method
      }
      
      // Fallback to direct RPC call
      const { data, error } = await supabase
        .rpc('create_workspace_with_owner', { 
          workspace_name: defaultName, 
          user_id: user.id 
        });
        
      if (error) {
        console.error("Error creating workspace via function:", error.message);
        throw error;
      }
      
      if (!data) {
        throw new Error("No workspace ID returned after creation");
      }
      
      console.log("Workspace created with ID:", data);
      
      // Fetch the newly created workspace
      const { data: workspaceData, error: fetchError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', data)
        .single();
        
      if (fetchError) {
        console.error("Error fetching new workspace:", fetchError.message);
        throw fetchError;
      }
      
      if (workspaceData) {
        // Use proper type assertion here
        const workspace = workspaceData as Workspace;
        setWorkspaces([workspace]);
        setCurrentWorkspace(workspace);
        setError(null);
        setUseTemporaryWorkspace(false);
        setConnectionStatus('connected');
      }
      
      // Reset fetch attempts on success
      setFetchAttempts(0);
      
    } catch (error: any) {
      console.error("Error creating default workspace:", error.message);
      setError(`Failed to create workspace: ${error.message}`);
      setConnectionStatus('disconnected');
      
      // If all else fails, create a local workspace
      const defaultWorkspace = createLocalDefaultWorkspace();
      setWorkspaces([defaultWorkspace]);
      setCurrentWorkspace(defaultWorkspace);
      setUseTemporaryWorkspace(true);
      
      toast({
        title: "Error",
        description: "Failed to create default workspace. Using a temporary one instead.",
        variant: "destructive",
      });
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!user) {
      console.log("Cannot create workspace: No authenticated user");
      toast({
        title: "Error",
        description: "You need to be signed in to create a workspace",
        variant: "destructive",
      });
      return null;
    }
    
    if (useTemporaryWorkspace || connectionStatus !== 'connected') {
      toast({
        title: "Database Connection Error",
        description: "Cannot create a new workspace while offline. Please try again later.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      console.log("Creating new workspace with name:", name);
      
      // First check if user has reached the workspace limit
      if (workspaces.filter(w => !w.id.toString().startsWith('temp-')).length >= 3) {
        toast({
          title: "Limit Reached",
          description: "You can only create up to 3 workspaces",
          variant: "destructive",
        });
        return null;
      }

      // First try to use the edge function for creating workspaces
      try {
        const response = await supabase.functions.invoke('handle-workspace-creation', {
          body: {
            name: name,
            user_id: user.id
          }
        });
        
        if (response.error) {
          throw new Error(response.error as string);
        }
        
        if (!response.data || !response.data.workspace) {
          throw new Error("No workspace returned after creation");
        }
        
        console.log("Workspace created via edge function:", response.data.workspace);
        
        // Add the new workspace to the local state
        const newWorkspace = response.data.workspace as Workspace;
        const updatedWorkspaces = [...workspaces, newWorkspace];
        setWorkspaces(updatedWorkspaces);
        setCurrentWorkspace(newWorkspace);
        
        toast({
          title: "Success",
          description: "Workspace created successfully",
          variant: "success",
        });
        
        return newWorkspace;
      } catch (functionError) {
        console.error("Error using edge function, falling back to direct method:", functionError);
        // Continue to fallback method
      }

      // Fallback to direct RPC call
      const { data: workspaceId, error: rpcError } = await supabase
        .rpc('create_workspace_with_owner', { 
          workspace_name: name, 
          user_id: user.id 
        });
        
      if (rpcError) {
        console.error("Error creating workspace via function:", rpcError.message);
        throw rpcError;
      }
      
      if (!workspaceId) {
        throw new Error("No workspace ID returned after creation");
      }
      
      console.log("Workspace created with ID:", workspaceId);
      
      // Fetch the newly created workspace
      const { data: workspaceData, error: fetchError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching new workspace:", fetchError.message);
        throw fetchError;
      }
      
      if (!workspaceData) {
        throw new Error("Could not fetch the newly created workspace");
      }
      
      // Add the new workspace to the local state
      const workspace = workspaceData as Workspace;
      const updatedWorkspaces = [...workspaces, workspace];
      setWorkspaces(updatedWorkspaces);
      setCurrentWorkspace(workspace);
      
      toast({
        title: "Success",
        description: "Workspace created successfully",
        variant: "success",
      });
      
      return workspace;
    } catch (error: any) {
      console.error('Error creating workspace:', error.message);
      setError(`Failed to create workspace: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to create workspace",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    if (!user) {
      console.log("Cannot update workspace: No authenticated user");
      return;
    }
    
    if (useTemporaryWorkspace || id.toString().startsWith('temp-') || connectionStatus !== 'connected') {
      toast({
        title: "Database Connection Error",
        description: "Cannot update a workspace while offline. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Updating workspace:", id, data);
      
      const { error } = await supabase
        .from('workspaces')
        .update(data as any)
        .eq('id', id);
        
      if (error) {
        console.error("Error updating workspace:", error.message);
        throw error;
      }
      
      // Update local state
      const updatedWorkspaces = workspaces.map(w => 
        w.id === id ? { ...w, ...data } : w
      );
      setWorkspaces(updatedWorkspaces);
      
      // Update current workspace if it's the one being updated
      if (currentWorkspace && currentWorkspace.id === id) {
        setCurrentWorkspace({ ...currentWorkspace, ...data });
      }
      
      toast({
        title: "Success",
        description: "Workspace updated successfully",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error updating workspace:', error.message);
      setError(`Failed to update workspace: ${error.message}`);
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
        loading,
        error,
        connectionStatus
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
