
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, ChevronRight, Palette, Gift, MessageSquare, Key, Users, BarChart3, Lightbulb, Link as LinkIcon } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type ThemeOption = 'comfort' | 'light' | 'dark';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check for stored theme preference or default to 'light'
  const [theme, setTheme] = useState<ThemeOption>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeOption;
    return savedTheme || 'comfort';
  });

  // Apply theme on initial load and when theme changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Function to apply the theme to the document
  const applyTheme = (newTheme: ThemeOption) => {
    document.documentElement.classList.remove('theme-comfort', 'theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${newTheme}`);
  };

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
    applyTheme(newTheme);
  };

  const handleThemeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowThemeSelector(!showThemeSelector);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar>
          <AvatarFallback>MA</AvatarFallback>
        </Avatar>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background rounded-lg shadow-lg border border-border z-50">
          <div className="p-4 border-b border-border">
            <div className="font-medium text-foreground">Malek</div>
            <div className="text-sm text-muted-foreground">malekalmout2016@gmail.com</div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">Free Plan</span>
              <Link to="/billing" className="text-xs text-primary ml-2 font-medium">Upgrade</Link>
            </div>
          </div>
          
          <div className="p-2">
            <div className="relative">
              <button 
                className="w-full flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleThemeClick}
              >
                <Palette size={18} className="text-muted-foreground" />
                <span>Theme</span>
                <span className="ml-auto">
                  <ChevronRight size={18} className="text-muted-foreground" />
                </span>
              </button>
              
              {showThemeSelector && (
                <ThemeSelector currentTheme={theme} onThemeChange={handleThemeChange} />
              )}
            </div>
            
            <Link to="/preferences" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <Settings size={18} className="text-muted-foreground" />
              <span>Preferences</span>
            </Link>
            
            <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <User size={18} className="text-muted-foreground" />
              <span>Profile</span>
            </Link>
            
            <Link to="/usage" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <BarChart3 size={18} className="text-muted-foreground" />
              <span>Usage</span>
            </Link>
            
            <Link to="/billing" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <Key size={18} className="text-muted-foreground" />
              <span>Plans and Billing</span>
            </Link>
            
            <Link to="/teams" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <Users size={18} className="text-muted-foreground" />
              <span>Teams</span>
            </Link>
            
            <Link to="/integrations" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <LinkIcon size={18} className="text-muted-foreground" />
              <span>Integrations</span>
            </Link>
            
            <Link to="/api-dashboard" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <Key size={18} className="text-muted-foreground" />
              <span>API Dashboard</span>
            </Link>
            
            <Link to="/benefits" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <Gift size={18} className="text-muted-foreground" />
              <span>Win Additional Benefits</span>
            </Link>
            
            <Link to="/request-feature" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <Lightbulb size={18} className="text-muted-foreground" />
              <span>Request a Feature</span>
            </Link>
            
            <Link to="/help" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <MessageSquare size={18} className="text-muted-foreground" />
              <span>Help Center</span>
            </Link>
            
            <Link to="/logout" className="flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <LogOut size={18} className="text-muted-foreground" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
