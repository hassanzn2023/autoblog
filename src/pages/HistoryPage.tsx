
import React, { useState } from 'react';
import { Search, FolderOpen, List } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HISTORY_DATA = [
  {
    id: 1,
    title: 'SEO Content Plan for E-commerce',
    owner: 'Malek A.',
    type: 'Document',
    status: 'Completed',
    lastEdited: '2 hours ago'
  },
  {
    id: 2,
    title: 'Product Description - Smart Watch',
    owner: 'Malek A.',
    type: 'Copy',
    status: 'In Progress',
    lastEdited: '5 hours ago'
  },
  {
    id: 3,
    title: 'Blog Post: AI in Marketing',
    owner: 'Malek A.',
    type: 'Document',
    status: 'Completed',
    lastEdited: '1 day ago'
  },
  {
    id: 4,
    title: 'Email Campaign - Summer Sale',
    owner: 'Malek A.',
    type: 'Copy',
    status: 'Completed',
    lastEdited: '2 days ago'
  },
  {
    id: 5,
    title: 'Landing Page Content',
    owner: 'Malek A.',
    type: 'Document',
    status: 'Draft',
    lastEdited: '3 days ago'
  }
];

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'folders'>('history');
  const [viewMode, setViewMode] = useState<'folder' | 'list'>('folder');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      
      <div className="flex items-center space-x-2 mb-6">
        <div
          className={`text-sm cursor-pointer ${activeTab === 'history' ? 'text-seo-purple font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </div>
        <div className="text-gray-500">/</div>
        <div
          className={`text-sm cursor-pointer ${activeTab === 'folders' ? 'text-seo-purple font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('folders')}
        >
          Folders
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'folder' ? "default" : "outline"}
            className={viewMode === 'folder' ? "bg-seo-purple hover:bg-seo-purple/90" : ""}
            size="sm"
            onClick={() => setViewMode('folder')}
          >
            <FolderOpen size={16} className="mr-1" />
            Folder view
          </Button>
          
          <Button
            variant={viewMode === 'list' ? "default" : "outline"}
            className={viewMode === 'list' ? "bg-seo-purple hover:bg-seo-purple/90" : ""}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List size={16} className="mr-1" />
            List view
          </Button>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Search file for folder" 
            className="pl-8" 
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-2 flex">
          <div
            className={`px-4 py-2 cursor-pointer text-sm font-medium transition-colors ${
              activeTab === 'history' ? 'text-seo-purple border-b-2 border-seo-purple' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </div>
          
          <div
            className={`px-4 py-2 cursor-pointer text-sm font-medium transition-colors ${
              activeTab === 'folders' ? 'text-seo-purple border-b-2 border-seo-purple' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('folders')}
          >
            Folders
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last edited</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HISTORY_DATA.map((item) => (
              <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(item.status)}`}></div>
                    {item.status}
                  </div>
                </TableCell>
                <TableCell>{item.lastEdited}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HistoryPage;
