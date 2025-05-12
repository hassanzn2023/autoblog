
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

// This is a Supabase Edge Function that handles workspace creation
// It ensures reliable workspace creation with proper error handling

interface RequestPayload {
  name: string;
  user_id: string;
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );

    // Parse request body
    const { name, user_id } = await req.json() as RequestPayload;

    // Validate inputs
    if (!name || !user_id) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: workspace name and user ID are required" 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // First create the workspace
    const { data: workspace, error: workspaceError } = await supabaseClient
      .from('workspaces')
      .insert({
        name,
        created_by: user_id,
      })
      .select('*')
      .single();

    if (workspaceError) {
      console.error("Error creating workspace:", workspaceError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to create workspace: ${workspaceError.message}` 
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Then add the user as owner to the workspace
    const { error: membershipError } = await supabaseClient
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user_id,
        role: 'owner'
      });

    if (membershipError) {
      console.error("Error creating workspace membership:", membershipError);
      // Attempt to clean up the workspace if we couldn't add the member
      await supabaseClient
        .from('workspaces')
        .delete()
        .eq('id', workspace.id);
        
      return new Response(
        JSON.stringify({ 
          error: `Failed to set workspace ownership: ${membershipError.message}` 
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        workspace: workspace 
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
