
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BasicSetupStepProps {
  configType: 'blog' | 'autoblog';
  name: string;
  description: string;
  onUpdate: (field: string, value: string) => void;
}

const BasicSetupStep: React.FC<BasicSetupStepProps> = ({
  configType,
  name,
  description,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Choose your preferred setting (Optional):</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="-- Select a saved setting --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Template</SelectItem>
            <SelectItem value="custom">Custom Template</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{configType === 'blog' ? 'Blog Project' : 'Campaign'} Name</Label>
        <Input 
          value={name}
          onChange={(e) => onUpdate('name', e.target.value)}
          readOnly
        />
      </div>

      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Textarea 
          placeholder="Enter a brief description..."
          value={description}
          onChange={(e) => onUpdate('description', e.target.value)}
          rows={5}
        />
      </div>
    </div>
  );
};

export default BasicSetupStep;
