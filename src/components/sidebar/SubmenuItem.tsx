
import React from 'react';
import { Link } from 'react-router-dom';

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

export default SubmenuItem;
