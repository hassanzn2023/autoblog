
import React from 'react';
import { Gift, Users, Star, Zap } from 'lucide-react';

const BenefitsPage = () => {
  const benefits = [
    {
      icon: <Gift className="w-12 h-12 text-[#F76D01]" />,
      title: "Referral Program",
      description: "Invite friends and colleagues to join our platform and earn rewards for each successful referral."
    },
    {
      icon: <Users className="w-12 h-12 text-[#F76D01]" />,
      title: "Community Contributions",
      description: "Share templates or content ideas with the community to earn points and unlock special features."
    },
    {
      icon: <Star className="w-12 h-12 text-[#F76D01]" />,
      title: "Loyalty Rewards",
      description: "Long-term users receive exclusive benefits, discounts, and early access to new features."
    },
    {
      icon: <Zap className="w-12 h-12 text-[#F76D01]" />,
      title: "Power User Perks",
      description: "Active users who utilize advanced features receive additional AI credits and priority support."
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Win Additional Benefits</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Your Current Status</h2>
        
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="mb-4">
              <div className="text-sm text-gray-500">Referral Points</div>
              <div className="text-2xl font-bold">0</div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-500">Contribution Points</div>
              <div className="text-2xl font-bold">0</div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-500">Loyalty Level</div>
              <div className="text-2xl font-bold">Basic</div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-[#F76D01] rounded-lg p-6 flex-1">
            <h3 className="font-medium mb-3">Get Started</h3>
            <p className="text-gray-600 mb-4">Invite friends, contribute to the community, and use our platform regularly to earn benefits.</p>
            <button className="bg-[#F76D01] text-white px-4 py-2 rounded-md hover:bg-[#E65D00]">
              Get My Referral Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsPage;
