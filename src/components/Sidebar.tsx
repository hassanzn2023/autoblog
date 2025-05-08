
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  History, 
  Book, 
  BookOpen, 
  Edit, 
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
}

const SidebarItem = ({ 
  icon, 
  text, 
  to = "#", 
  active = false, 
  hasSubmenu = false,
  isSubmenuOpen = false,
  onToggleSubmenu
}: SidebarItemProps) => (
  <div>
    {hasSubmenu ? (
      <button 
        className={`sidebar-item w-full justify-between ${active ? 'active' : ''}`}
        onClick={onToggleSubmenu}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{text}</span>
        </div>
        {isSubmenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    ) : (
      <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
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
}

const SubmenuItem = ({ text, to, active = false }: SubmenuItemProps) => (
  <Link to={to} className={`sidebar-item py-1.5 ${active ? 'active' : ''}`}>
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
        <div className="h-8 w-8 bg-seo-purple text-white flex items-center justify-center rounded-md font-bold">
          WS
        </div>
        <div className="font-semibold text-lg">Writesonic</div>
      </div>
      
      <div className="p-3 border-b border-gray-200">
        <button className="w-full flex items-center justify-between px-2 py-1 text-sm text-gray-600">
          <span>autommerce</span>
          <ChevronDown size={16} />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <SidebarItem 
          icon={<Home size={18} />} 
          text="Home" 
          to="/" 
          active={location.pathname === '/'}
        />
        
        <SidebarItem 
          icon={<History size={18} />} 
          text="History" 
          to="/history" 
          active={location.pathname === '/history'}
        />
        
        <SidebarItem 
          icon={<BookOpen size={18} />} 
          text="Autoblog" 
          hasSubmenu 
          isSubmenuOpen={openSubmenu === "autoblog"}
          onToggleSubmenu={() => toggleSubmenu("autoblog")}
        />
        {openSubmenu === "autoblog" && (
          <div className="sidebar-submenu">
            <SubmenuItem 
              text="Create a project" 
              to="/autoblog/create" 
              active={location.pathname === '/autoblog/create'}
            />
          </div>
        )}
        
        <SidebarItem 
          icon={<Book size={18} />} 
          text="Blog" 
          hasSubmenu 
          isSubmenuOpen={openSubmenu === "blog"}
          onToggleSubmenu={() => toggleSubmenu("blog")}
        />
        {openSubmenu === "blog" && (
          <div className="sidebar-submenu">
            <SubmenuItem 
              text="Create a project" 
              to="/blog/create" 
              active={location.pathname === '/blog/create'}
            />
          </div>
        )}
        
        <SidebarItem 
          icon={<Edit size={18} />} 
          text="Auto fix" 
          hasSubmenu 
          active={['/autofix/modes', '/autofix/articles', '/seo-checker'].some(path => location.pathname.includes(path))}
          isSubmenuOpen={openSubmenu === "autofix"}
          onToggleSubmenu={() => toggleSubmenu("autofix")}
        />
        {openSubmenu === "autofix" && (
          <div className="sidebar-submenu">
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
          icon={<Edit size={18} />} 
          text="Writing Style" 
          to="/writing-style" 
          active={location.pathname === '/writing-style'}
        />
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button className="seo-button w-full flex items-center justify-center gap-2 bg-seo-purple/10 text-seo-purple hover:bg-seo-purple/20">
          <Plus size={16} />
          <span>Upgrade now</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
