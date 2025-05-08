
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import CreateTemplateDialog from '@/components/autoblog/CreateTemplateDialog';
import PreviewTemplateDialog from '@/components/autoblog/PreviewTemplateDialog';
import SelectProjectDialog from '@/components/autoblog/SelectProjectDialog';
import TemplatesTabContent from '@/components/autoblog/TemplatesTabContent';
import { Template } from '@/types/template';
import { templates } from '@/data/templates';

const AutoblogTemplatePage = () => {
  const navigate = useNavigate();
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [isPreviewTemplateDialogOpen, setIsPreviewTemplateDialogOpen] = useState(false);
  const [isSelectProjectDialogOpen, setIsSelectProjectDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsSelectProjectDialogOpen(true);
  };
  
  const handleCreateTemplate = () => {
    setIsCreateTemplateDialogOpen(true);
  };
  
  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewTemplateDialogOpen(true);
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
            <TemplatesTabContent
              templates={templates}
              onUseTemplate={(template) => handleUseTemplate(template)}
              onPreviewTemplate={handlePreviewTemplate}
              onCreateTemplate={handleCreateTemplate}
              filterType="all"
            />
          </TabsContent>
          
          <TabsContent value="official">
            <TemplatesTabContent
              templates={templates}
              onUseTemplate={(template) => handleUseTemplate(template)}
              onPreviewTemplate={handlePreviewTemplate}
              onCreateTemplate={handleCreateTemplate}
              filterType="official"
            />
          </TabsContent>
          
          <TabsContent value="community">
            <TemplatesTabContent
              templates={templates}
              onUseTemplate={(template) => handleUseTemplate(template)}
              onPreviewTemplate={handlePreviewTemplate}
              onCreateTemplate={handleCreateTemplate}
              filterType="community"
            />
          </TabsContent>
          
          <TabsContent value="yours">
            <TemplatesTabContent
              templates={templates}
              onUseTemplate={(template) => handleUseTemplate(template)}
              onPreviewTemplate={handlePreviewTemplate}
              onCreateTemplate={handleCreateTemplate}
              filterType="yours"
              showEmptyCard={true}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <CreateTemplateDialog 
        open={isCreateTemplateDialogOpen}
        onOpenChange={setIsCreateTemplateDialogOpen}
      />

      <PreviewTemplateDialog
        open={isPreviewTemplateDialogOpen}
        onOpenChange={setIsPreviewTemplateDialogOpen}
        template={selectedTemplate}
      />
      
      <SelectProjectDialog
        open={isSelectProjectDialogOpen}
        onOpenChange={setIsSelectProjectDialogOpen}
        template={selectedTemplate}
      />
    </div>
  );
};

export default AutoblogTemplatePage;
