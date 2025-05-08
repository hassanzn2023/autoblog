
import React, { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface AutoblogCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AutoblogCampaignModal: React.FC<AutoblogCampaignModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    // Here you would handle the creation of a new campaign
    if (campaignName.trim()) {
      // Instead of using window.location, use navigate for clean SPA navigation
      navigate(`/autoblog/config/new?name=${encodeURIComponent(campaignName)}`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Campaign</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-700">
              Create a campaign to start generating automatic content for your blog.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Label htmlFor="campaign-name" className="text-sm font-medium">
              Campaign Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="campaign-name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500">Choose a name that describes the purpose of this campaign</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="campaign-description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="campaign-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this campaign will do"
              className="border-gray-300"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            onClick={handleCreate}
            disabled={!campaignName.trim()}
          >
            Create & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoblogCampaignModal;
