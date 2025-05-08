
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
  to,
  active = false,
  hasSubmenu = false,
  isSubmenuOpen = false,
  onToggleSubmenu,
  textColor = 'text-gray-600'
}: SidebarItemProps) => {
  
  const content = (
    <>
      {icon}
      <span className={textColor}>{text}</span>
      {hasSubmenu && (
        isSubmenuOpen ? 
          <ChevronUp size={18} className="ml-auto text-gray-400" /> : 
          <ChevronDown size={18} className="ml-auto text-gray-400" />
      )}
    </>
  );
  
  return (
    <div className="mb-1">
      {hasSubmenu ? (
        <button 
          className={`flex items-center w-full py-2 px-3 rounded-md ${active ? 'bg-orange-50' : 'hover:bg-gray-100'}`}
          onClick={onToggleSubmenu}
        >
          {content}
        </button>
      ) : (
        <Link 
          to={to || '#'} 
          className={`flex items-center w-full py-2 px-3 rounded-md ${active ? 'bg-orange-50' : 'hover:bg-gray-100'}`}
        >
          {content}
        </Link>
      )}
    </div>
  );
};

export default SidebarItem;
