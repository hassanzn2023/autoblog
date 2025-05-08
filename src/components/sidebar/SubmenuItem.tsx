
import React from 'react';
import { Link } from 'react-router-dom';

interface SubmenuItemProps {
  text: string;
  to: string;
  icon?: React.ReactNode;
  active: boolean;
}

const SubmenuItem = ({ text, to, icon, active }: SubmenuItemProps) => {
  return (
    <Link 
      to={to}
      className={`flex items-center text-sm py-1.5 px-4 rounded-md transition-colors ${
        active ? 
        'bg-orange-50 text-[#F76D01]' : 
        'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </Link>
  );
};

export default SubmenuItem;
