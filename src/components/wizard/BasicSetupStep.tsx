
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
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
  const navigate = useNavigate();

  const handleSettingChange = (value: string) => {
    if (value === "create-template") {
      // Navigate to template creation page
      navigate('/autoblog/template');
    } else if (value === "choose-template") {
      // Navigate to template list page
      navigate('/autoblog/template');
    }
    // For "scratch", we stay on the current page
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Choose your preferred setting (Optional):</Label>
        <Select onValueChange={handleSettingChange}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select a saved setting --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scratch">Start from scratch</SelectItem>
            <SelectItem value="choose-template">Choose from templates</SelectItem>
            <SelectItem value="create-template">Create a template</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Campaign Name</Label>
        <Input 
          value={name}
          onChange={(e) => onUpdate('name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Textarea 
          placeholder="Enter a brief description for your campaign..."
          value={description}
          onChange={(e) => onUpdate('description', e.target.value)}
          rows={5}
        />
      </div>
    </div>
  );
};

export default BasicSetupStep;
