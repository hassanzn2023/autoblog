
import React from 'react';
import { Sparkles, BookOpen, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const GetStartedPage: React.FC = () => {
  const tasks = [
    { id: 1, title: 'Run Your First Site Audit', completed: false },
    { id: 2, title: 'Use the AI SEO Agent to Fetch Insights', completed: false },
    { id: 3, title: 'Research and Plan Content', completed: false },
    { id: 4, title: 'Generate Your First Content', completed: false },
    { id: 5, title: 'Optimize for SEO', completed: false }
  ];

  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="container max-w-7xl py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Writesonic <span className="text-2xl">👋</span></h1>
        <p className="text-gray-600 text-lg">Here's everything you need to kickstart your content marketing journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Lets get you started</h2>
                <div className="text-sm text-gray-500">{completedTasks} of {tasks.length} completed</div>
              </div>
              <Progress value={(completedTasks / tasks.length) * 100} className="h-2 mb-4" />
              
              <div className="divide-y">
                {tasks.map((task) => (
                  <div key={task.id} className="py-4 flex items-start gap-4">
                    <Checkbox id={`task-${task.id}`} checked={task.completed} />
                    <label 
                      htmlFor={`task-${task.id}`}
                      className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {task.title}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Watch demo</h3>
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative">
                <img 
                  src="/lovable-uploads/7457c048-1790-42be-ad7e-f220670c294d.png" 
                  alt="Demo video thumbnail" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full bg-white/80 hover:bg-white">
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium">Quick Links</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <BookOpen className="h-4 w-4" /> Help Docs
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" /> Talk to our team
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.2 14.4c0 3.18-2.58 5.76-5.76 5.76H5.7c-3.18 0-5.7-2.58-5.7-5.76s2.58-5.76 5.76-5.76h4.32v5.76h-4.32v2.88h10.68c1.59 0 2.88-1.29 2.88-2.88s-1.29-2.88-2.88-2.88h-1.44v-2.88h1.44c3.18 0 5.76 2.58 5.76 5.76z" fill="currentColor" />
                    <path d="M16.44 0H3.96C1.77 0 0 1.77 0 3.96v8.64c1.77 0 3.24-1.44 3.24-3.24V3.96c0-.36.36-.72.72-.72h12.48c.36 0 .72.36.72.72v5.04h2.88V3.96c0-2.19-1.77-3.96-3.96-3.96h.36z" fill="currentColor" />
                  </svg>
                  Join Slack community
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-[#F5F1FF]">
        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span className="text-gray-800">Experience the full suite of tools and features with Writesonic</span>
          </div>
          <Button className="whitespace-nowrap bg-purple-600 hover:bg-purple-700">
            Upgrade now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetStartedPage;
