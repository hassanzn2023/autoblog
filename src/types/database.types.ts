
export interface DatabaseTypes {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      }
      workspaces: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          settings: Record<string, any> | null;
        }
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          settings?: Record<string, any> | null;
        }
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          settings?: Record<string, any> | null;
        }
      }
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
        }
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at?: string;
        }
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        }
      }
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          api_type: 'openai' | 'google_lens';
          api_key: string;
          is_active: boolean;
          created_at: string;
          last_used_at: string | null;
        }
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          api_type: 'openai' | 'google_lens';
          api_key: string;
          is_active?: boolean;
          created_at?: string;
          last_used_at?: string | null;
        }
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          api_type?: 'openai' | 'google_lens';
          api_key?: string;
          is_active?: boolean;
          created_at?: string;
          last_used_at?: string | null;
        }
      }
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: 'free' | 'basic' | 'premium';
          status: 'active' | 'expired' | 'cancelled';
          starts_at: string;
          expires_at: string | null;
          payment_method: string | null;
          auto_renewal: boolean;
        }
        Insert: {
          id?: string;
          user_id: string;
          plan_type: 'free' | 'basic' | 'premium';
          status: 'active' | 'expired' | 'cancelled';
          starts_at?: string;
          expires_at?: string | null;
          payment_method?: string | null;
          auto_renewal?: boolean;
        }
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: 'free' | 'basic' | 'premium';
          status?: 'active' | 'expired' | 'cancelled';
          starts_at?: string;
          expires_at?: string | null;
          payment_method?: string | null;
          auto_renewal?: boolean;
        }
      }
      credits: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          credit_amount: number;
          created_at: string;
          updated_at: string;
          transaction_type: 'initial' | 'purchased' | 'used';
        }
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          credit_amount: number;
          created_at?: string;
          updated_at?: string;
          transaction_type: 'initial' | 'purchased' | 'used';
        }
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          credit_amount?: number;
          created_at?: string;
          updated_at?: string;
          transaction_type?: 'initial' | 'purchased' | 'used';
        }
      }
      api_usage: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          api_type: string;
          usage_amount: number;
          credits_consumed: number;
          timestamp: string;
          operation_type: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          api_type: string;
          usage_amount: number;
          credits_consumed: number;
          timestamp?: string;
          operation_type: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          api_type?: string;
          usage_amount?: number;
          credits_consumed?: number;
          timestamp?: string;
          operation_type?: string;
        }
      }
    }
  }
}

// Helper function to cast tables and handle TypeScript errors
export const typedSupabaseQuery = <T extends keyof DatabaseTypes['public']['Tables']>(
  tableName: T
): T => {
  return tableName;
};
