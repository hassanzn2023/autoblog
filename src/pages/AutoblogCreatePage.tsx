
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const AutoblogCreatePage = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    // Navigate to config page with the project name
    navigate(`/autoblog/config?name=${encodeURIComponent(projectName)}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Create a New Autoblog Project</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="projectName" className="block text-gray-600 mb-2">Project Name</label>
            <Input 
              type="text" 
              id="projectName" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F76D01]" 
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-gray-600 mb-2">Description</label>
            <Textarea 
              id="description" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F76D01]" 
              rows={4}
              placeholder="Describe your autoblog project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-gray-600 mb-2">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="health">Health & Wellness</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="food">Food & Cooking</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button 
              type="submit" 
              className="bg-[#F76D01] text-white px-6 py-3 rounded-md hover:bg-[#E65D00] transition-colors"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoblogCreatePage;
