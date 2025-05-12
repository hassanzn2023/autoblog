
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/types/database.types';

type ApiKeysRow = Database['public']['Tables']['api_keys']['Row'];
type ApiKeysInsert = Database['public']['Tables']['api_keys']['Insert'];
type ApiKeysUpdate = Database['public']['Tables']['api_keys']['Update'];

interface APIKey {
  id: string;
  user_id: string;
  workspace_id: string;
  api_type: 'openai' | 'google_lens';
  api_key: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface APIKeysContextProps {
  apiKeys: APIKey[];
  loading: boolean;
  saveAPIKey: (type: 'openai' | 'google_lens', key: string) => Promise<void>;
  updateAPIKey: (id: string, key: string, active: boolean) => Promise<void>;
  deleteAPIKey: (id: string) => Promise<void>;
  getAPIKey: (type: 'openai' | 'google_lens') => APIKey | null;
}

const APIKeysContext = createContext<APIKeysContextProps | undefined>(undefined);

export const APIKeysProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user && currentWorkspace) {
      fetchAPIKeys();
    } else {
      setApiKeys([]);
      setLoading(false);
    }
  }, [user, currentWorkspace]);

  const fetchAPIKeys = async () => {
    if (!user || !currentWorkspace) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id);
        
      if (error) throw error;
      
      // Use proper type assertion here with a null check
      setApiKeys(Array.isArray(data) ? data as APIKey[] : []);
    } catch (error: any) {
      console.error('Error fetching API keys:', error.message);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAPIKey = async (type: 'openai' | 'google_lens', key: string) => {
    if (!user || !currentWorkspace) return;
    
    try {
      // Check if key already exists for this type and workspace
      const existingKey = apiKeys.find(k => k.api_type === type && k.workspace_id === currentWorkspace.id);
      
      if (existingKey) {
        // Update existing key
        const updateData: ApiKeysUpdate = {
          api_key: key,
          is_active: true,
        };
        
        const { error } = await supabase
          .from('api_keys')
          .update(updateData as any)
          .eq('id', existingKey.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Create new key
        const insertData: ApiKeysInsert = {
          user_id: user.id,
          workspace_id: currentWorkspace.id,
          api_type: type,
          api_key: key,
          is_active: true,
        };
        
        // When inserting, wrap the data in an array
        const { error } = await supabase
          .from('api_keys')
          .insert([insertData as any]);
          
        if (error) throw error;
      }
      
      await fetchAPIKeys();
      
      toast({
        title: "Success",
        description: `${type.toUpperCase()} API key saved successfully`,
      });
    } catch (error: any) {
      console.error('Error saving API key:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to save API key",
        variant: "destructive",
      });
    }
  };

  const updateAPIKey = async (id: string, key: string, active: boolean) => {
    if (!user || !currentWorkspace) return;
    
    try {
      const updateData: ApiKeysUpdate = {
        api_key: key,
        is_active: active,
      };
      
      const { error } = await supabase
        .from('api_keys')
        .update(updateData as any)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      await fetchAPIKeys();
      
      toast({
        title: "Success",
        description: "API key updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating API key:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to update API key",
        variant: "destructive",
      });
    }
  };

  const deleteAPIKey = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      await fetchAPIKeys();
      
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting API key:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const getAPIKey = (type: 'openai' | 'google_lens'): APIKey | null => {
    if (!currentWorkspace) return null;
    return apiKeys.find(k => k.api_type === type && k.workspace_id === currentWorkspace.id) || null;
  };

  return (
    <APIKeysContext.Provider 
      value={{ 
        apiKeys, 
        loading, 
        saveAPIKey, 
        updateAPIKey, 
        deleteAPIKey, 
        getAPIKey 
      }}
    >
      {children}
    </APIKeysContext.Provider>
  );
};

export const useAPIKeys = () => {
  const context = useContext(APIKeysContext);
  if (context === undefined) {
    throw new Error('useAPIKeys must be used within an APIKeysProvider');
  }
  return context;
};
