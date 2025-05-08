
import React from 'react';
import { Key, Copy } from 'lucide-react';

const ApiDashboardPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">API Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-start gap-4 mb-6">
          <Key className="text-[#F76D01] h-10 w-10" />
          <div>
            <h2 className="text-xl font-semibold">Your API Keys</h2>
            <p className="text-gray-600 mt-2">
              Use these keys to integrate our services with your applications.
              Keep your secret keys confidential and never share them publicly.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Production Key</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-2 rounded flex-1 font-mono text-sm">
                sk_prod_xxxxxxxxxxxxxxxxxxxx
              </div>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Copy className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Development Key</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Testing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-2 rounded flex-1 font-mono text-sm">
                sk_test_xxxxxxxxxxxxxxxxxxxx
              </div>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Copy className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="bg-[#F76D01] text-white py-2 px-4 rounded-md hover:bg-[#E65D00] mr-3">Generate New Key</button>
          <button className="border border-[#F76D01] text-[#F76D01] py-2 px-4 rounded-md hover:bg-orange-50">Revoke Key</button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">API Usage</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Current Period Usage</span>
              <span className="font-medium">1,205 / 10,000 calls</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#F76D01] rounded-full" style={{width: '12%'}}></div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium mb-4">Documentation</h3>
            <p className="text-gray-600 mb-3">
              Check our comprehensive API documentation to learn how to integrate our services with your applications.
            </p>
            <a href="#" className="text-[#F76D01] font-medium">View API Documentation →</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDashboardPage;
