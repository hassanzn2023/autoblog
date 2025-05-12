
import React from 'react';
import SimpleOptimizationForm from "@/components/SimpleOptimizationForm";
import { useAuth } from '@/contexts/AuthContext';
import AuthRequired from '@/components/AuthRequired';

const NormalModePage = () => {
  const { user } = useAuth();
  
  return (
    <AuthRequired>
      <SimpleOptimizationForm />
    </AuthRequired>
  );
};

export default NormalModePage;
