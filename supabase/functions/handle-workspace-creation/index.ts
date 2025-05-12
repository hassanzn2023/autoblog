
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

// هذه دالة Edge Function في Supabase للتعامل مع إنشاء مساحة العمل
// تضمن إنشاء مساحة عمل موثوقة مع معالجة الأخطاء بشكل مناسب

interface RequestPayload {
  name: string;
  user_id: string;
}

serve(async (req) => {
  try {
    // إنشاء عميل Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );

    // تحليل بيانات الطلب
    const { name, user_id } = await req.json() as RequestPayload;

    // التحقق من صحة المدخلات
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

    // التحقق من وجود المستخدم قبل إنشاء مساحة العمل
    const { data: userExists, error: userError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single();
      
    if (userError || !userExists) {
      console.error("User does not exist:", user_id);
      return new Response(
        JSON.stringify({ 
          error: "User does not exist or you do not have permission to create a workspace" 
        }),
        { 
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // إنشاء مساحة العمل أولاً
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

    // ثم إضافة المستخدم كمالك لمساحة العمل
    const { error: membershipError } = await supabaseClient
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user_id,
        role: 'owner'
      });

    if (membershipError) {
      console.error("Error creating workspace membership:", membershipError);
      // محاولة تنظيف مساحة العمل إذا لم نتمكن من إضافة العضو
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

    // إرجاع استجابة نجاح
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
