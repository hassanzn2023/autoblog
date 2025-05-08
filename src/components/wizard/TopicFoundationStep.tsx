
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TopicFoundationStepProps {
  configType: 'blog' | 'autoblog';
  researchMethod: string;
  competitorLinks: number;
  topicInputMethod: string;
  topics: string;
  targetCountry: string;
  language: string;
  contentDescription: string;
  onUpdate: (field: string, value: string | number) => void;
}

const TopicFoundationStep: React.FC<TopicFoundationStepProps> = ({
  configType,
  researchMethod,
  competitorLinks,
  topicInputMethod,
  topics,
  targetCountry,
  language,
  contentDescription,
  onUpdate,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <Label className="text-base font-medium">Research Method</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              researchMethod === 'ai-web' ? 'border-[#F76D01] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onUpdate('researchMethod', 'ai-web')}
          >
            <div className="text-lg font-medium mb-2">AI Web Research</div>
            <div className="text-sm text-gray-500">AI automatically researches the web for your topics</div>
            {researchMethod === 'ai-web' && (
              <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Recommended</div>
            )}
          </div>
          
          <div 
            className={`border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              researchMethod === 'custom-sources' ? 'border-[#F76D01] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onUpdate('researchMethod', 'custom-sources')}
          >
            <div className="text-lg font-medium mb-2">Custom Sources</div>
            <div className="text-sm text-gray-500">Provide your own source materials and links</div>
            <div className="mt-4 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full flex items-center gap-1">
              <span>🔒</span> Pro Feature
            </div>
          </div>
        </div>
      </div>

      {researchMethod === 'ai-web' && (
        <div className="space-y-2">
          <Label>Number of competitor links for analysis (Optional):</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={competitorLinks}
            onChange={(e) => onUpdate('competitorLinks', parseInt(e.target.value) || 0)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-base font-medium">Topic Definition</Label>
        <div className="mt-2 space-y-4">
          <RadioGroup defaultValue={topicInputMethod} onValueChange={(value) => onUpdate('topicInputMethod', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="copy-paste" id="copy-paste" />
              <Label htmlFor="copy-paste">Copy/Paste Topics</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upload-csv" id="upload-csv" />
              <Label htmlFor="upload-csv">Upload CSV/Excel</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {topicInputMethod === 'copy-paste' && (
        <div className="space-y-2">
          <Label>Topics (one per line):</Label>
          <Textarea
            placeholder="Enter your topics here..."
            value={topics}
            onChange={(e) => onUpdate('topics', e.target.value)}
            rows={5}
          />
        </div>
      )}

      {topicInputMethod === 'upload-csv' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload File:</Label>
            <Input type="file" />
          </div>
          <div className="space-y-2">
            <Label>Topic Column Name:</Label>
            <Input placeholder="e.g., 'Topic' or 'Subject'" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Target Country:</Label>
        <Select value={targetCountry} onValueChange={(value) => onUpdate('targetCountry', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select country --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="global">Global</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Article Language:</Label>
        <Select value={language} onValueChange={(value) => onUpdate('language', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select language --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Content Description (Optional):</Label>
        <Textarea
          placeholder="Short overview/angle of the topic..."
          value={contentDescription}
          onChange={(e) => onUpdate('contentDescription', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default TopicFoundationStep;
