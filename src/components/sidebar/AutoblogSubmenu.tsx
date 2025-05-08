
import React from 'react';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SubmenuItem from './SubmenuItem';

const AutoblogSubmenu = () => {
  const location = useLocation();
  
  return (
    <div className="pl-2 mt-1 space-y-1">
      <SubmenuItem 
        text="Create a project" 
        to="/autoblog/create"
        icon={<Plus size={16} className="text-gray-500" />}
        active={location.pathname === '/autoblog/create'}
      />
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
    </div>
  );
};

export default AutoblogSubmenu;
