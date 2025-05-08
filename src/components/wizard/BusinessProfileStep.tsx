
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ArticleTypeOption {
  id: string;
  label: string;
  recommended?: boolean;
}

interface BusinessProfileStepProps {
  businessType: string;
  articleType: string;
  readerLevel: string;
  contentGoals: string;
  onUpdate: (field: string, value: string) => void;
}

const BusinessProfileStep: React.FC<BusinessProfileStepProps> = ({
  businessType,
  articleType,
  readerLevel,
  contentGoals,
  onUpdate,
}) => {
  const articleTypes: ArticleTypeOption[] = [
    { id: 'news', label: 'News Articles' },
    { id: 'blog', label: 'Blog Posts', recommended: true },
    { id: 'how-to', label: 'How-To Guides' },
    { id: 'listicles', label: 'Listicles' },
    { id: 'comparison', label: 'Comparison Blogs' },
    { id: 'technical', label: 'Technical Articles' },
    { id: 'reviews', label: 'Product Reviews' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <Label>Business Type Mode:</Label>
        <Select value={businessType} onValueChange={(value) => onUpdate('businessType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select a business type --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newsroom">Newsroom</SelectItem>
            <SelectItem value="ecommerce">Ecommerce</SelectItem>
            <SelectItem value="blogger">Blogger</SelectItem>
            <SelectItem value="agency">Agency</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Article Type:</Label>
        <div className="flex flex-wrap gap-2">
          {articleTypes.map((type) => (
            <button
              key={type.id}
              className={`px-4 py-2 rounded-full transition-all ${
                articleType === type.id 
                  ? 'bg-[#F76D01] text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => onUpdate('articleType', type.id)}
            >
              {type.label}
              {type.recommended && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-1 rounded">Recommended</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Level of Readers:</Label>
        <Select value={readerLevel} onValueChange={(value) => onUpdate('readerLevel', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select reader level --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginners">Beginners</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="mixed">Mixed Audience</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Your Content Goals:</Label>
        <Textarea
          placeholder="e.g., Increase brand awareness, drive traffic, generate leads..."
          value={contentGoals}
          onChange={(e) => onUpdate('contentGoals', e.target.value)}
          rows={5}
        />
      </div>
    </div>
  );
};

export default BusinessProfileStep;
