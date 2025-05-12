
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/types/database.types';

// Define types directly from Database type
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Credit = Database['public']['Tables']['credits']['Row'];
type CreditInsert = Database['public']['Tables']['credits']['Insert'];
type ApiUsageInsert = Database['public']['Tables']['api_usage']['Insert'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];

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
          const newSubscription: SubscriptionInsert = {
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          };

          const { error: createError } = await supabase
            .from('subscriptions')
            .insert(newSubscription);
            
          if (createError) throw createError;
          
          // Fetch the newly created subscription
          const { data: newSubData, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (fetchError) throw fetchError;
          setSubscription(newSubData);
        } else {
          throw error;
        }
      } else {
        setSubscription(data);
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
      
      setCredits(data || []);
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
      const creditUsage: CreditInsert = {
        user_id: user.id,
        workspace_id: workspaceId,
        credit_amount: amount,
        transaction_type: 'used',
      };

      const { error: creditError } = await supabase
        .from('credits')
        .insert(creditUsage);
        
      if (creditError) throw creditError;
      
      // Record API usage
      const apiUsage: ApiUsageInsert = {
        user_id: user.id,
        workspace_id: workspaceId,
        api_type: apiType,
        usage_amount: 1,
        credits_consumed: amount,
        operation_type: operation,
      };

      const { error: apiUsageError } = await supabase
        .from('api_usage')
        .insert(apiUsage);
        
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
