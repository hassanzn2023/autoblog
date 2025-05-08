
import React, { useState } from 'react';

const UsagePage = () => {
  const [activeTab, setActiveTab] = useState('myUsage');
  const [timeframe, setTimeframe] = useState('Last 7 Days');
  const [templateFilter, setTemplateFilter] = useState('All Templates');

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-8">Usage</h1>
      
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button 
              className={`px-6 py-4 ${activeTab === 'workspace' ? 'border-b-2 border-[#F76D01] font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('workspace')}
            >
              Workspace Usage
            </button>
            <button 
              className={`px-6 py-4 ${activeTab === 'myUsage' ? 'border-b-2 border-[#F76D01] font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('myUsage')}
            >
              My Usage
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-end mb-6 gap-4">
            <select 
              className="p-2 border border-gray-300 rounded-lg"
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
            >
              <option>All Templates</option>
              <option>Blog Posts</option>
              <option>Product Descriptions</option>
              <option>Social Media</option>
            </select>
            
            <select 
              className="p-2 border border-gray-300 rounded-lg"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>All Time</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-gray-500 mb-2">Total Generations</div>
              <div className="text-sm text-gray-500">{timeframe}</div>
              <div className="text-4xl font-bold mt-2">0</div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-gray-500 mb-2">Total Credits Used</div>
              <div className="text-sm text-gray-500">{timeframe}</div>
              <div className="text-4xl font-bold mt-2">0</div>
              <div className="text-xs text-gray-500 mt-2">Credits are not charged for Standard Templates</div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-gray-500 mb-2">Percent Of Active Days</div>
              <div className="text-sm text-gray-500">{timeframe}</div>
              <div className="text-4xl font-bold mt-2">0 %</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-medium mb-6">Daily generations - {timeframe}</h3>
            <div className="flex items-center justify-center h-56 text-gray-500">
              No data to show
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium mb-6">Top 10 tools used - {timeframe}</h3>
            <div className="flex items-center justify-center h-56 text-gray-500">
              No data to show
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsagePage;
