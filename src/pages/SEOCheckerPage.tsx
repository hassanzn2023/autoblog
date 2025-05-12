
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEOChecker from "@/components/SEOChecker";
import AuthRequired from '@/components/AuthRequired';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const SEOCheckerPage = () => {
  const location = useLocation();
  const { content, primaryKeyword, secondaryKeywords } = location.state || {};
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  // Debugging the passed props
  useEffect(() => {
    console.log("SEOCheckerPage received:", {
      contentLength: content ? content.length : 0,
      primaryKeyword,
      secondaryKeywords,
      currentWorkspace: currentWorkspace?.id,
      userAuthenticated: !!user
    });

    if (!content) {
      toast({
        title: "محتوى غير موجود",
        description: "يرجى العودة وإدخال المحتوى أولاً",
        variant: "destructive",
      });
    }
    
    if (!currentWorkspace) {
      toast({
        title: "مساحة العمل غير محددة",
        description: "يرجى التأكد من تحديد مساحة عمل",
        variant: "destructive",
      });
    }
  }, [content, primaryKeyword, secondaryKeywords, currentWorkspace, user]);

  if (!content) {
    return (
      <AuthRequired>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-xl font-semibold mb-4">لم يتم تقديم محتوى للتحليل</h2>
          <p>يرجى العودة إلى الصفحة السابقة وإدخال المحتوى</p>
        </div>
      </AuthRequired>
    );
  }

  return (
    <AuthRequired>
      <SEOChecker 
        initialContent={content || ''} 
        initialPrimaryKeyword={primaryKeyword || ''} 
        initialSecondaryKeywords={secondaryKeywords || []} 
      />
    </AuthRequired>
  );
};

export default SEOCheckerPage;
