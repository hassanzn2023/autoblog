import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Star, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import CreateTemplateDialog from '@/components/autoblog/CreateTemplateDialog';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'official' | 'community' | 'yours';
  popularity: number; // 1-5
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const AutoblogTemplatePage = () => {
  const navigate = useNavigate();
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  
  const templates: Template[] = [
    {
      id: '1',
      name: 'News Aggregator',
      description: 'Automatically collect and publish news from various sources with proper attribution',
      category: 'news',
      type: 'official',
      popularity: 5,
      difficulty: 'beginner'
    },
    {
      id: '2',
      name: 'Industry Insights',
      description: 'Create detailed analysis posts about industry trends and developments',
      category: 'business',
      type: 'official',
      popularity: 4,
      difficulty: 'intermediate'
    },
    {
      id: '3',
      name: 'Product Reviews',
      description: 'Generate comprehensive product reviews based on specifications and user feedback',
      category: 'reviews',
      type: 'official',
      popularity: 5,
      difficulty: 'intermediate'
    },
    {
      id: '4',
      name: 'Recipe Collection',
      description: 'Create recipe posts with ingredients, instructions, and nutritional information',
      category: 'food',
      type: 'community',
      popularity: 4,
      difficulty: 'beginner'
    },
    {
      id: '5',
      name: 'Travel Guides',
      description: 'Generate destination guides with attractions, tips, and local insights',
      category: 'travel',
      type: 'community',
      popularity: 3,
      difficulty: 'intermediate'
    },
    {
      id: '6',
      name: 'Tech Tutorial',
      description: 'Create step-by-step tutorials for software and technology topics',
      category: 'technology',
      type: 'yours',
      popularity: 4,
      difficulty: 'advanced'
    }
  ];

  const handleUseTemplate = (templateId: string) => {
    // Navigate to create page with template ID
    navigate(`/autoblog/create?template=${templateId}`);
  };
  
  const handleCreateTemplate = () => {
    setIsCreateTemplateDialogOpen(true);
  };
  
  const renderPopularityStars = (popularity: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < popularity ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="w-full bg-gray-50 px-6 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Autoblog Templates</h1>
            <p className="text-gray-600 mt-1">Start with a template or create your own</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.open('https://docs.lovable.dev/user-guides/autoblog-templates', '_blank')}
            >
              <BookOpen size={16} />
              Template Guides
            </Button>
            <Button
              className="bg-[#F76D01] hover:bg-[#e65d00] text-white flex items-center gap-2"
              onClick={handleCreateTemplate}
            >
              <PlusCircle size={16} />
              Create Custom Template
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="official">Official</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="yours">Your Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <TemplateCard 
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="official">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(template => template.type === 'official')
                .map(template => (
                  <TemplateCard 
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="community">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(template => template.type === 'community')
                .map(template => (
                  <TemplateCard 
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="yours">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(template => template.type === 'yours')
                .map(template => (
                  <TemplateCard 
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                  />
                ))}
              
              <Card className="border-dashed border-2 flex flex-col items-center justify-center hover:border-[#F76D01] transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-[#FFF3EB] rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusCircle size={24} className="text-[#F76D01]" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Create Custom Template</h3>
                  <p className="text-gray-500 mb-6">
                    Design your own autoblog template to reuse or share with others
                  </p>
                  <Button
                    className="bg-white hover:bg-gray-50 text-[#F76D01] border border-[#F76D01]"
                    onClick={handleCreateTemplate}
                  >
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <CreateTemplateDialog 
        open={isCreateTemplateDialogOpen}
        onOpenChange={setIsCreateTemplateDialogOpen}
      />
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  onUse: (id: string) => void;
}

const TemplateCard = ({ template, onUse }: TemplateCardProps) => {
  const navigate = useNavigate();
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'official':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'community':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'yours':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const renderPopularityStars = (popularity: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < popularity ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge className={getTypeColor(template.type)}>
              {template.type === 'official' ? 'Official' : 
               template.type === 'community' ? 'Community' : 'Yours'}
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-1">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {renderPopularityStars(template.popularity)}
          </div>
          <div>
            <Badge className={getDifficultyColor(template.difficulty)}>
              {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between p-3">
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600"
          onClick={() => navigate(`/autoblog/template/preview/${template.id}`)}
        >
          Preview
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600"
          >
            <Copy size={16} />
          </Button>
          <Button
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            size="sm"
            onClick={() => onUse(template.id)}
          >
            Use Template <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AutoblogTemplatePage;
