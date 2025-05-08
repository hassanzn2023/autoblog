
import React from 'react';

const TeamsPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Team</h1>
        <button className="bg-[#F76D01] text-white px-4 py-2 rounded-md hover:bg-[#E65D00] flex items-center gap-2">
          <span>+</span> Invite Member
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Team Members</h2>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-[#F76D01] rounded-full flex items-center justify-center text-white">
              M
            </div>
            <div>
              <div className="font-medium">Malek</div>
              <div className="text-sm text-gray-500">malekalmout2016@gmail.com</div>
            </div>
          </div>
          <div className="text-gray-600">Owner</div>
        </div>
      </div>
      
      <div className="bg-orange-50 border border-[#F76D01] rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-[#F76D01]">+</div>
            <div>
              <h3 className="text-lg font-medium mb-2">Collaborate with your team</h3>
              <p className="text-gray-600">Upgrade your plan to add more team members and unlock collaborative features.</p>
            </div>
          </div>
          <button className="bg-[#F76D01] text-white px-4 py-2 rounded-md hover:bg-[#E65D00]">
            Upgrade plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
