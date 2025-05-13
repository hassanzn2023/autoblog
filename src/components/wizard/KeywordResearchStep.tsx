
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { 
  generateKeywordSuggestions, 
  generateSecondaryKeywordSuggestions, 
  KeywordSuggestion 
} from '@/services/openaiService';
import { Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface KeywordResearchStepProps {
  primaryKeyword: string;
  secondaryKeywords: string[];
  onUpdate: (field: string, value: any) => void;
  content: string;
  contentConfirmed: boolean;
}

const KeywordResearchStep: React.FC<KeywordResearchStepProps> = ({
  primaryKeyword,
  secondaryKeywords,
  onUpdate,
  content,
  contentConfirmed,
}) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const [isGeneratingPrimary, setIsGeneratingPrimary] = useState(false);
  const [isGeneratingSecondary, setIsGeneratingSecondary] = useState(false);
  const [regenerationNote, setRegenerationNote] = useState('');
  const [primaryKeywordSuggestions, setPrimaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  const [secondaryKeywordSuggestions, setSecondaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  
  // Remove auto-generate functionality to follow the exact flow requested
  
  const handleAddSecondaryKeyword = (keyword: string) => {
    if (secondaryKeywords.length < 7 && !secondaryKeywords.includes(keyword)) {
      onUpdate('secondaryKeywords', [...secondaryKeywords, keyword]);
    } else if (secondaryKeywords.includes(keyword)) {
      onUpdate('secondaryKeywords', secondaryKeywords.filter((k) => k !== keyword));
    }
  };

  // Function to generate primary keywords - only when explicitly requested
  const handleSuggestPrimary = async () => {
    if (!contentConfirmed || !content) {
      toast({
        title: "Content Required",
        description: "Please confirm your content before generating keywords.",
        variant: "destructive"
      });
      return;
    }
    
    // Check for user and workspace
    if (!user || !currentWorkspace) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to use this feature.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Starting primary keyword generation');
    console.log('User ID:', user.id);
    console.log('Workspace ID:', currentWorkspace.id);
    console.log('Content length:', content.length);
    
    try {
      setIsGeneratingPrimary(true);
      
      // Display toast to show we're generating keywords
      toast({
        title: "Generating Keywords",
        description: "Please wait while we analyze your content...",
      });
      
      const suggestions = await generateKeywordSuggestions(
        content, 
        3, 
        regenerationNote,
        user.id,
        currentWorkspace.id
      );
      
      console.log('Received keyword suggestions:', suggestions);
      
      setPrimaryKeywordSuggestions(suggestions);
      
      toast({
        title: "Keywords Generated",
        description: "Primary keyword suggestions have been generated successfully.",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Error generating primary keywords:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate keyword suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };

  // Function to generate secondary keywords - only when explicitly requested
  const handleSuggestSecondary = async () => {
    if (!contentConfirmed || !content) {
      toast({
        title: "Content Required",
        description: "Please confirm your content first.",
        variant: "destructive"
      });
      return;
    }
    
    // Check for user and workspace
    if (!user || !currentWorkspace) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to use this feature.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Starting secondary keyword generation');
    console.log('User ID:', user.id);
    console.log('Workspace ID:', currentWorkspace.id);
    console.log('Content length:', content.length);
    
    try {
      setIsGeneratingSecondary(true);
      
      // Display toast to show we're generating keywords
      toast({
        title: "Generating Secondary Keywords",
        description: "Please wait while we analyze your content...",
      });
      
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword,
        content,
        5,
        regenerationNote,
        user.id,
        currentWorkspace.id
      );
      
      console.log('Received secondary keyword suggestions:', suggestions);
      
      setSecondaryKeywordSuggestions(suggestions);
      
      toast({
        title: "Keywords Generated",
        description: "Secondary keyword suggestions have been generated successfully.",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Error generating secondary keywords:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate keyword suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSecondary(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir={/[\u0600-\u06FF]/.test(content) ? 'rtl' : 'ltr'}>
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
          disabled={isGeneratingPrimary || !contentConfirmed}
        >
          {isGeneratingPrimary ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>🔄</span> Generate Primary Keywords
            </>
          )}
        </Button>
        
        {primaryKeywordSuggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {primaryKeywordSuggestions.map((keyword) => (
                <div 
                  key={keyword.id}
                  className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                    primaryKeyword === keyword.text 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => onUpdate('primaryKeyword', keyword.text)}
                >
                  {keyword.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">Secondary Keywords</Label>
          <p className="text-sm text-gray-500">Selected Keywords (up to 7):</p>
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
          disabled={isGeneratingSecondary || !contentConfirmed}
        >
          {isGeneratingSecondary ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>🔄</span> Generate Secondary Keywords
            </>
          )}
        </Button>
        
        {secondaryKeywordSuggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-2">Suggestions (click to select):</p>
            <div className="flex flex-wrap gap-2">
              {secondaryKeywordSuggestions.map((keyword) => (
                <div 
                  key={keyword.id}
                  className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                    secondaryKeywords.includes(keyword.text) 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handleAddSecondaryKeyword(keyword.text)}
                >
                  {keyword.text}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(primaryKeywordSuggestions.length > 0 || secondaryKeywordSuggestions.length > 0) && (
          <div className="mt-4">
            <Label className="text-sm">Regeneration Note</Label>
            <div className="flex gap-2">
              <Input 
                type="text"
                placeholder="Add note for regeneration..."
                value={regenerationNote}
                onChange={(e) => setRegenerationNote(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (primaryKeywordSuggestions.length > 0) {
                    handleSuggestPrimary();
                  } else if (secondaryKeywordSuggestions.length > 0) {
                    handleSuggestSecondary();
                  }
                }}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordResearchStep;
