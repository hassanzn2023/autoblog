
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, Save } from 'lucide-react';
import { useAPIKeys } from '@/contexts/APIKeysContext';

interface APIKeyInputProps {
  type: 'openai' | 'google_lens';
  title: string;
  description: string;
  placeholder: string;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({
  type,
  title,
  description,
  placeholder
}) => {
  const { apiKeys, saveAPIKey, getAPIKey } = useAPIKeys();
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const existingKey = getAPIKey(type);
  const hasStoredKey = !!existingKey;

  const handleSave = async () => {
    if (!apiKey.trim() && !hasStoredKey) return;
    
    setIsSaving(true);
    await saveAPIKey(type, apiKey.trim() || (existingKey?.api_key || ''));
    setIsSaving(false);
    setApiKey('');
    setIsVisible(false);
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-md font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {hasStoredKey && (
          <div className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full flex items-center">
            Active
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={isVisible ? "text" : "password"}
            placeholder={hasStoredKey ? "••••••••••••••••••••••" : placeholder}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || (!apiKey.trim() && !hasStoredKey)}
        >
          {isSaving ? "Saving..." : (hasStoredKey ? "Update" : "Save")}
        </Button>
      </div>
      
      {!hasStoredKey && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertCircle size={16} />
          <span>Required for {type === 'openai' ? 'AI-powered features' : 'image analysis'}</span>
        </div>
      )}
    </div>
  );
};

export default APIKeyInput;
