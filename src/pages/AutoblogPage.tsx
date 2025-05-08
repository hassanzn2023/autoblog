
import React, { useState } from 'react';
import AutoblogCampaigns from '@/components/autoblog/AutoblogCampaigns';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AutoblogCampaignModal from '@/components/autoblog/AutoblogCampaignModal';

const AutoblogPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full bg-gray-50 px-6 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Autoblog Campaigns</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your autoblogging campaigns</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.open('https://docs.lovable.dev/user-guides/autoblog', '_blank')}
            >
              <FileText size={16} />
              Documentation
            </Button>
            <Button
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.open('https://www.youtube.com/watch?v=example', '_blank')}
            >
              <Lightbulb size={16} />
              Tutorial
            </Button>
            <Button 
              className="bg-[#F76D01] hover:bg-[#e65d00] text-white flex items-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle size={16} />
              New Campaign
            </Button>
          </div>
        </div>
        
        <AutoblogCampaigns />
      </div>

      <AutoblogCampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default AutoblogPage;
