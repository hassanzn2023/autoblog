
import React from 'react';
import { Button } from '@/components/ui/button';

interface Campaign {
  id: string;
  name: string;
  isDefault?: boolean;
  status: 'Active' | 'Off';
  nextBatch: string;
  lastUpdated: string;
}

const AutoblogCampaigns = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Default Campaign',
      isDefault: true,
      status: 'Off',
      nextBatch: '-',
      lastUpdated: 'Jan 2, 10:44 AM'
    }
  ];

  const handleRowClick = (campaignId: string) => {
    // Navigate to the campaign configuration wizard
    window.location.href = `/autoblog/config/${campaignId}`;
  };

  return (
    <div className="w-full p-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Campaigns & AutoBlogs</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">Campaigns define how your content is generated...</p>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-md">
              Doc
            </Button>
            <Button variant="outline" size="sm" className="rounded-md">
              Tutorial
            </Button>
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-[#F76D01] hover:bg-[#e65d00] text-white ml-4"
            >
              New Campaign
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Autoblog</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Next Batch</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm uppercase">Last Updated</th>
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
                      {campaign.name}
                      {campaign.isDefault && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Default
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">Off</td>
                  <td className="py-4 px-4">{campaign.status}</td>
                  <td className="py-4 px-4">{campaign.nextBatch}</td>
                  <td className="py-4 px-4">{campaign.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AutoblogCampaigns;
