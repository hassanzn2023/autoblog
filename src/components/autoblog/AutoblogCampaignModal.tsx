
import React, { useState } from 'react';
import { X } from 'lucide-react';
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

interface AutoblogCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AutoblogCampaignModal: React.FC<AutoblogCampaignModalProps> = ({ isOpen, onClose }) => {
  const [campaignName, setCampaignName] = useState('');

  const handleCreate = () => {
    // Here you would handle the creation of a new campaign
    if (campaignName.trim()) {
      // Redirect to the configuration wizard for the new campaign
      window.location.href = `/autoblog/config/new?name=${encodeURIComponent(campaignName)}`;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Create a new campaign to manage your content generation.</p>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Label htmlFor="campaign-name" className="flex-shrink-0 w-24">Campaign Name</Label>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <Input
              id="campaign-name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              className="border-[#F76D01] focus-visible:ring-[#F76D01]"
            />
            <p className="text-xs text-gray-500 ml-24">This is purely for your reference...</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
            onClick={handleCreate}
            disabled={!campaignName.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoblogCampaignModal;
