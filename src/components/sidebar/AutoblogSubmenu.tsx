
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SubmenuItem from './SubmenuItem';
import AutoblogCampaignModal from '@/components/autoblog/AutoblogCampaignModal';

const AutoblogSubmenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleCreateProject = () => {
    setIsModalOpen(true);
  };
  
  return (
    <div className="pl-2 mt-1 space-y-1">
      <button 
        onClick={handleCreateProject}
        className="flex items-center w-full text-sm py-2 px-6 rounded-md transition-colors bg-orange-50 hover:bg-orange-100 text-[#F76D01] font-medium"
      >
        <Plus size={16} className="mr-2" />
        <span>Create a project</span>
      </button>
      
      <SubmenuItem 
        text="Project list" 
        to="/autoblog/list" 
        active={location.pathname === '/autoblog/list'}
      />
      <SubmenuItem 
        text="Project Template" 
        to="/autoblog/template" 
        active={location.pathname === '/autoblog/template'}
      />
      
      <AutoblogCampaignModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AutoblogSubmenu;
