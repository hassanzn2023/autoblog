
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AutoblogCampaignModal from './AutoblogCampaignModal';

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
    },
    {
      id: '2',
      name: 'قسنط',
      status: 'Off',
      nextBatch: '-',
      lastUpdated: 'May 6, 9:38 PM'
    }
  ];

  const handleRowClick = (campaignId: string) => {
    // Navigate to the campaign configuration wizard
    window.location.href = `/autoblog/config/${campaignId}`;
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">Campaigns & AutoBlogs</h1>
          <p className="text-gray-600">Campaigns define how your content is generated...</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Doc</Button>
            <Button variant="outline" size="sm">Tutorial</Button>
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#F76D01] hover:bg-[#e65d00] text-white"
          >
            + New Campaign
          </Button>
        </div>

        <Card className="overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">i</span>
                      Name
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AutoBlog</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      Last Updated
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr 
                    key={campaign.id} 
                    onClick={() => handleRowClick(campaign.id)} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {campaign.name}
                        {campaign.isDefault && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{campaign.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{campaign.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{campaign.nextBatch}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{campaign.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <AutoblogCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default AutoblogCampaigns;
