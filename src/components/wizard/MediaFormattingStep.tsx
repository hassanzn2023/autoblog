
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MediaFormattingStepProps {
  imageSource: 'google' | 'ai' | 'none';
  imagePrompt: string;
  inArticleImagesCount: number;
  addFeaturedImage: boolean;
  embedYoutubeVideos: boolean;
  includeTables: boolean;
  includeQuotes: boolean;
  includeLists: boolean;
  includeBoldText: boolean;
  includeItalicText: boolean;
  onUpdate: (field: string, value: any) => void;
}

const MediaFormattingStep: React.FC<MediaFormattingStepProps> = ({
  imageSource,
  imagePrompt,
  inArticleImagesCount,
  addFeaturedImage,
  embedYoutubeVideos,
  includeTables,
  includeQuotes,
  includeLists,
  includeBoldText,
  includeItalicText,
  onUpdate,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Image Settings */}
      <div className="border rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium">Image Settings</h3>
        <p className="text-sm text-gray-500">Configure how images are sourced and included.</p>
        
        <div className="space-y-4">
          <Label>Image Sourcing:</Label>
          <RadioGroup defaultValue={imageSource} onValueChange={(value: 'google' | 'ai' | 'none') => onUpdate('imageSource', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="google" id="google" />
              <Label htmlFor="google">Google Images (Royalty-free)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ai" id="ai" />
              <Label htmlFor="ai">AI Image Generation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">No Images</Label>
            </div>
          </RadioGroup>
        </div>
        
        {imageSource === 'ai' && (
          <div className="space-y-2">
            <Label>AI Image Prompt (Optional):</Label>
            <Textarea
              placeholder="Describe the image for AI, e.g., Abstract background with vibrant colors"
              value={imagePrompt}
              onChange={(e) => onUpdate('imagePrompt', e.target.value)}
              rows={3}
            />
          </div>
        )}
        
        {imageSource !== 'none' && (
          <>
            <div className="space-y-2">
              <Label>Number of In-Article Images:</Label>
              <Select 
                value={inArticleImagesCount.toString()} 
                onValueChange={(value) => onUpdate('inArticleImagesCount', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Select number of images --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Add Featured Image to Posts</Label>
              <Switch
                checked={addFeaturedImage}
                onCheckedChange={(checked) => onUpdate('addFeaturedImage', checked)}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Video Settings */}
      <div className="border rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium">Video Settings</h3>
        <p className="text-sm text-gray-500">Options for including relevant YouTube videos.</p>
        
        <div className="flex items-center justify-between">
          <Label>Automatically Embed Relevant YouTube Videos</Label>
          <Switch
            checked={embedYoutubeVideos}
            onCheckedChange={(checked) => onUpdate('embedYoutubeVideos', checked)}
          />
        </div>
      </div>
      
      {/* Text Formatting */}
      <div className="border rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium">Text Formatting</h3>
        <p className="text-sm text-gray-500">Choose which text formatting elements to include for readability.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label>Include Tables (if relevant)</Label>
            <Switch
              checked={includeTables}
              onCheckedChange={(checked) => onUpdate('includeTables', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Include Quotes/Blockquotes</Label>
            <Switch
              checked={includeQuotes}
              onCheckedChange={(checked) => onUpdate('includeQuotes', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Include Bullet/Numbered Lists</Label>
            <Switch
              checked={includeLists}
              onCheckedChange={(checked) => onUpdate('includeLists', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Use Bold Text for Emphasis</Label>
            <Switch
              checked={includeBoldText}
              onCheckedChange={(checked) => onUpdate('includeBoldText', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Use Italic Text for Emphasis</Label>
            <Switch
              checked={includeItalicText}
              onCheckedChange={(checked) => onUpdate('includeItalicText', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaFormattingStep;
