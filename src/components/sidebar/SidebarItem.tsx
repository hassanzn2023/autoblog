
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
  onClick?: () => void;
}

const SidebarItem = ({
  icon,
  text,
  to,
  active = false,
  hasSubmenu = false,
  isSubmenuOpen = false,
  onToggleSubmenu,
  textColor = 'text-gray-600',
  onClick
}: SidebarItemProps) => {
  
  const content = (
    <>
      <span className="mr-3">{icon}</span>
      <span className={textColor}>{text}</span>
      {hasSubmenu && (
        <span className="ml-auto">
          {isSubmenuOpen ? 
            <ChevronUp size={18} className="text-gray-400" /> : 
            <ChevronDown size={18} className="text-gray-400" />
          }
        </span>
      )}
    </>
  );
  
  const handleItemClick = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      onToggleSubmenu?.();
    }
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <div className="mb-1">
      {hasSubmenu || onClick ? (
        <button 
          className={`flex items-center w-full py-2 px-3 rounded-md ${active ? 'bg-orange-50' : 'hover:bg-gray-100'}`}
          onClick={handleItemClick}
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
