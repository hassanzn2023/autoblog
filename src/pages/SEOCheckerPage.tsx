
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEOChecker from "@/components/SEOChecker";
import AuthRequired from '@/components/AuthRequired';
import { toast } from '@/hooks/use-toast';

const SEOCheckerPage = () => {
  const location = useLocation();
  const { content, primaryKeyword, secondaryKeywords } = location.state || {};

  // Debugging the passed props
  useEffect(() => {
    console.log("SEOCheckerPage received:", {
      contentLength: content ? content.length : 0,
      primaryKeyword,
      secondaryKeywords,
    });

    if (!content || content.length === 0) {
      toast({
        title: "Missing Content",
        description: "No content was provided for SEO checking",
        variant: "destructive"
      });
    }

    if (!primaryKeyword) {
      toast({
        title: "Missing Primary Keyword",
        description: "No primary keyword was provided for SEO analysis",
        variant: "warning"
      });
    }
  }, [content, primaryKeyword, secondaryKeywords]);

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
