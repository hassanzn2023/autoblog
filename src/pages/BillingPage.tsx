
import React, { useState } from 'react';

const BillingPage = () => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const toggleQuestion = (question: string) => {
    if (expandedQuestion === question) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(question);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Plan details</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Plan:</span>
                <span>Free</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500">User seats:</span>
                <span>1</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Billing period:</span>
                <span>Monthly</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Projects:</span>
                <span>1</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Next billing date:</span>
                <span>N/A</span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Amount:</span>
                <span>$0</span>
              </div>
            </div>
          </div>
          
          <div>
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
              Manage add-ons
            </button>
          </div>
        </div>
        
        <div className="border border-[#F76D01] bg-orange-50 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-[#F76D01]">⊕</div>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Upgrade to get more generations, articles and SEO tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">Access to Site audit, Issue finder and fixer, Topic Clusters and Answer the People</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">Higher limits on AI Agent generations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">Generative Engine Optimisation insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">Unlimited Chatsonic generations</span>
                </div>
              </div>
            </div>
            <div>
              <button className="bg-[#F76D01] text-white px-4 py-2 rounded-md hover:bg-[#E65D00]">
                Upgrade plan
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      
      <div className="space-y-4 mb-8">
        {[
          "Do I need a credit card to start the Free Trial?",
          "How is Writesonic different from ChatGPT?",
          "What's the difference between monthly and annual billing?",
          "What is a \"project\" and why might I need more?",
          "What's the main difference between each pricing tier?",
          "Can I add more users to my plan?",
          "Can I add more projects to my plan?",
          "What happens if I need more articles than my plan includes?",
          "Do unused articles roll over to the next month?"
        ].map((question) => (
          <div key={question} className="border border-gray-200 rounded-lg">
            <button
              className="flex justify-between items-center w-full p-4 text-left"
              onClick={() => toggleQuestion(question)}
            >
              <span>{question}</span>
              <span>{expandedQuestion === question ? "▼" : "▶"}</span>
            </button>
            {expandedQuestion === question && (
              <div className="p-4 pt-0 text-gray-600">
                <p>This is the answer to the question. The content would be specific to each question asked.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingPage;
