
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BlogProjectModal from './BlogProjectModal';

interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Paused';
  articles: number;
  lastUpdated: string;
}

const BlogProjects = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const projects: Project[] = [
    {
      id: '1',
      name: 'My First Blog',
      status: 'Active',
      articles: 12,
      lastUpdated: 'May 10, 3:15 PM'
    }
  ];

  const handleRowClick = (projectId: string) => {
    // Navigate to the blog project configuration wizard
    window.location.href = `/blog/config/${projectId}`;
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">Blog Projects</h1>
          <p className="text-gray-600">Manage your blog content projects here...</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Doc</Button>
            <Button variant="outline" size="sm">Tutorial</Button>
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
          >
            + New Blog Project
          </Button>
        </div>

        <Card className="overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">i</span>
                      Name
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      Last Updated
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr 
                    key={project.id} 
                    onClick={() => handleRowClick(project.id)} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {project.name}
                        {project.status === 'Active' && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.articles}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <BlogProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default BlogProjects;
