
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import CreditStatus from './CreditStatus';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CreditCard, Settings, Zap } from 'lucide-react';

const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const { subscription } = useSubscription();
  const { currentWorkspace } = useWorkspace();
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {profile ? `Welcome back, ${profile.first_name || 'User'}` : 'Welcome to SEO Platform'}
            </h2>
            <p className="text-gray-600">
              Current workspace: {currentWorkspace?.name || 'Default'}
            </p>
          </div>
          <CreditStatus />
        </div>
      </div>
      
      {/* Subscription status */}
      {subscription?.status === 'expired' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Subscription Expired</h3>
              <div className="mt-1 text-sm text-red-700">
                Your subscription has expired. Upgrade now to continue using all features.
              </div>
              <div className="mt-3">
                <Button variant="destructive" size="sm">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Renew Subscription
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">SEO Checker</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Analyze content and get optimization recommendations.
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/seo-checker">
                <Zap className="mr-2 h-4 w-4" />
                Start Analysis
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">API Settings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Configure your OpenAI and Google Lens API keys.
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configure Keys
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Free Trial</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {subscription?.expires_at ? (
              <>Your free trial ends on {new Date(subscription.expires_at).toLocaleDateString()}</>
            ) : (
              <>Upgrade to access all premium features</>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/settings?tab=subscription">
                <Calendar className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
