
import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronRight, Palette, Gift, MessageSquareHelp, Key, Users, Line, BarChart3, Lightbulb } from 'lucide-react';
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
    // This is where you would implement actual theme switching logic
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
              <a href="#" className="text-xs text-seo-purple ml-2 font-medium">Upgrade</a>
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
            
            <a href="/preferences" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Settings size={18} className="text-gray-500" />
              <span>Preferences</span>
            </a>
            
            <a href="/profile" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <User size={18} className="text-gray-500" />
              <span>Profile</span>
            </a>
            
            <a href="/usage" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <BarChart3 size={18} className="text-gray-500" />
              <span>Usage</span>
            </a>
            
            <a href="/billing" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Key size={18} className="text-gray-500" />
              <span>Plans and Billing</span>
            </a>
            
            <a href="/teams" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Users size={18} className="text-gray-500" />
              <span>Teams</span>
            </a>
            
            <a href="/integrations" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Line size={18} className="text-gray-500" />
              <span>Integrations</span>
            </a>
            
            <a href="/api-dashboard" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Key size={18} className="text-gray-500" />
              <span>API Dashboard</span>
            </a>
            
            <a href="/benefits" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Gift size={18} className="text-gray-500" />
              <span>Win Additional Benefits</span>
            </a>
            
            <a href="/request-feature" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Lightbulb size={18} className="text-gray-500" />
              <span>Request a Feature</span>
            </a>
            
            <a href="/help" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <MessageSquareHelp size={18} className="text-gray-500" />
              <span>Help Center</span>
            </a>
            
            <a href="/logout" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <LogOut size={18} className="text-gray-500" />
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
