
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/types/database.types';

type ProfileType = Database['public']['Tables']['profiles']['Row'];

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  signOut: () => Promise<void>;
  loading: boolean;
  getProfile: () => Promise<ProfileType | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthProvider initializing...");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Redirect to home page after sign in
          if (currentSession && window.location.pathname === '/auth') {
            console.log('Redirecting to home after sign in');
            navigate('/', { replace: true });
          }
          
          // Fetch profile for signed in user
          if (currentSession?.user) {
            setTimeout(() => {
              fetchProfile(currentSession.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          navigate('/auth', { replace: true });
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Only fetch profile after a small delay to avoid recursive issues
          if (currentSession?.user) {
            setTimeout(() => {
              fetchProfile(currentSession.user.id);
            }, 0);
          } else {
            setProfile(null);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Current session on load:', currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    });

    // Handle auth redirect
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user && window.location.pathname === '/auth') {
        console.log('User detected after auth redirect, navigating to home');
        navigate('/', { replace: true });
      }
    };
    
    handleAuthRedirect();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as string)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        throw error;
      }
      
      console.log('Profile fetched:', data);
      setProfile(data as ProfileType);
      return data as ProfileType;
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
  };

  const getProfile = async () => {
    if (!user) return null;
    
    if (profile) return profile;
    
    const fetchedProfile = await fetchProfile(user.id);
    return fetchedProfile;
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out"
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, signOut, loading, getProfile, refreshProfile }}>
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
