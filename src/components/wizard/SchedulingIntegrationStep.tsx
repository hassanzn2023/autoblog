
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SchedulingIntegrationStepProps {
  configType: 'blog' | 'autoblog';
  integration: string;
  articlesPerBatch?: number;
  interval?: string;
  randomizePublishingTime?: boolean;
  publishStatus?: string;
  scheduledDate?: string;
  onUpdate: (field: string, value: any) => void;
}

const SchedulingIntegrationStep: React.FC<SchedulingIntegrationStepProps> = ({
  configType,
  integration,
  articlesPerBatch = 10,
  interval = 'weekly',
  randomizePublishingTime = false,
  publishStatus = 'draft',
  scheduledDate = '',
  onUpdate,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <Label>Integration (Publishing Destination):</Label>
        <Select value={integration} onValueChange={(value) => onUpdate('integration', value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select integration --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wordpress">WordPress</SelectItem>
            <SelectItem value="webflow">Webflow</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {configType === 'autoblog' ? (
        <>
          <div className="space-y-2">
            <Label>Articles Per Batch to Generate/Publish:</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={articlesPerBatch}
              onChange={(e) => onUpdate('articlesPerBatch', parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Interval for Batch:</Label>
            <Select value={interval} onValueChange={(value) => onUpdate('interval', value)}>
              <SelectTrigger>
                <SelectValue placeholder="-- Select interval --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Every Week</SelectItem>
                <SelectItem value="biweekly">Every Two Weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="manual">Manual (No schedule)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Randomize Publishing Time within the chosen day/interval</Label>
            <Switch
              checked={randomizePublishingTime}
              onCheckedChange={(checked) => onUpdate('randomizePublishingTime', checked)}
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Publish Status:</Label>
            <Select value={publishStatus} onValueChange={(value) => onUpdate('publishStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="-- Select status --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {publishStatus === 'scheduled' && (
            <div className="space-y-2">
              <Label>Schedule Date & Time:</Label>
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => onUpdate('scheduledDate', e.target.value)}
              />
            </div>
          )}
        </>
      )}
      
      {integration !== 'manual' && (
        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          WordPress specific settings (like API URL, Username, App Password) would appear here if not globally configured.
        </div>
      )}
    </div>
  );
};

export default SchedulingIntegrationStep;
