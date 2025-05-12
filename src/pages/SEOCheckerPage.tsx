
import React from 'react';
import { useLocation } from 'react-router-dom';
import SEOChecker from "@/components/SEOChecker";
import AuthRequired from '@/components/AuthRequired';

const SEOCheckerPage = () => {
  const location = useLocation();
  const { content, primaryKeyword, secondaryKeywords } = location.state || {};

  // Debugging the passed props
  console.log("SEOCheckerPage received:", {
    contentLength: content ? content.length : 0,
    primaryKeyword,
    secondaryKeywords,
  });

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
