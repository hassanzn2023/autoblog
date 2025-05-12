
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const SUPABASE_URL = "https://thsjfdmivfxdmymcpnxf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoc2pmZG1pdmZ4ZG15bWNwbnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDMzODYsImV4cCI6MjA2MjM3OTM4Nn0.arRkm0VVFerJdxplDv_VDpHMl8gxFGQBWDOYsA3QTkw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,  // Enable detecting auth sessions in URL
    flowType: 'pkce',          // Use PKCE flow for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web/2.49.4'
    }
  },
  db: {
    schema: 'public'
  },
  // Add improved retryOptions for better network resilience
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add retry configuration to handle temporary network issues
  // Auto retry 3 times with increasing delay
  fetchOptions: {
    retryCount: 3,
    retryDelay: 1000, // Start with 1s delay and increase exponentially
  }
});

// Helper function to check connection status
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try a simple query that should always work if the connection is active
    const { data, error } = await supabase.from('workspaces').select('id').limit(1);
    return !error;
  } catch (e) {
    console.error("Connection check failed:", e);
    return false;
  }
};

// Helper function to handle Supabase errors in a consistent way
export const handleSupabaseError = (error: any, defaultMessage: string = "An error occurred"): string => {
  console.error("Supabase error:", error);
  
  if (error?.message) {
    if (error.message.includes("JWT expired")) {
      return "Your session has expired. Please log in again.";
    }
    
    if (error.message.includes("Network error")) {
      return "Network connection issue. Please check your internet connection.";
    }
    
    if (error.message.includes("infinite recursion")) {
      return "Database policy error. The team has been notified.";
    }
    
    return error.message;
  }
  
  return defaultMessage;
};
