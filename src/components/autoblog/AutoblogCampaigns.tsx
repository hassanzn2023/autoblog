
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Play, PauseCircle, Settings, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: string;
  name: string;
  isDefault?: boolean;
  status: 'Active' | 'Off';
  nextBatch: string;
  lastUpdated: string;
}

const AutoblogCampaigns = () => {
  const navigate = useNavigate();
  
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Default Campaign',
      isDefault: true,
      status: 'Off',
      nextBatch: '-',
      lastUpdated: 'Jan 2, 10:44 AM'
    },
    {
      id: '2',
      name: 'Technology News',
      status: 'Active',
      nextBatch: 'Tomorrow, 9:00 AM',
      lastUpdated: 'May 1, 2:15 PM'
    },
    {
      id: '3',
      name: 'Health & Wellness',
      status: 'Active',
      nextBatch: 'Today, 8:00 PM',
      lastUpdated: 'May 5, 11:30 AM'
    }
  ];

  const handleRowClick = (campaignId: string) => {
    // Navigate to the campaign configuration wizard
    navigate(`/autoblog/config/${campaignId}`);
  };

  const toggleStatus = (e: React.MouseEvent, campaignId: string, currentStatus: string) => {
    e.stopPropagation();
    // Here you would implement the logic to toggle campaign status
    console.log(`Toggling campaign ${campaignId} from ${currentStatus}`);
  };

  const handleEditSettings = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    navigate(`/autoblog/config/${campaignId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Name</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Autoblog</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Status</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Next Batch</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Last Updated</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr 
                key={campaign.id} 
                onClick={() => handleRowClick(campaign.id)} 
                className="hover:bg-gray-50 cursor-pointer transition-colors border-b"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700">{campaign.name}</span>
                    {campaign.isDefault && (
                      <Badge className="ml-2 bg-gray-100 text-gray-600 hover:bg-gray-200">
                        Default
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {campaign.status === 'Active' ? 
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge> : 
                    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">Off</Badge>
                  }
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full p-0 h-8 w-8 ${campaign.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}
                      onClick={(e) => toggleStatus(e, campaign.id, campaign.status)}
                    >
                      {campaign.status === 'Active' ? <PauseCircle size={18} /> : <Play size={18} />}
                    </Button>
                    <span className="ml-2">{campaign.status}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{campaign.nextBatch}</td>
                <td className="py-4 px-4 text-gray-600">{campaign.lastUpdated}</td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full p-0 h-8 w-8"
                      onClick={(e) => handleEditSettings(e, campaign.id)}
                    >
                      <Settings size={16} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full p-0 h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Analytics</DropdownMenuItem>
                        <DropdownMenuItem>Export Data</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AutoblogCampaigns;
