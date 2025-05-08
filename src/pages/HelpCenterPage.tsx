
import React from 'react';

const HelpCenterPage = () => {
  const faqs = [
    {
      question: "How do I create an autoblog project?",
      answer: "To create an autoblog project, navigate to the Auto Blog section in the sidebar, then click on 'Create a project'. Fill in the required details and follow the setup wizard."
    },
    {
      question: "What is the difference between Auto Blog and Blog?",
      answer: "Auto Blog automatically generates and publishes content using AI, while Blog provides tools for manual content creation with AI assistance."
    },
    {
      question: "How do I change my account settings?",
      answer: "Click on your profile picture in the top right corner, then select 'Profile' to access and edit your account settings."
    },
    {
      question: "Can I upgrade my plan?",
      answer: "Yes, you can upgrade your plan by clicking on your profile and selecting 'Plans and Billing', or by clicking the 'Upgrade plan' button at the bottom of the sidebar."
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Help Center</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <h3 className="font-medium text-gray-800 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Contact Support</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-2">Subject</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="What do you need help with?" />
          </div>
          
          <div>
            <label className="block text-gray-600 mb-2">Message</label>
            <textarea className="w-full p-3 border border-gray-300 rounded-lg" rows={5} placeholder="Describe your issue in detail"></textarea>
          </div>
          
          <button className="bg-[#F76D01] text-white py-2 px-4 rounded-md hover:bg-[#E65D00]">Submit Request</button>
        </form>
      </div>
    </div>
  );
};

export default HelpCenterPage;
