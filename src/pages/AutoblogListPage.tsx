
import React from 'react';
import { Link } from 'react-router-dom';

const AutoblogListPage = () => {
  const projects = [
    {
      id: 1,
      name: 'Tech Trends Daily',
      description: 'Daily updates on technology trends and news',
      postsCount: 24,
      lastUpdated: '2025-05-02'
    },
    {
      id: 2,
      name: 'Health & Wellness Blog',
      description: 'Tips and advice for healthy living',
      postsCount: 16,
      lastUpdated: '2025-05-05'
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Autoblog Projects</h1>
        <Link to="/autoblog/create" className="bg-[#F76D01] text-white px-4 py-2 rounded-md hover:bg-[#E65D00] flex items-center gap-2">
          <span>+</span> New Project
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {projects.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {projects.map(project => (
              <li key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-gray-500">{project.postsCount} posts</span>
                      <span className="text-xs text-gray-500">Updated: {project.lastUpdated}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[#F76D01]">Edit</button>
                    <button className="text-[#F76D01]">View</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No projects yet</p>
            <Link to="/autoblog/create" className="text-[#F76D01] font-medium">Create your first autoblog project</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoblogListPage;
