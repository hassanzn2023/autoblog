
import React from 'react';

const AutoblogTemplatePage = () => {
  const templates = [
    {
      id: 1,
      name: 'News Blog',
      description: 'Template for news and current events',
      category: 'News'
    },
    {
      id: 2,
      name: 'Tech Review',
      description: 'Template for technology product reviews',
      category: 'Technology'
    },
    {
      id: 3,
      name: 'Recipe Blog',
      description: 'Template for food and recipe content',
      category: 'Food'
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Project Templates</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100"></div>
            <div className="p-4">
              <h3 className="font-medium text-gray-800">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{template.category}</span>
                <button className="text-[#F76D01] text-sm font-medium">Use Template</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoblogTemplatePage;
