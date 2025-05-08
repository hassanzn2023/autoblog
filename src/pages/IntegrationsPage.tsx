
import React from 'react';

const IntegrationsPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Integrations</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Available Integrations</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                G
              </div>
              <div>
                <div className="font-medium">Google Analytics</div>
                <div className="text-sm text-gray-500">Status: Connected</div>
              </div>
            </div>
            <button className="text-[#F76D01] font-medium">Manage</button>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                F
              </div>
              <div>
                <div className="font-medium">Facebook Ads</div>
                <div className="text-sm text-gray-500">Status: Disconnected</div>
              </div>
            </div>
            <button className="text-[#F76D01] font-medium">Connect</button>
          </div>
          
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                S
              </div>
              <div>
                <div className="font-medium">Slack</div>
                <div className="text-sm text-gray-500">Status: Connected</div>
              </div>
            </div>
            <button className="text-[#F76D01] font-medium">Manage</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
