
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SEOChecker from "@/components/SEOChecker";
import AuthRequired from '@/components/AuthRequired';
import { toast } from '@/hooks/use-toast';

const SEOCheckerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { content, primaryKeyword, secondaryKeywords } = location.state || {};

  // Debugging the passed props
  console.log("SEOCheckerPage received:", {
    contentLength: content ? content.length : 0,
    primaryKeyword,
    secondaryKeywords,
  });

  // Validate that we have the required data
  useEffect(() => {
    if (!content) {
      toast({
        title: "Missing Content",
        description: "Please complete the content section before accessing the SEO checker.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [content, navigate]);

  return (
    <AuthRequired>
      {content ? (
        <SEOChecker 
          initialContent={content || ''} 
          initialPrimaryKeyword={primaryKeyword || ''} 
          initialSecondaryKeywords={secondaryKeywords || []} 
        />
      ) : (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Content Required</h2>
          <p>Please create and confirm your content before accessing the SEO checker.</p>
        </div>
      )}
    </AuthRequired>
  );
};

export default SEOCheckerPage;
