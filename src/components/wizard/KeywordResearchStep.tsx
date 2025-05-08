
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface KeywordResearchStepProps {
  primaryKeyword: string;
  secondaryKeywords: string[];
  onUpdate: (field: string, value: any) => void;
}

const KeywordResearchStep: React.FC<KeywordResearchStepProps> = ({
  primaryKeyword,
  secondaryKeywords,
  onUpdate,
}) => {
  const handleAddSecondaryKeyword = () => {
    // This would add a new secondary keyword in a real implementation
    onUpdate('secondaryKeywords', [...secondaryKeywords, '']);
  };

  const handleSuggestPrimary = () => {
    // This would trigger an AI suggestion in a real implementation
    console.log('Suggesting primary keywords...');
  };

  const handleSuggestSecondary = () => {
    // This would trigger an AI suggestion in a real implementation
    console.log('Suggesting secondary keywords...');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">Primary Keyword</Label>
          <p className="text-sm text-gray-500">Your Primary Keyword:</p>
          <Input
            type="text"
            value={primaryKeyword}
            onChange={(e) => onUpdate('primaryKeyword', e.target.value)}
            placeholder="Enter your primary keyword"
            className="w-full"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleSuggestPrimary}
          className="flex items-center gap-2 mt-1"
        >
          <span>🔄</span> Suggest Primary Keywords
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">Secondary Keywords</Label>
          <p className="text-sm text-gray-500">Manually Add (up to 7):</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {secondaryKeywords.map((keyword, index) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                {keyword}
                <button 
                  onClick={() => {
                    const updatedKeywords = secondaryKeywords.filter((_, i) => i !== index);
                    onUpdate('secondaryKeywords', updatedKeywords);
                  }} 
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-dashed border-gray-300 text-purple-600"
              size="sm"
              onClick={handleAddSecondaryKeyword}
            >
              + Add Keyword
            </Button>
            <p className="text-xs text-gray-500">
              {secondaryKeywords.length} of 7 added
            </p>
          </div>
        </div>
        
        <Button
          type="button" 
          variant="outline"
          onClick={handleSuggestSecondary}
          className="flex items-center gap-2 mt-1"
        >
          <span>🔄</span> Suggest Secondary Keywords
        </Button>
      </div>
    </div>
  );
};

export default KeywordResearchStep;
