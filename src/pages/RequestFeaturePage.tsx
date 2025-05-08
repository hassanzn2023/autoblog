
import React from 'react';
import { Lightbulb } from 'lucide-react';

const RequestFeaturePage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Request a Feature</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-start gap-4 mb-6">
          <Lightbulb className="text-[#F76D01] h-10 w-10" />
          <div>
            <h2 className="text-xl font-semibold">Share Your Ideas</h2>
            <p className="text-gray-600 mt-2">
              We're constantly working to improve our platform and would love to hear your suggestions.
              Your feedback helps us prioritize new features and enhancements.
            </p>
          </div>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-gray-600 mb-2">Feature Title</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Enter a brief title for your feature request" />
          </div>
          
          <div>
            <label className="block text-gray-600 mb-2">Category</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white">
              <option>Auto Blog Tool</option>
              <option>Blog Tool</option>
              <option>Auto Fix</option>
              <option>SEO Features</option>
              <option>User Interface</option>
              <option>User Experience</option>
              <option>Integrations</option>
              <option>Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-600 mb-2">Description</label>
            <textarea className="w-full p-3 border border-gray-300 rounded-lg" rows={5} placeholder="Please describe the feature you would like to see"></textarea>
          </div>
          
          <div>
            <label className="block text-gray-600 mb-2">Why is this feature important to you?</label>
            <textarea className="w-full p-3 border border-gray-300 rounded-lg" rows={3} placeholder="Explain how this feature would improve your workflow"></textarea>
          </div>
          
          <button className="bg-[#F76D01] text-white py-2 px-4 rounded-md hover:bg-[#E65D00]">Submit Request</button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Feature Roadmap</h2>
        <p className="text-gray-600 mb-4">
          Here's a glimpse of what's coming soon to our platform. These features are currently in development
          or planned for upcoming releases.
        </p>
        
        <div className="space-y-6">
          <div className="border-l-4 border-green-500 pl-4 py-1">
            <h3 className="font-medium">Enhanced Analytics Dashboard</h3>
            <p className="text-gray-600 text-sm">Coming in May 2025</p>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-4 py-1">
            <h3 className="font-medium">Advanced Topic Research Tools</h3>
            <p className="text-gray-600 text-sm">Planned for Q3 2025</p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <h3 className="font-medium">Additional Language Support</h3>
            <p className="text-gray-600 text-sm">Under consideration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestFeaturePage;
