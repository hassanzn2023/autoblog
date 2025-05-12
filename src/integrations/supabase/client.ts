
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const SUPABASE_URL = "https://thsjfdmivfxdmymcpnxf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoc2pmZG1pdmZ4ZG15bWNwbnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDMzODYsImV4cCI6MjA2MjM3OTM4Nn0.arRkm0VVFerJdxplDv_VDpHMl8gxFGQBWDOYsA3QTkw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    cookieOptions: {
      name: 'sb-auth-token',
      lifetime: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: window.location.protocol === 'https:'
    }
  }
});
