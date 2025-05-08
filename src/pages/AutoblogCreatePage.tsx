
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
    <div className="w-full max-w-[1200px] mx-auto px-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Create a New Autoblog Project</h1>
      
      <div className="bg-white rounded-lg shadow">
        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Project Name</label>
            <Input 
              type="text" 
              placeholder="Enter project name" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border-gray-300"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Description</label>
            <Textarea 
              placeholder="Describe your autoblog project" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-gray-300"
              rows={5}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-white border-gray-300">
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
          
          <div className="pt-4 flex justify-center">
            <Button 
              type="submit" 
              className="bg-[#F76D01] hover:bg-[#e65d00] text-white px-6 py-2 rounded-md w-auto"
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
