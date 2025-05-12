
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardOverview from '@/components/DashboardOverview';

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <DashboardOverview />
    </div>
  );
};

export default Index;
