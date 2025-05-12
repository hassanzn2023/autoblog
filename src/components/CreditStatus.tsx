
import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface CreditStatusProps {
  variant?: 'default' | 'compact' | 'large';
  showButton?: boolean;
}

const CreditStatus: React.FC<CreditStatusProps> = ({ 
  variant = 'default',
  showButton = true
}) => {
  const { subscription, remainingCredits, loading } = useSubscription();
  
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading credits...</span>
      </div>
    );
  }
  
  const getStatusColor = () => {
    if (remainingCredits <= 0) return 'text-red-600';
    if (remainingCredits < 20) return 'text-amber-600';
    return 'text-green-600';
  };
  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 text-sm ${getStatusColor()}`}>
        <span>{remainingCredits} credits</span>
      </div>
    );
  }
  
  if (variant === 'large') {
    return (
      <div className="flex flex-col items-center p-4 border rounded-lg bg-white">
        <div className="text-gray-500 mb-1">Available Credits</div>
        <div className={`text-4xl font-bold ${getStatusColor()}`}>{remainingCredits}</div>
        <div className="text-sm text-gray-500 mb-4">
          {subscription?.plan_type === 'free' ? 'Free Plan' : subscription?.plan_type === 'basic' ? 'Basic Plan' : 'Premium Plan'}
        </div>
        {showButton && (
          <Button className="w-full mt-2">
            Get More Credits
          </Button>
        )}
      </div>
    );
  }
  
  // Default variant
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Available Credits</span>
        <span className={`font-medium ${getStatusColor()}`}>{remainingCredits}</span>
      </div>
      {showButton && (
        <Button size="sm" className="h-8">
          <CreditCard className="mr-1 h-4 w-4" /> 
          Get More
        </Button>
      )}
    </div>
  );
};

export default CreditStatus;
