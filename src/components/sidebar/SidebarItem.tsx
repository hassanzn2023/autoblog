
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

export default SidebarItem;
