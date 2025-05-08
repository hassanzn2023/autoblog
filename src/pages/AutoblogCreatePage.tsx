
import React from 'react';

const AutoblogCreatePage = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Create a New Autoblog Project</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          <div>
            <label htmlFor="projectName" className="block text-gray-600 mb-2">Project Name</label>
            <input 
              type="text" 
              id="projectName" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-seo-purple" 
              placeholder="Enter project name"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-gray-600 mb-2">Description</label>
            <textarea 
              id="description" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-seo-purple" 
              rows={4}
              placeholder="Describe your autoblog project"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-gray-600 mb-2">Category</label>
            <select 
              id="category" 
              className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-seo-purple"
            >
              <option>Technology</option>
              <option>Health & Wellness</option>
              <option>Business</option>
              <option>Lifestyle</option>
              <option>Travel</option>
              <option>Food & Cooking</option>
              <option>Finance</option>
              <option>Education</option>
            </select>
          </div>
          
          <div>
            <button type="submit" className="bg-[#F76D01] text-white px-6 py-3 rounded-md hover:bg-[#E65D00] transition-colors">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoblogCreatePage;
