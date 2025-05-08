
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Eye, Copy, Trash2, ArrowUpRight, ChevronRight, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Project {
  id: number;
  name: string;
  description: string;
  postsCount: number;
  lastUpdated: string;
  status: 'active' | 'draft' | 'paused';
  category: string;
}

const AutoblogListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  
  const projects: Project[] = [
    {
      id: 1,
      name: 'Tech Trends Daily',
      description: 'Daily updates on technology trends and news',
      postsCount: 24,
      lastUpdated: '2025-05-02',
      status: 'active',
      category: 'technology'
    },
    {
      id: 2,
      name: 'Health & Wellness Blog',
      description: 'Tips and advice for healthy living',
      postsCount: 16,
      lastUpdated: '2025-05-05',
      status: 'active',
      category: 'health'
    },
    {
      id: 3,
      name: 'Business Insights',
      description: 'Analysis of business trends and market insights',
      postsCount: 8,
      lastUpdated: '2025-05-03',
      status: 'paused',
      category: 'business'
    },
    {
      id: 4,
      name: 'Travel Adventures',
      description: 'Exploring destinations around the world',
      postsCount: 12,
      lastUpdated: '2025-04-28',
      status: 'draft',
      category: 'travel'
    }
  ];

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const handleCreateNew = () => {
    navigate('/autoblog/create');
  };
  
  const handleEdit = (projectId: number) => {
    navigate(`/autoblog/config/${projectId}`);
  };
  
  const handleView = (projectId: number) => {
    // This would navigate to a detail view of the autoblog
    navigate(`/autoblog/view/${projectId}`);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Paused</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-gray-50 px-6 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Autoblog Projects</h1>
            <p className="text-gray-600 mt-1">Manage all your autoblogging projects</p>
          </div>
          <Button
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white mt-4 md:mt-0 flex items-center gap-2"
            onClick={handleCreateNew}
          >
            <PlusCircle size={16} />
            New Project
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-40">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map(project => (
              <Card key={project.id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-800">{project.name}</CardTitle>
                      <CardDescription className="text-gray-500 mt-1 line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-3">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Posts:</span> {project.postsCount}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Updated:</span> {project.lastUpdated}
                    </div>
                  </div>
                </CardContent>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <Button 
                    variant="ghost"
                    className="text-[#F76D01] hover:text-[#e65d00] hover:bg-[#FFF3EB] p-0"
                    onClick={() => handleView(project.id)}
                  >
                    View Details <ChevronRight size={16} className="ml-1" />
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => handleEdit(project.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                          <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center">
                          <Copy size={14} className="mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center">
                          <ArrowUpRight size={14} className="mr-2" /> Export
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 flex items-center">
                          <Trash2 size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' 
                  ? "No projects match your current filters. Try adjusting your search criteria."
                  : "You haven't created any autoblog projects yet. Get started by creating your first project."}
              </p>
              <Button 
                className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
                onClick={handleCreateNew}
              >
                Create Your First Project
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoblogListPage;
