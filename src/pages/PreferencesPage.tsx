
import React from 'react';

const PreferencesPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Preferences</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Languages</h2>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">System Language</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-seo-purple">
            <option>us English</option>
            <option>ar Arabic</option>
            <option>fr French</option>
            <option>es Spanish</option>
          </select>
          <p className="text-gray-500 mt-2 text-sm">Set the default language for system</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Generation Language</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-seo-purple">
            <option>us English</option>
            <option>ar Arabic</option>
            <option>fr French</option>
            <option>es Spanish</option>
          </select>
          <p className="text-gray-500 mt-2 text-sm">Set the default language for your output generation</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Country</h2>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Generation Country</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-seo-purple">
            <option>LB Lebanon</option>
            <option>US United States</option>
            <option>UK United Kingdom</option>
            <option>CA Canada</option>
          </select>
          <p className="text-gray-500 mt-2 text-sm">Set the default country for system</p>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
