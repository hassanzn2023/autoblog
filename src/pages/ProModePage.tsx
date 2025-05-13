
import React from 'react';
import ProModeForm from "@/components/ProModeForm";
import AuthRequired from '@/components/AuthRequired';

const ProModePage = () => {
  return (
    <AuthRequired>
      <ProModeForm />
    </AuthRequired>
  );
};

export default ProModePage;
