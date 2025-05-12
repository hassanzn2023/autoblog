
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardOverview from '@/components/DashboardOverview';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  console.log("Index Page - Auth state:", { user: user?.email, loading, profileExists: !!profile });
  
  useEffect(() => {
    // If loading is complete and no user is found, redirect to auth page
    if (!loading && !user) {
      console.log("Index Page - No user after loading, redirecting to /auth");
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log("Index Page - Still loading auth state...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F76D01]"></div>
      </div>
    );
  }

  // User is authenticated, show the dashboard
  console.log("Index Page - User authenticated, showing dashboard");
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <DashboardOverview />
    </div>
  );
};

export default Index;
