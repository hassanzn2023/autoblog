
import React from 'react';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SubmenuItem from './SubmenuItem';

const BlogSubmenu = () => {
  const location = useLocation();
  
  return (
    <div className="pl-2 mt-1 space-y-1">
      <SubmenuItem 
        text="Create a project" 
        to="/blog/create"
        icon={<Plus size={16} className="text-gray-500" />}
        active={location.pathname === '/blog/create'}
      />
      <SubmenuItem 
        text="All Articles" 
        to="/blog/articles" 
        active={location.pathname === '/blog/articles'}
      />
      <SubmenuItem 
        text="Setting Template" 
        to="/blog/template" 
        active={location.pathname === '/blog/template'}
      />
    </div>
  );
};

export default BlogSubmenu;
