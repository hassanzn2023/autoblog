import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Database['public']['Tables']['profiles']['Update']) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const setAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user || null);
      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user.id);
      }
      setLoading(false);
    }
    setAuth();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      handleAuthStateChange(session);
    });
  }, []);

  const handleAuthStateChange = async (session: Session | null) => {
    setSession(session);
    setUser(session?.user || null);

    if (session?.user) {
      await fetchUserProfile(session.user.id);
    } else {
      setProfile(null);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
      }

      setProfile(data as Profile);
      return data as Profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchUserProfile(user.id);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Database['public']['Tables']['profiles']['Update']) => {
    try {
      setLoading(true);
      if (!user?.id) throw new Error("User ID is missing");

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile to get the latest data
      await refreshProfile();
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextProps = {
    session,
    user,
    profile,
    loading,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
