
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface ConfigurationSummary {
  campaignName: string;
  description: string;
  businessType: string;
  articleType: string;
  readerLevel: string;
  research: string;
  targetCountry: string;
  language: string;
  aiModel: string;
  articleSize: string;
  tone: string;
  internalLinking: string;
  [key: string]: string;
}

interface ReviewSaveStepProps {
  configType: 'blog' | 'autoblog';
  configSummary: ConfigurationSummary;
  saveAsTemplate: boolean;
  onUpdate: (field: string, value: boolean) => void;
  onSave: () => void;
}

const ReviewSaveStep: React.FC<ReviewSaveStepProps> = ({
  configType,
  configSummary,
  saveAsTemplate,
  onUpdate,
  onSave,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-lg font-medium">Review & Save</h3>
        <p className="text-sm text-gray-500 mt-2">
          Final check of all configurations before launching the {configType === 'blog' ? 'blog project' : 'campaign'}.
        </p>
      </div>

      <div className="border rounded-lg p-6 space-y-6 max-h-[400px] overflow-y-auto">
        <p className="text-sm mb-4">Please review all your {configType === 'blog' ? 'blog project' : 'campaign'} settings before saving:</p>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">{configType === 'blog' ? 'Blog Project' : 'Campaign'} Name:</div>
            <div className="text-sm">{configSummary.campaignName}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Description:</div>
            <div className="text-sm">{configSummary.description || 'N/A'}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Business Type:</div>
            <div className="text-sm">{configSummary.businessType}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Article Type:</div>
            <div className="text-sm">{configSummary.articleType}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Reader Level:</div>
            <div className="text-sm">{configSummary.readerLevel}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Research:</div>
            <div className="text-sm">{configSummary.research}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Target Country:</div>
            <div className="text-sm">{configSummary.targetCountry}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Language:</div>
            <div className="text-sm">{configSummary.language}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">AI Model:</div>
            <div className="text-sm">{configSummary.aiModel}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Article Size:</div>
            <div className="text-sm">{configSummary.articleSize}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Tone:</div>
            <div className="text-sm">{configSummary.tone}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm font-medium">Internal Linking:</div>
            <div className="text-sm">{configSummary.internalLinking}</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="save-template"
          checked={saveAsTemplate}
          onCheckedChange={(checked) => onUpdate('saveAsTemplate', checked)}
        />
        <Label htmlFor="save-template">
          Save this configuration as a template for future {configType === 'blog' ? 'projects' : 'campaigns'}
        </Label>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Save {configType === 'blog' ? 'Project' : 'Campaign'} Configuration
        </Button>
      </div>
    </div>
  );
};

export default ReviewSaveStep;
