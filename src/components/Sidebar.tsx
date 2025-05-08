
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  History, 
  Pen, 
  BookOpen, 
  Settings,
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Plus 
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  to?: string;
  active?: boolean;
  hasSubmenu?: boolean;
  isSubmenuOpen?: boolean;
  onToggleSubmenu?: () => void;
  textColor?: string;
}

const SidebarItem = ({ 
  icon, 
  text, 
  to = "#", 
  active = false, 
  hasSubmenu = false,
  isSubmenuOpen = false,
  onToggleSubmenu,
  textColor = 'text-gray-600'
}: SidebarItemProps) => (
  <div>
    {hasSubmenu ? (
      <button 
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${active ? 'bg-gray-100' : ''}`}
        onClick={onToggleSubmenu}
      >
        <div className={`flex items-center gap-2 ${active ? 'text-seo-purple font-medium' : textColor}`}>
          {icon}
          <span>{text}</span>
        </div>
        {isSubmenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    ) : (
      <Link to={to} className={`flex items-center gap-2 px-3 py-2 rounded-md ${active ? 'bg-gray-100 text-seo-purple font-medium' : textColor}`}>
        {icon}
        <span>{text}</span>
      </Link>
    )}
  </div>
);

interface SubmenuItemProps {
  text: string;
  to: string;
  active?: boolean;
  icon?: React.ReactNode;
}

const SubmenuItem = ({ text, to, active = false, icon }: SubmenuItemProps) => (
  <Link to={to} className={`flex items-center gap-2 pl-9 py-1.5 rounded-md ${active ? 'text-seo-purple font-medium' : 'text-gray-600'}`}>
    {icon}
    <span>{text}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("autofix");
  
  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <img src="/lovable-uploads/ed05de2c-aa25-4c40-90ae-28c373368e61.png" alt="Autommerce Logo" className="h-8" />
        <div className="font-semibold text-lg">Autommerce</div>
      </div>
      
      <div className="p-3 border-b border-gray-200">
        <button className="w-full flex items-center justify-between px-2 py-1 text-sm text-gray-600">
          <span>autommerce</span>
          <ChevronDown size={16} />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <SidebarItem 
          icon={<Home size={18} className={location.pathname === '/' ? 'text-seo-purple' : 'text-gray-500'} />} 
          text="Home" 
          to="/" 
          active={location.pathname === '/'}
        />
        
        <SidebarItem 
          icon={<History size={18} className={location.pathname === '/history' ? 'text-seo-purple' : 'text-gray-500'} />} 
          text="History" 
          to="/history" 
          active={location.pathname === '/history'}
        />
        
        <SidebarItem 
          icon={<BookOpen size={18} className={location.pathname.includes('/autoblog') ? 'text-seo-purple' : 'text-gray-500'} />} 
          text="Auto Blog" 
          hasSubmenu 
          isSubmenuOpen={openSubmenu === "autoblog"}
          onToggleSubmenu={() => toggleSubmenu("autoblog")}
          active={location.pathname.includes('/autoblog')}
          textColor={location.pathname.includes('/autoblog') ? 'text-seo-purple font-medium' : 'text-gray-600'}
        />
        {openSubmenu === "autoblog" && (
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
        )}
        
        <SidebarItem 
          icon={<BookOpen size={18} className={location.pathname.includes('/blog') ? 'text-seo-purple' : 'text-gray-500'} />} 
          text="Blog" 
          hasSubmenu 
          isSubmenuOpen={openSubmenu === "blog"}
          onToggleSubmenu={() => toggleSubmenu("blog")}
          active={location.pathname.includes('/blog')}
          textColor={location.pathname.includes('/blog') ? 'text-seo-purple font-medium' : 'text-gray-600'}
        />
        {openSubmenu === "blog" && (
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
        )}
        
        <SidebarItem 
          icon={<FileText size={18} className={location.pathname.includes('/autofix') ? 'text-seo-purple' : 'text-gray-500'} />} 
          text="Auto Fix" 
          hasSubmenu 
          active={['/autofix/modes', '/autofix/articles', '/seo-checker'].some(path => location.pathname.includes(path))}
          isSubmenuOpen={openSubmenu === "autofix"}
          onToggleSubmenu={() => toggleSubmenu("autofix")}
          textColor={location.pathname.includes('/autofix') ? 'text-seo-purple font-medium' : 'text-gray-600'}
        />
        {openSubmenu === "autofix" && (
          <div className="pl-2 mt-1 space-y-1">
            <SubmenuItem 
              text="Autofix Modes" 
              to="/autofix/modes" 
              active={location.pathname === '/autofix/modes'}
            />
            <SubmenuItem 
              text="Articles Optimized" 
              to="/autofix/articles" 
              active={location.pathname === '/autofix/articles'}
            />
          </div>
        )}
        
        <SidebarItem 
          icon={<Pen size={18} className={location.pathname === '/writing-style' ? 'text-seo-purple' : 'text-gray-500'} />} 
          text="Writing Style" 
          to="/writing-style" 
          active={location.pathname === '/writing-style'}
        />
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center gap-2 bg-[#F76D01] hover:bg-[#e65d00] text-white py-2 rounded-md">
          <Plus size={16} />
          <span>Upgrade now</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
