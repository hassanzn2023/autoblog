
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRequiredProps {
  children: ReactNode;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log("AuthRequired - Current auth state:", { user: user?.email, loading, path: location.pathname });

  useEffect(() => {
    // After loading completes, if no user is found, redirect to auth
    if (!loading && !user) {
      console.log("AuthRequired - No user found after loading, redirecting to /auth");
      navigate('/auth', { state: { from: location.pathname } });
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    // Show loading state while checking authentication
    console.log("AuthRequired - Still loading auth state...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F76D01]"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if not authenticated
    console.log("AuthRequired - No user, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  console.log("AuthRequired - User authenticated, showing protected content");
  return <>{children}</>;
};

export default AuthRequired;
