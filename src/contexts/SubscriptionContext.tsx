
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/types/database.types';

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type CreditRow = Database['public']['Tables']['credits']['Row'];
type CreditInsert = Database['public']['Tables']['credits']['Insert'];

interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string | null;
  payment_method: string | null;
  auto_renewal: boolean;
}

interface Credit {
  id: string;
  user_id: string;
  workspace_id: string | null;
  credit_amount: number;
  created_at: string;
  updated_at: string;
  transaction_type: 'initial' | 'purchased' | 'used';
}

interface SubscriptionContextProps {
  subscription: Subscription | null;
  credits: Credit[];
  remainingCredits: number;
  loading: boolean;
  useCredits: (amount: number, workspaceId: string, operation: string, apiType: string) => Promise<boolean>;
  fetchUserCredits: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchUserCredits();
    } else {
      setSubscription(null);
      setCredits([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found, create a new free subscription
          const insertData: SubscriptionInsert = {
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            auto_renewal: false
          };
          
          const { error: createError } = await supabase
            .from('subscriptions')
            .insert([insertData as any]);
            
          if (createError) throw createError;
          
          // Fetch the newly created subscription
          const { data: newSubscription, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (fetchError) throw fetchError;
          
          if (newSubscription) {
            // Use proper type assertion with a null check
            setSubscription(newSubscription as Subscription);
          }
        } else {
          throw error;
        }
      } else if (data) {
        // Use proper type assertion here
        setSubscription(data as Subscription);
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error.message);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Use proper type assertion here to avoid type errors
      setCredits(Array.isArray(data) ? data as Credit[] : []);
    } catch (error: any) {
      console.error('Error fetching credits:', error.message);
      toast({
        title: "Error",
        description: "Failed to load credit information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRemainingCredits = (): number => {
    if (!credits.length) return 0;
    
    const totalCredits = credits
      .filter(c => c.transaction_type !== 'used')
      .reduce((sum, credit) => sum + credit.credit_amount, 0);
      
    const usedCredits = credits
      .filter(c => c.transaction_type === 'used')
      .reduce((sum, credit) => sum + credit.credit_amount, 0);
      
    return totalCredits - usedCredits;
  };

  const useCredits = async (amount: number, workspaceId: string, operation: string, apiType: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const remainingCredits = getRemainingCredits();
      
      if (remainingCredits < amount) {
        toast({
          title: "Insufficient Credits",
          description: `This operation requires ${amount} credits. You have ${remainingCredits} credits left.`,
          variant: "destructive",
        });
        return false;
      }
      
      // Record credit usage
      const creditInsertData: CreditInsert = {
        user_id: user.id,
        workspace_id: workspaceId,
        credit_amount: amount,
        transaction_type: 'used',
      };
      
      const { error: creditError } = await supabase
        .from('credits')
        .insert([creditInsertData as any]);
        
      if (creditError) throw creditError;
      
      // Record API usage
      const { error: apiUsageError } = await supabase
        .from('api_usage')
        .insert([{
          user_id: user.id,
          workspace_id: workspaceId,
          api_type: apiType,
          usage_amount: 1,
          credits_consumed: amount,
          operation_type: operation,
        } as any]);
        
      if (apiUsageError) throw apiUsageError;
      
      // Refresh credits
      await fetchUserCredits();
      
      return true;
    } catch (error: any) {
      console.error('Error using credits:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to process credits",
        variant: "destructive",
      });
      return false;
    }
  };

  const remainingCredits = getRemainingCredits();

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        credits, 
        remainingCredits,
        loading, 
        useCredits,
        fetchUserCredits
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
