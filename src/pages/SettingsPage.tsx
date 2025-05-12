
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import APIKeyInput from '@/components/APIKeyInput';
import CreditStatus from '@/components/CreditStatus';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('api-keys');
  const { subscription } = useSubscription();
  const { user, profile } = useAuth();
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card className="p-2">
            <Tabs 
              defaultValue={activeTab} 
              orientation="vertical" 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto items-stretch gap-1">
                <TabsTrigger value="api-keys" className="justify-start px-4">
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="subscription" className="justify-start px-4">
                  Subscription & Credits
                </TabsTrigger>
                <TabsTrigger value="profile" className="justify-start px-4">
                  Profile
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>
          
          <div className="mt-6">
            <CreditStatus variant="large" />
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <Card className="p-6">
            <TabsContent value="api-keys" className="space-y-6">
              <h2 className="text-xl font-semibold">API Keys</h2>
              <p className="text-gray-500">
                Configure your API keys for external services. These keys are required for specific functionality.
              </p>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <APIKeyInput 
                  type="openai" 
                  title="OpenAI API Key" 
                  description="Required for AI content generation and keyword analysis"
                  placeholder="Enter your OpenAI API key" 
                />
                
                <APIKeyInput 
                  type="google_lens" 
                  title="Google Lens API Key" 
                  description="Required for image analysis and visual search features"
                  placeholder="Enter your Google Lens API key" 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="subscription" className="space-y-6">
              <h2 className="text-xl font-semibold">Subscription & Credits</h2>
              
              <div className="rounded-lg border p-4 mb-4">
                <h3 className="font-medium mb-2">Current Plan</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg capitalize">
                      {subscription?.plan_type || 'Free'} Plan
                    </div>
                    {subscription?.status === 'active' && (
                      <div className="text-sm text-gray-500">
                        Expires: {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'Never'}
                      </div>
                    )}
                  </div>
                  <div className={`py-1 px-3 rounded-full text-sm ${
                    subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 
                    subscription?.status === 'expired' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription?.status === 'active' ? 'Active' : 
                     subscription?.status === 'expired' ? 'Expired' : 
                     'Unknown'}
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Credit Usage</h3>
                <div className="flex flex-col space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span>Available Credits</span>
                      <span className="font-bold">{useSubscription().remainingCredits}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${Math.min(100, (useSubscription().remainingCredits / 100) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <button className="bg-[#F76D01] text-white py-2 px-6 rounded-md hover:bg-[#E65D00]">
                  Upgrade Plan
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-6">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 mb-2">Email</label>
                  <input 
                    type="email" 
                    readOnly 
                    value={user?.email || ''} 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-2">First Name</label>
                    <input 
                      type="text" 
                      defaultValue={profile?.first_name || ''} 
                      className="w-full p-3 border border-gray-300 rounded-lg" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      defaultValue={profile?.last_name || ''} 
                      className="w-full p-3 border border-gray-300 rounded-lg" 
                    />
                  </div>
                </div>
                
                <button className="bg-[#F76D01] text-white py-2 px-4 rounded-md hover:bg-[#E65D00] mt-4">
                  Save Changes
                </button>
              </div>
            </TabsContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
