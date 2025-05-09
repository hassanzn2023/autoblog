
import React from 'react';
import { useLocation } from 'react-router-dom';
import SEOChecker from "@/components/SEOChecker";

const SEOCheckerPage = () => {
  const location = useLocation();
  const { content, primaryKeyword, secondaryKeywords } = location.state || {};

  return <SEOChecker 
    initialContent={content || ''} 
    initialPrimaryKeyword={primaryKeyword || ''} 
    initialSecondaryKeywords={secondaryKeywords || []} 
  />;
};

export default SEOCheckerPage;
