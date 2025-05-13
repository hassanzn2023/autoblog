import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  generateKeywordSuggestions, // For Primary
  generateSecondaryKeywordSuggestions, // For Secondary
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

  const [primaryRegenerationNote, setPrimaryRegenerationNote] = useState('');
  const [secondaryRegenerationNote, setSecondaryRegenerationNote] = useState('');

  const [primaryKeywordSuggestions, setPrimaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  const [secondaryKeywordSuggestions, setSecondaryKeywordSuggestions] = useState<KeywordSuggestion[]>([]);

  const handleAddSecondaryKeyword = (keyword: string) => {
    const currentSecondary = secondaryKeywords || [];
    if (currentSecondary.length < 7 && !currentSecondary.includes(keyword)) {
      onUpdate('secondaryKeywords', [...currentSecondary, keyword]);
    } else if (currentSecondary.includes(keyword)) {
      onUpdate('secondaryKeywords', currentSecondary.filter((k) => k !== keyword));
    }
  };

  const handleSuggestPrimaryKeywords = async (isRegeneration: boolean = false) => {
    if (!contentConfirmed || !content) {
      toast({
        title: "Content Required",
        description: "Please confirm your article content first before suggesting keywords.",
        variant: "destructive"
      });
      return;
    }
    if (!user || !currentWorkspace) {
      toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsGeneratingPrimary(true);
    toast({ 
      title: isRegeneration ? "Re-generating Primary Keywords" : "Suggesting Primary Keywords", 
      description: "Analyzing content..." 
    });

    try {
      const noteToSend = isRegeneration ? primaryRegenerationNote : '';
      const suggestions = await generateKeywordSuggestions(
        content,
        3, // 3 primary keywords
        noteToSend,
        user.id,
        currentWorkspace.id
      );
      setPrimaryKeywordSuggestions(suggestions);
      toast({
        title: "Primary Suggestions Ready",
        description: "Primary keyword suggestions have been generated.",
        variant: "success"
      });
      if (isRegeneration) setPrimaryRegenerationNote('');
    } catch (error: any) {
      console.error("Error suggesting/regenerating primary keywords:", error);
      toast({ 
        title: "Primary Suggestion Failed", 
        description: error.message || "Failed to process primary keywords.", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingPrimary(false);
    }
  };

  const handleSuggestSecondaryKeywords = async (isRegeneration: boolean = false) => {
    if (!contentConfirmed || !content) {
      toast({
        title: "Content Required",
        description: "Please confirm your article content first before suggesting keywords.",
        variant: "destructive"
      });
      return;
    }
    if (!user || !currentWorkspace) {
      toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsGeneratingSecondary(true);
    toast({ 
      title: isRegeneration ? "Re-generating Secondary Keywords" : "Suggesting Secondary Keywords", 
      description: "Analyzing content..." 
    });

    try {
      const noteToSend = isRegeneration ? secondaryRegenerationNote : '';
      const suggestions = await generateSecondaryKeywordSuggestions(
        primaryKeyword || '', // Send primary keyword if available, otherwise empty string
        content,
        5, // 5 secondary keywords
        noteToSend,
        user.id,
        currentWorkspace.id
      );
      setSecondaryKeywordSuggestions(suggestions);
      toast({
        title: "Secondary Suggestions Ready",
        description: "Secondary keyword suggestions have been generated.",
        variant: "success"
      });
      if (isRegeneration) setSecondaryRegenerationNote('');
    } catch (error: any) {
      console.error("Error suggesting/regenerating secondary keywords:", error);
      toast({ 
        title: "Secondary Suggestion Failed", 
        description: error.message || "Failed to process secondary keywords.", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingSecondary(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir={/[\u0600-\u06FF]/.test(content) ? 'rtl' : 'ltr'}>
      {/* Primary Keywords Section */}
      <div className="space-y-4 p-4 border rounded-md shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="primaryKeywordInput" className="text-lg font-semibold text-gray-800 dark:text-gray-200">Primary Keyword</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your main keyword or let us suggest one based on your article.
          </p>
          <Input
            id="primaryKeywordInput"
            type="text"
            value={primaryKeyword}
            onChange={(e) => onUpdate('primaryKeyword', e.target.value)}
            placeholder="e.g., digital marketing strategies"
            className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            disabled={isGeneratingPrimary}
          />
        </div>

        <Button
          type="button"
          variant="default"
          onClick={() => handleSuggestPrimaryKeywords(false)}
          className="flex items-center gap-2 mt-1 w-full sm:w-auto"
          disabled={!contentConfirmed || isGeneratingPrimary || isGeneratingSecondary}
        >
          {isGeneratingPrimary ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Suggesting...</span>
            </>
          ) : (
            "Suggest Primary Keywords (3)"
          )}
        </Button>

        {primaryKeywordSuggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestions (select one):</p>
            <div className="flex flex-wrap gap-2">
              {primaryKeywordSuggestions.map((keyword) => (
                <div
                  key={keyword.id}
                  className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-150 ease-in-out ${
                    primaryKeyword === keyword.text
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                  }`}
                  onClick={() => {
                    if (!isGeneratingPrimary) onUpdate('primaryKeyword', keyword.text);
                  }}
                >
                  {keyword.text}
                </div>
              ))}
            </div>
            {/* Primary Keywords Regeneration Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label htmlFor="primaryRegenNote" className="text-sm font-medium text-gray-700 dark:text-gray-300">Refine Primary Suggestions:</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Add a note for more targeted primary keyword suggestions.</p>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Input
                  id="primaryRegenNote"
                  type="text"
                  placeholder="e.g., focus on AI in marketing"
                  value={primaryRegenerationNote}
                  onChange={(e) => setPrimaryRegenerationNote(e.target.value)}
                  className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={isGeneratingPrimary}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestPrimaryKeywords(true)}
                  disabled={isGeneratingPrimary || !contentConfirmed || !primaryRegenerationNote.trim()}
                  className="w-full sm:w-auto"
                >
                  {isGeneratingPrimary ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    "Re-generate Primary"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Keywords Section */}
      <div className="space-y-4 p-4 border rounded-md shadow-sm">
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Secondary Keywords</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add supporting keywords manually or get suggestions. Select up to 7.
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Keywords ({secondaryKeywords.length} of 7):</p>
          <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border rounded-md bg-gray-50 dark:bg-gray-700">
            {secondaryKeywords.length === 0 && !isGeneratingSecondary && (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">No secondary keywords selected.</p>
            )}
            {secondaryKeywords.map((keyword, index) => (
              <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center shadow-sm">
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isGeneratingSecondary) {
                      const updatedKeywords = secondaryKeywords.filter((_, i) => i !== index);
                      onUpdate('secondaryKeywords', updatedKeywords);
                    }
                  }}
                  className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                  aria-label={`Remove ${keyword}`}
                  disabled={isGeneratingSecondary}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="default"
          onClick={() => handleSuggestSecondaryKeywords(false)}
          className="flex items-center gap-2 mt-1 w-full sm:w-auto"
          disabled={!contentConfirmed || isGeneratingSecondary || isGeneratingPrimary}
        >
          {isGeneratingSecondary ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Suggesting...</span>
            </>
          ) : (
            "Suggest Secondary Keywords (5)"
          )}
        </Button>

        {secondaryKeywordSuggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestions (click to add/remove, up to 7):</p>
            <div className="flex flex-wrap gap-2">
              {secondaryKeywordSuggestions.map((keyword) => (
                <div
                  key={keyword.id}
                  className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-150 ease-in-out ${
                    secondaryKeywords.includes(keyword.text)
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                  }`}
                  onClick={() => {
                    if (!isGeneratingSecondary) handleAddSecondaryKeyword(keyword.text);
                  }}
                >
                  {keyword.text}
                </div>
              ))}
            </div>
            {/* Secondary Keywords Regeneration Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label htmlFor="secondaryRegenNote" className="text-sm font-medium text-gray-700 dark:text-gray-300">Refine Secondary Suggestions:</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Add a note for more targeted secondary keyword suggestions.</p>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Input
                  id="secondaryRegenNote"
                  type="text"
                  placeholder="e.g., long-tail, for beginners"
                  value={secondaryRegenerationNote}
                  onChange={(e) => setSecondaryRegenerationNote(e.target.value)}
                  className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={isGeneratingSecondary}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestSecondaryKeywords(true)}
                  disabled={isGeneratingSecondary || !contentConfirmed || !secondaryRegenerationNote.trim()}
                  className="w-full sm:w-auto"
                >
                  {isGeneratingSecondary ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    "Re-generate Secondary"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordResearchStep;