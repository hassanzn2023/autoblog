
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lightbulb } from 'lucide-react';

const AutoblogCreatePage = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  
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
  
  const goBack = () => {
    navigate('/autoblog/list');
  };

  return (
    <div className="w-full bg-white min-h-screen p-6">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={goBack}
            className="mr-3"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create a New Autoblog Project</h1>
            <p className="text-gray-600">Set up your automatic content generation system</p>
          </div>
        </div>
        
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Project Details</CardTitle>
            <CardDescription>
              Fill in basic information about your autoblogging project
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Project Name <span className="text-red-500">*</span></label>
                <Input 
                  type="text" 
                  placeholder="E.g., Tech News Daily, Health & Wellness Blog" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">Choose a descriptive name for your autoblog project</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Textarea 
                  placeholder="Describe the purpose and goals of your autoblogging project" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full bg-white">
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
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Publishing Frequency</label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start">
                <Lightbulb className="text-blue-500 mt-0.5 mr-3 shrink-0" size={18} />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> Autoblogs work best with clear guidelines and specific topics. 
                    You'll be able to fine-tune your content generation settings in the next steps.
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={goBack}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
              >
                Continue to Setup
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AutoblogCreatePage;
