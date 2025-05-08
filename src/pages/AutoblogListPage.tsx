
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface Campaign {
  id: string;
  name: string;
  isDefault?: boolean;
  status: 'Active' | 'Off';
  nextBatch: string;
  lastUpdated: string;
}

const AutoblogListPage = () => {
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

  const handleCreateNew = () => {
    navigate('/autoblog/create');
  };
  
  const handleRowClick = (campaignId: string) => {
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
    <div className="w-full bg-white p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Autoblog Campaigns</h1>
            <p className="text-gray-600">Manage and monitor your autoblogging campaigns</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Documentation
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Tutorial
            </Button>
            <Button
              variant="default"
              className="bg-[#F76D01] hover:bg-[#e65d00] flex items-center gap-2"
              onClick={handleCreateNew}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              New Campaign
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 uppercase text-xs font-medium text-gray-500">
                <TableHead className="py-3 px-4">Name</TableHead>
                <TableHead className="py-3 px-4">Autoblog</TableHead>
                <TableHead className="py-3 px-4">Status</TableHead>
                <TableHead className="py-3 px-4">Next batch</TableHead>
                <TableHead className="py-3 px-4">Last updated</TableHead>
                <TableHead className="py-3 px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow 
                  key={campaign.id} 
                  onClick={() => handleRowClick(campaign.id)} 
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">{campaign.name}</span>
                      {campaign.isDefault && (
                        <Badge className="ml-2 bg-gray-100 text-gray-600 hover:bg-gray-200">
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    {campaign.status === 'Active' ? 
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge> : 
                      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">Off</Badge>
                    }
                  </TableCell>
                  <TableCell className="py-4 px-4">
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
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-600">{campaign.nextBatch}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-600">{campaign.lastUpdated}</TableCell>
                  <TableCell className="py-4 px-4 text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AutoblogListPage;
