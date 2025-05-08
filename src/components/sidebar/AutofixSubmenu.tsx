
import React from 'react';
import { useLocation } from 'react-router-dom';
import SubmenuItem from './SubmenuItem';

const AutofixSubmenu = () => {
  const location = useLocation();
  
  return (
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
  );
};

export default AutofixSubmenu;
