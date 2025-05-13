
import React from 'react';
import { useLocation } from 'react-router-dom';
import SEOChecker from "@/components/SEOChecker";
import AuthRequired from '@/components/AuthRequired';

const SEOCheckerPage = () => {
  const location = useLocation();
  const { content, primaryKeyword, secondaryKeywords } = location.state || {};

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
