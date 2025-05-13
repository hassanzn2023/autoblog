
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { generateKeywordSuggestions, generateSecondaryKeywordSuggestions, KeywordSuggestion } from '@/services/openaiService';
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
  
  const handleAddSecondaryKeyword = (keyword: string) => {
    if (secondaryKeywords.length < 7 && !secondaryKeywords.includes(keyword)) {
      onUpdate('secondaryKeywords', [...secondaryKeywords, keyword]);
    } else if (secondaryKeywords.includes(keyword)) {
      onUpdate('secondaryKeywords', secondaryKeywords.filter((k) => k !== keyword));
    }
  };

  const handleSuggestPrimary = async () => {
    if (!contentConfirmed || !content) {
      toast({
        title: "Content Required",
        description: "Please confirm your content before generating keywords.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Starting primary keyword generation...");
      console.log("User auth state:", user?.id ? "Authenticated" : "Not authenticated");
      console.log("Current workspace:", currentWorkspace?.id || "No workspace");
      
      setIsGeneratingPrimary(true);
      
      // Ensure we have valid user and workspace data
      if (!user || !user.id) {
        console.log("No user ID available for keyword generation");
        toast({
          title: "Authentication Required",
          description: "Please ensure you're logged in to use this feature",
          variant: "destructive"
        });
        setIsGeneratingPrimary(false);
        return;
      }
      
      if (!currentWorkspace || !currentWorkspace.id) {
        console.log("No workspace ID available for keyword generation");
        toast({
          title: "Workspace Required",
          description: "Please ensure you have a valid workspace",
          variant: "destructive"
        });
        setIsGeneratingPrimary(false);
        return;
      }
      
      console.log("Calling generateKeywordSuggestions with:", {
        contentLength: content.length,
        userId: user.id,
        workspaceId: currentWorkspace.id
      });
      
      const suggestions = await generateKeywordSuggestions(
        content, 
        3, 
        regenerationNote,
        user.id,
        currentWorkspace.id
      );
      
      console.log("Keyword suggestions received:", suggestions);
      
      setPrimaryKeywordSuggestions(suggestions);
      
      if (suggestions.length > 0 && !primaryKeyword) {
        onUpdate('primaryKeyword', suggestions[0].text);
      }
      
      toast({
        title: "Keywords Generated",
        description: "Primary keyword suggestions have been generated successfully.",
      });
    } catch (error: any) {
      console.error("Error in handleSuggestPrimary:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate keyword suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };

  const handleSuggestSecondary = async () => {
    if (!contentConfirmed || !content) {
      toast({
        title: "Content Required",
        description: "Please confirm your content first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!primaryKeyword) {
      toast({
        title: "Primary Keyword Required",
        description: "Please select a primary keyword first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Starting secondary keyword generation...");
      console.log("User auth state:", user?.id ? "Authenticated" : "Not authenticated");
      console.log("Current workspace:", currentWorkspace?.id || "No workspace");
      
      setIsGeneratingSecondary(true);
      
      // Ensure we have valid user and workspace data
      if (!user || !user.id) {
        console.log("No user ID available for keyword generation");
        toast({
          title: "Authentication Required",
          description: "Please ensure you're logged in to use this feature",
          variant: "destructive"
        });
        setIsGeneratingSecondary(false);
        return;
      }
      
      if (!currentWorkspace || !currentWorkspace.id) {
        console.log("No workspace ID available for keyword generation");
        toast({
          title: "Workspace Required",
          description: "Please ensure you have a valid workspace",
          variant: "destructive"
        });
        setIsGeneratingSecondary(false);
        return;
      }
      
      console.log("Calling generateSecondaryKeywordSuggestions with:", {
        primaryKeyword,
        contentLength: content.length,
        userId: user.id,
        workspaceId: currentWorkspace.id
      });
      
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword,
        content,
        5,
        regenerationNote,
        user.id,
        currentWorkspace.id
      );
      
      console.log("Secondary keyword suggestions received:", suggestions);
      
      setSecondaryKeywordSuggestions(suggestions);
      
      toast({
        title: "Keywords Generated",
        description: "Secondary keyword suggestions have been generated successfully.",
      });
    } catch (error: any) {
      console.error("Error in handleSuggestSecondary:", error);
      toast({
        title: "Error",
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
              <span>🔄</span> Suggest Primary Keywords
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
          disabled={isGeneratingSecondary || !primaryKeyword || !contentConfirmed}
        >
          {isGeneratingSecondary ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>🔄</span> Suggest Secondary Keywords
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
