
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, ChevronRight, Palette, Gift, MessageSquare, Key, Users, BarChart3, Lightbulb, Link as LinkIcon } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

type ThemeOption = 'comfort' | 'light' | 'dark';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>('comfort');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowThemeSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    setShowThemeSelector(false);
    
    // Apply theme changes to the application
    document.documentElement.classList.remove('theme-comfort', 'theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${newTheme}`);
  };

  const handleThemeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowThemeSelector(!showThemeSelector);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-yellow-400 font-medium" 
        onClick={() => setIsOpen(!isOpen)}
      >
        MA
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="font-medium">Malek</div>
            <div className="text-sm text-gray-500">malekalmout2016@gmail.com</div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-gray-500">Free Plan</span>
              <Link to="/billing" className="text-xs text-seo-purple ml-2 font-medium">Upgrade</Link>
            </div>
          </div>
          
          <div className="p-2">
            <div className="relative">
              <button 
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md"
                onClick={handleThemeClick}
              >
                <Palette size={18} className="text-gray-500" />
                <span>Theme</span>
                <span className="ml-auto">
                  <ChevronRight size={18} className="text-gray-400" />
                </span>
              </button>
              
              {showThemeSelector && (
                <ThemeSelector currentTheme={theme} onThemeChange={handleThemeChange} />
              )}
            </div>
            
            <Link to="/preferences" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Settings size={18} className="text-gray-500" />
              <span>Preferences</span>
            </Link>
            
            <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <User size={18} className="text-gray-500" />
              <span>Profile</span>
            </Link>
            
            <Link to="/usage" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <BarChart3 size={18} className="text-gray-500" />
              <span>Usage</span>
            </Link>
            
            <Link to="/billing" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Key size={18} className="text-gray-500" />
              <span>Plans and Billing</span>
            </Link>
            
            <Link to="/teams" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Users size={18} className="text-gray-500" />
              <span>Teams</span>
            </Link>
            
            <Link to="/integrations" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <LinkIcon size={18} className="text-gray-500" />
              <span>Integrations</span>
            </Link>
            
            <Link to="/api-dashboard" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Key size={18} className="text-gray-500" />
              <span>API Dashboard</span>
            </Link>
            
            <Link to="/benefits" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Gift size={18} className="text-gray-500" />
              <span>Win Additional Benefits</span>
            </Link>
            
            <Link to="/request-feature" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Lightbulb size={18} className="text-gray-500" />
              <span>Request a Feature</span>
            </Link>
            
            <Link to="/help" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <MessageSquare size={18} className="text-gray-500" />
              <span>Help Center</span>
            </Link>
            
            <Link to="/logout" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <LogOut size={18} className="text-gray-500" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
