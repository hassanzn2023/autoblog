
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AiContentGenerationStepProps {
  aiModel: string;
  antiAiDetection: boolean;
  articleSize: string;
  creativityLevel: string;
  toneOfVoice: string;
  pointOfView: string;
  formality: string;
  includeFAQ: boolean;
  customInstructions: string;
  onUpdate: (field: string, value: string | boolean) => void;
}

const AiContentGenerationStep: React.FC<AiContentGenerationStepProps> = ({
  aiModel,
  antiAiDetection,
  articleSize,
  creativityLevel,
  toneOfVoice,
  pointOfView,
  formality,
  includeFAQ,
  customInstructions,
  onUpdate,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label>AI Model for Content Generation:</Label>
        <Select value={aiModel} onValueChange={(value) => onUpdate('aiModel', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select AI model --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="gpt4">GPT-4</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
            <SelectItem value="palm">PaLM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Enable Anti-AI Detection Mode (Bypass AI)</Label>
          <p className="text-sm text-gray-500">Makes content harder to detect by AI detectors</p>
        </div>
        <Switch
          checked={antiAiDetection}
          onCheckedChange={(checked) => onUpdate('antiAiDetection', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label>Article Size:</Label>
        <Select value={articleSize} onValueChange={(value) => onUpdate('articleSize', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select size --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short (800-1200 words)</SelectItem>
            <SelectItem value="medium">Medium (1300-1799 words)</SelectItem>
            <SelectItem value="detailed">Detailed (1800-2799 words)</SelectItem>
            <SelectItem value="comprehensive">Comprehensive (2800+ words)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Creativity Level:</Label>
        <Select value={creativityLevel} onValueChange={(value) => onUpdate('creativityLevel', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select creativity level --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="factual">Factual</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
            <SelectItem value="highly-creative">Highly Creative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tone of Voice:</Label>
        <Select value={toneOfVoice} onValueChange={(value) => onUpdate('toneOfVoice', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select tone --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="conversational">Conversational</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="authoritative">Authoritative</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Point of View:</Label>
        <Select value={pointOfView} onValueChange={(value) => onUpdate('pointOfView', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select point of view --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first-person">First Person (I, We)</SelectItem>
            <SelectItem value="second-person">Second Person (You)</SelectItem>
            <SelectItem value="third-person">Third Person (They, He/She)</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Formality:</Label>
        <Select value={formality} onValueChange={(value) => onUpdate('formality', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select formality --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="informal">Informal</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Include Frequently Asked Questions (FAQ) Section</Label>
        <Switch
          checked={includeFAQ}
          onCheckedChange={(checked) => onUpdate('includeFAQ', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label>Custom Instructions (Optional):</Label>
        <Textarea
          placeholder="Enter AI instructions, e.g., focus on specific keywords, maintain a certain persona..."
          value={customInstructions}
          onChange={(e) => onUpdate('customInstructions', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
};

export default AiContentGenerationStep;
