import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client'; // افترض أن هذا موجود
import { useAuth } from './AuthContext'; // افترض أن هذا موجود
import { toast } from '@/hooks/use-toast'; // افترض أن هذا موجود
import { Database } from '@/types/database.types'; // افترض أن هذا موجود

type WorkspacesRow = Database['public']['Tables']['workspaces']['Row'];
// type WorkspacesInsert = Database['public']['Tables']['workspaces']['Insert']; // غير مستخدمة مباشرة، لكن لا بأس بتركها
// type WorkspaceMembersRow = Database['public']['Tables']['workspace_members']['Row']; // غير مستخدمة مباشرة، لكن لا بأس بتركها

// احتفظ بالواجهة Interface كما هي إذا كانت دقيقة
interface Workspace {
  id: string;
  name: string;
  created_by: string; // تأكد أن هذا الحقل موجود في البيانات الفعلية أو قم بتعديل الواجهة
  created_at: string;
  updated_at: string;
  settings: Record<string, any> | null; // تأكد أن هذا الحقل موجود في البيانات الفعلية أو قم بتعديل الواجهة
}

interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

interface WorkspaceContextProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  switchWorkspace: (id: string) => void;
  updateWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  getWorkspaceMember: (userId: string, workspaceId: string) => Promise<WorkspaceMember | null>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

async function fetchWorkspaces(userId: string): Promise<Workspace[]> {
  console.log('[fetchWorkspaces] Fetching for userId:', userId);
  try {
    if (!userId) {
      console.warn('[fetchWorkspaces] No user ID provided, returning [].');
      return [];
    }

    const { data: membershipData, error: membershipError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('[fetchWorkspaces] Error fetching workspace memberships:', membershipError);
      toast({
        title: "Error loading workspace memberships",
        description: handleSupabaseError(membershipError, "Failed to load your workspace memberships"),
        variant: "destructive",
      });
      return [];
    }

    if (!membershipData || membershipData.length === 0) {
      console.log('[fetchWorkspaces] No workspace memberships found for user, returning [].');
      return [];
    }

    const workspaceIds = membershipData.map(item => item.workspace_id).filter(Boolean) as string[];

    if (workspaceIds.length === 0) {
      console.log('[fetchWorkspaces] No valid workspace IDs extracted from memberships, returning [].');
      return [];
    }

    const { data: workspacesData, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*') // تأكد أن الأعمدة المختارة تطابق الواجهة Interface Workspace
      .in('id', workspaceIds);

    if (workspacesError) {
      console.error('[fetchWorkspaces] Error fetching workspaces by IDs:', workspacesError);
      toast({
        title: "Error loading workspaces",
        description: handleSupabaseError(workspacesError, "Failed to load your workspaces"),
        variant: "destructive",
      });
      return [];
    }

    if (!workspacesData || workspacesData.length === 0) {
      console.log('[fetchWorkspaces] No workspaces found for the given IDs, returning [].');
      return [];
    }
    
    // التحقق النهائي من أن البيانات هي مصفوفة
    if (!Array.isArray(workspacesData)) {
        console.error('[fetchWorkspaces] CRITICAL: workspacesData from Supabase is not an array!', workspacesData);
        return [];
    }

    console.log('[fetchWorkspaces] Successfully fetched workspaces:', JSON.parse(JSON.stringify(workspacesData)));
    return workspacesData as unknown as Workspace[]; // قد تحتاج إلى تحويل نوع أكثر أمانًا هنا

  } catch (error: any) {
    console.error('[fetchWorkspaces] Unexpected error:', error.message);
    toast({
      title: "Error loading workspaces",
      description: "An unexpected error occurred while loading your workspaces",
      variant: "destructive",
    });
    return [];
  }
}

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    console.log('[WorkspaceProvider] Initializing workspaces state to []');
    return [];
  });
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const updateWorkspacesState = (newWorkspaces: Workspace[] | undefined, caller?: string) => {
    const callSource = caller || 'unknown source';
    console.log(`[WorkspaceProvider] updateWorkspacesState called from: ${callSource}. Attempting to set workspaces. Received:`, newWorkspaces ? JSON.parse(JSON.stringify(newWorkspaces)) : 'undefined');
    
    if (!Array.isArray(newWorkspaces)) {
      console.error(`[WorkspaceProvider] CRITICAL from ${callSource}: Attempted to set workspaces to a NON-ARRAY value:`, newWorkspaces, ". Forcing to [].");
      setWorkspaces([]); // إجراء وقائي
      return;
    }
    setWorkspaces(newWorkspaces);
  };

  useEffect(() => {
    console.log('[WorkspaceProvider] useEffect [user] triggered. User:', user ? user.id : 'null');
    if (user?.id) { // تأكد من وجود user.id
      loadWorkspaces();
    } else {
      console.log('[WorkspaceProvider] No user or no user.id, setting workspaces to [] and loading to false.');
      updateWorkspacesState([], 'useEffect - no user');
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [user]); // الاعتماد على user كائن

  const loadWorkspaces = async () => {
    if (!user?.id) { // تأكد من وجود user.id
      console.log('[WorkspaceProvider] loadWorkspaces - no user or no user.id, returning.');
      updateWorkspacesState([], 'loadWorkspaces - no user guard'); // ضمان أن الحالة مصفوفة
      setLoading(false); // ضمان إيقاف التحميل
      return;
    }
    
    console.log('[WorkspaceProvider] loadWorkspaces - setting loading to true.');
    setLoading(true);
    try {
      const fetchedUserWorkspaces = await fetchWorkspaces(user.id);
      console.log('[WorkspaceProvider] loadWorkspaces - fetched userWorkspaces:', JSON.parse(JSON.stringify(fetchedUserWorkspaces)));
      
      updateWorkspacesState(fetchedUserWorkspaces, 'loadWorkspaces - success'); // fetchWorkspaces يجب أن يعيد مصفوفة
      
      const storedWorkspaceId = localStorage.getItem(`workspace_${user.id}`);
      const currentWorkspacesList = Array.isArray(fetchedUserWorkspaces) ? fetchedUserWorkspaces : [];

      if (storedWorkspaceId && currentWorkspacesList.some(w => w.id === storedWorkspaceId)) {
        setCurrentWorkspace(currentWorkspacesList.find(w => w.id === storedWorkspaceId) || null);
      } else if (currentWorkspacesList.length > 0) {
        setCurrentWorkspace(currentWorkspacesList[0]);
        localStorage.setItem(`workspace_${user.id}`, currentWorkspacesList[0].id);
      } else {
        console.log('[WorkspaceProvider] loadWorkspaces - No workspaces found, attempting to create a default one.');
        const defaultWorkspace = await createWorkspace('Default Workspace'); // createWorkspace يجب أن يتعامل مع تحديث الحالة
        // لا تقم بتحديث الحالة هنا بشكل مباشر إذا كان createWorkspace يقوم بذلك لتجنب التضارب
        if (defaultWorkspace) {
          // setCurrentWorkspace و localStorage يتم تعيينهما داخل createWorkspace
        } else {
           // إذا فشل إنشاء الافتراضي ولم تكن هناك مساحات عمل
           updateWorkspacesState([], 'loadWorkspaces - create default failed & no workspaces');
           setCurrentWorkspace(null);
        }
      }
    } catch (error: any) {
      console.error('[WorkspaceProvider] loadWorkspaces - Catch block error:', error.message);
      updateWorkspacesState([], 'loadWorkspaces - catch block');
      toast({
        title: "Error",
        description: "Failed to load workspaces. Please try again later.",
        variant: "destructive",
      });
    } finally {
      console.log('[WorkspaceProvider] loadWorkspaces - finally block, setting loading to false.');
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!user?.id) {
      console.warn('[WorkspaceProvider] createWorkspace - No user or no user.id, returning null.');
      return null;
    }
    
    console.log('[WorkspaceProvider] createWorkspace - Attempting to create workspace:', name);
    try {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({ name, created_by: user.id }) // تأكد أن created_by مسموح به في RLS وأن user.id ليس undefined
        .select()
        .single();
        
      if (workspaceError) {
        console.error('[WorkspaceProvider] createWorkspace - Supabase error creating workspace:', workspaceError);
        throw workspaceError;
      }
      if (!workspaceData) {
        console.error('[WorkspaceProvider] createWorkspace - No data returned after creating workspace.');
        throw new Error('Failed to create workspace, no data returned.');
      }
      
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({ workspace_id: workspaceData.id, user_id: user.id, role: 'owner' });
      if (memberError) {
        console.error('[WorkspaceProvider] createWorkspace - Supabase error creating workspace member:', memberError);
        // يمكنك اختيار التراجع عن إنشاء مساحة العمل هنا إذا لزم الأمر
        throw memberError;
      }
      
      console.log('[WorkspaceProvider] createWorkspace - Workspace and member created, fetching updated list.');
      // بدلاً من fetchWorkspaces الكامل، يمكن إضافة مساحة العمل الجديدة إلى القائمة الحالية
      // هذا أسرع ويقلل من فرصة حدوث حالات سباق
      const newWorkspace = workspaceData as unknown as Workspace;
      const newWorkspacesList = [...workspaces, newWorkspace];
      updateWorkspacesState(newWorkspacesList, 'createWorkspace - manual update');
      
      setCurrentWorkspace(newWorkspace);
      localStorage.setItem(`workspace_${user.id}`, newWorkspace.id);
      
      toast({ title: "Success", description: `Workspace "${name}" created successfully` });
      console.log('[WorkspaceProvider] createWorkspace - Successfully created and set:', newWorkspace.name);
      return newWorkspace;

    } catch (error: any) {
      console.error('[WorkspaceProvider] createWorkspace - Catch block error:', error.message);
      toast({ title: "Error", description: handleSupabaseError(error, "Failed to create workspace"), variant: "destructive" });
      return null;
    }
  };

  const switchWorkspace = (id: string) => {
    if (!user?.id) return; // حماية إضافية
    console.log(`[WorkspaceProvider] switchWorkspace - Attempting to switch to ID: ${id}. Current workspaces count: ${workspaces.length}`);
    const workspaceToSwitch = workspaces.find(w => w.id === id);
    if (workspaceToSwitch) {
      setCurrentWorkspace(workspaceToSwitch);
      localStorage.setItem(`workspace_${user.id}`, workspaceToSwitch.id);
      toast({ title: "Workspace Changed", description: `Switched to workspace: ${workspaceToSwitch.name}` });
      console.log(`[WorkspaceProvider] switchWorkspace - Switched to: ${workspaceToSwitch.name}`);
    } else {
      console.warn(`[WorkspaceProvider] switchWorkspace - Workspace with ID ${id} not found in current list.`);
      // يمكنك هنا اختيار إعادة تحميل مساحات العمل أو عرض رسالة خطأ
    }
  };

  const updateWorkspace = async (id: string, name: string) => {
    if (!user) return;
    console.log(`[WorkspaceProvider] updateWorkspace - ID: ${id}, New Name: ${name}`);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ name }) // لا حاجة لـ as any إذا كان النوع صحيحًا
        .eq('id', id);
        
      if (error) throw error;
      
      const updatedList = workspaces.map(w => 
        w.id === id ? { ...w, name } : w
      );
      updateWorkspacesState(updatedList, 'updateWorkspace');
      
      if (currentWorkspace && currentWorkspace.id === id) {
        setCurrentWorkspace(prev => prev ? { ...prev, name } : null);
      }
      toast({ title: "Success", description: "Workspace updated successfully" });
    } catch (error: any) {
      console.error('[WorkspaceProvider] updateWorkspace - Error:', error.message);
      toast({ title: "Error", description: error.message || "Failed to update workspace", variant: "destructive" });
    }
  };

  const deleteWorkspace = async (id: string) => {
    if (!user?.id || workspaces.length <= 1) {
      toast({ title: "Cannot Delete", description: "You must have at least one workspace", variant: "destructive" });
      return;
    }
    console.log(`[WorkspaceProvider] deleteWorkspace - ID: ${id}`);
    // ... (الكود الخاص بالتحقق من الصلاحية والحذف من Supabase كما هو)
    // بعد الحذف الناجح من Supabase:
    try {
        // ... (التحقق من الصلاحية والحذف من Supabase) ...
        // مثال:
        // const { error } = await supabase.from('workspaces').delete().eq('id', id);
        // if (error) throw error;

        const remainingWorkspaces = workspaces.filter(w => w.id !== id);
        updateWorkspacesState(remainingWorkspaces, 'deleteWorkspace');
        
        if (currentWorkspace && currentWorkspace.id === id) {
          const newCurrent = remainingWorkspaces.length > 0 ? remainingWorkspaces[0] : null;
          setCurrentWorkspace(newCurrent);
          if (newCurrent) {
            localStorage.setItem(`workspace_${user.id}`, newCurrent.id);
          } else {
            localStorage.removeItem(`workspace_${user.id}`);
          }
        }
        toast({ title: "Success", description: "Workspace deleted successfully" });
    } catch (error: any) {
      console.error('[WorkspaceProvider] deleteWorkspace - Error:', error.message);
      // ... (toast error)
    }
  };

  const getWorkspaceMember = async (userId: string, workspaceId: string): Promise<WorkspaceMember | null> => {
    console.log(`[WorkspaceProvider] getWorkspaceMember - UserID: ${userId}, WorkspaceID: ${workspaceId}`);
    // ... (الكود كما هو مع معالجة الأخطاء)
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          console.log('[WorkspaceProvider] getWorkspaceMember - Member not found.');
          return null;
        }
        throw error;
      }
      return data as unknown as WorkspaceMember;
    } catch (error: any) {
      console.error('[WorkspaceProvider] getWorkspaceMember - Error:', error.message);
      return null;
    }
  };

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspaces, 
        currentWorkspace, 
        loading, 
        createWorkspace, 
        switchWorkspace, 
        updateWorkspace, 
        deleteWorkspace,
        getWorkspaceMember 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    console.error('useWorkspace must be used within a WorkspaceProvider. This is a critical error.');
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  // إضافة تحقق إضافي هنا لمعرفة ما إذا كانت workspaces هي undefined من الـ context مباشرة
  if (context && context.workspaces === undefined) {
      console.warn('[useWorkspace] Context is providing `workspaces` as undefined. Provider issue?');
  }
  return context;
};