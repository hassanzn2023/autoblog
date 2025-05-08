
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  History, 
  BookOpen, 
  FileText,
  Pen,
  Sparkles
} from 'lucide-react';

import SidebarItem from './SidebarItem';
import AutoblogSubmenu from './AutoblogSubmenu';
import BlogSubmenu from './BlogSubmenu';
import AutofixSubmenu from './AutofixSubmenu';
import SidebarLogo from './SidebarLogo';
import WorkspaceSelector from './WorkspaceSelector';
import UpgradeButton from './UpgradeButton';

const Sidebar = () => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("autoblog");
  
  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <SidebarLogo />
      <WorkspaceSelector />
      
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <SidebarItem 
          icon={<Sparkles size={18} className={location.pathname === '/get-started' ? 'text-[#F76D01]' : 'text-gray-500'} />} 
          text="Get Started" 
          to="/get-started" 
          active={location.pathname === '/get-started'}
        />
        
        <SidebarItem 
          icon={<Home size={18} className="text-gray-500" />} 
          text="Home" 
          to="/" 
          active={location.pathname === '/'}
        />
        
        <SidebarItem 
          icon={<History size={18} className="text-gray-500" />} 
          text="History" 
          to="/history" 
          active={location.pathname === '/history'}
        />
        
        <SidebarItem 
          icon={<BookOpen size={18} className={location.pathname.includes('/autoblog') ? 'text-[#F76D01]' : 'text-gray-500'} />} 
          text="Auto Blog" 
          hasSubmenu 
          isSubmenuOpen={openSubmenu === "autoblog"}
          onToggleSubmenu={() => toggleSubmenu("autoblog")}
          active={location.pathname.includes('/autoblog')}
          textColor={location.pathname.includes('/autoblog') ? 'text-[#F76D01] font-medium' : 'text-gray-600'}
          onClick={undefined} // Remove the onClick handler to make it non-clickable
        />
        {openSubmenu === "autoblog" && <AutoblogSubmenu />}
        
        <SidebarItem 
          icon={<BookOpen size={18} className={location.pathname.includes('/blog') ? 'text-[#F76D01]' : 'text-gray-500'} />} 
          text="Blog" 
          hasSubmenu 
          isSubmenuOpen={openSubmenu === "blog"}
          onToggleSubmenu={() => toggleSubmenu("blog")}
          active={location.pathname.includes('/blog')}
          textColor={location.pathname.includes('/blog') ? 'text-[#F76D01] font-medium' : 'text-gray-600'}
        />
        {openSubmenu === "blog" && <BlogSubmenu />}
        
        <SidebarItem 
          icon={<FileText size={18} className={location.pathname.includes('/autofix') ? 'text-[#F76D01]' : 'text-gray-500'} />} 
          text="Auto Fix" 
          hasSubmenu 
          active={location.pathname.includes('/autofix')}
          isSubmenuOpen={openSubmenu === "autofix"}
          onToggleSubmenu={() => toggleSubmenu("autofix")}
          textColor={location.pathname.includes('/autofix') ? 'text-[#F76D01] font-medium' : 'text-gray-600'}
        />
        {openSubmenu === "autofix" && <AutofixSubmenu />}
        
        <SidebarItem 
          icon={<Pen size={18} className={location.pathname === '/writing-style' ? 'text-[#F76D01]' : 'text-gray-500'} />} 
          text="Writing Style" 
          to="/writing-style" 
          active={location.pathname === '/writing-style'}
        />
      </nav>
      
      <UpgradeButton />
    </div>
  );
};

export default Sidebar;
