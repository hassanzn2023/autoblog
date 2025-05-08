
import React from 'react';
import { Sun, Moon, CircleDot } from 'lucide-react';

type ThemeOption = 'comfort' | 'light' | 'dark';

interface ThemeSelectorProps {
  currentTheme: ThemeOption;
  onThemeChange: (theme: ThemeOption) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-2">
      <div 
        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
        onClick={() => onThemeChange('comfort')}
      >
        <Sun size={18} className="text-gray-500" />
        <span>Comfort</span>
        {currentTheme === 'comfort' && <span className="ml-auto text-seo-purple">✓</span>}
      </div>
      
      <div 
        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
        onClick={() => onThemeChange('light')}
      >
        <Sun size={18} className="text-gray-500" />
        <span>Light</span>
        {currentTheme === 'light' && <span className="ml-auto text-seo-purple">✓</span>}
      </div>
      
      <div 
        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
        onClick={() => onThemeChange('dark')}
      >
        <Moon size={18} className="text-gray-500" />
        <span>Dark</span>
        {currentTheme === 'dark' && <span className="ml-auto text-seo-purple">✓</span>}
      </div>
    </div>
  );
};

export default ThemeSelector;
