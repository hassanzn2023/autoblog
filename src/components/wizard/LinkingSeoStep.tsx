
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LinkingSeoStepProps {
  enableInternalLinking: boolean;
  internalLinksCount: number;
  sitemapUrl: string;
  enableExternalLinking: boolean;
  externalLinksCount: number | 'automatic';
  automateExternalLinkSelection: boolean;
  includeExternalSources: string;
  excludeExternalSources: string;
  enableTargetPages: boolean;
  autoAssignWordPressCategory: boolean;
  onUpdate: (field: string, value: any) => void;
}

const LinkingSeoStep: React.FC<LinkingSeoStepProps> = ({
  enableInternalLinking,
  internalLinksCount,
  sitemapUrl,
  enableExternalLinking,
  externalLinksCount,
  automateExternalLinkSelection,
  includeExternalSources,
  excludeExternalSources,
  enableTargetPages,
  autoAssignWordPressCategory,
  onUpdate,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Internal Linking Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Enable Internal Linking</Label>
            <p className="text-sm text-gray-500">Allow AI to add internal links to your content.</p>
          </div>
          <Switch
            checked={enableInternalLinking}
            onCheckedChange={(checked) => onUpdate('enableInternalLinking', checked)}
          />
        </div>
        
        {enableInternalLinking && (
          <>
            <div className="space-y-2">
              <Label>Number of Internal Links per article:</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={internalLinksCount}
                onChange={(e) => onUpdate('internalLinksCount', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Internal Link Sitemap Config (Optional URL):</Label>
              <Input
                type="url"
                placeholder="e.g. https://example.com/sitemap.xml"
                value={sitemapUrl}
                onChange={(e) => onUpdate('sitemapUrl', e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* External Linking Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Enable External Linking</Label>
            <p className="text-sm text-gray-500">Allow AI to add external links to relevant sources.</p>
          </div>
          <Switch
            checked={enableExternalLinking}
            onCheckedChange={(checked) => onUpdate('enableExternalLinking', checked)}
          />
        </div>
        
        {enableExternalLinking && (
          <>
            <div className="flex items-center justify-between pt-2">
              <Label>Automate External Link Selection by AI</Label>
              <Switch
                checked={automateExternalLinkSelection}
                onCheckedChange={(checked) => onUpdate('automateExternalLinkSelection', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of External Links per article:</Label>
              <Select 
                value={typeof externalLinksCount === 'number' ? externalLinksCount.toString() : externalLinksCount} 
                onValueChange={(value) => {
                  const parsedValue = value === 'automatic' ? 'automatic' : parseInt(value);
                  onUpdate('externalLinksCount', parsedValue);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Select number or automatic --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Include External Sources (one URL/domain per line, optional):</Label>
              <Textarea
                placeholder="https://domain1.com&#10;domain2.com"
                value={includeExternalSources}
                onChange={(e) => onUpdate('includeExternalSources', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500">AI will prioritize linking to these sources.</p>
            </div>

            <div className="space-y-2">
              <Label>Exclude External Sources (one URL/domain per line, optional):</Label>
              <Textarea
                placeholder="https://badsite.com&#10;competitor.com"
                value={excludeExternalSources}
                onChange={(e) => onUpdate('excludeExternalSources', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500">AI will avoid linking to these sources.</p>
            </div>
          </>
        )}
      </div>

      {/* Target Pages Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Link to specific Target Pages (Your Website)</Label>
            <p className="text-sm text-gray-500">Provide specific URLs for prioritized internal linking.</p>
          </div>
          <Switch
            checked={enableTargetPages}
            onCheckedChange={(checked) => onUpdate('enableTargetPages', checked)}
          />
        </div>
      </div>

      {/* WordPress Category Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Auto-Assign WordPress Category/Tags</Label>
            <p className="text-sm text-gray-500">If publishing to WordPress, attempt to assign categories/tags.</p>
          </div>
          <Switch
            checked={autoAssignWordPressCategory}
            onCheckedChange={(checked) => onUpdate('autoAssignWordPressCategory', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default LinkingSeoStep;
