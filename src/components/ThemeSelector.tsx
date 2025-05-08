
import React from 'react';
import { Sun, Moon, CircleHalf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ThemeOption = 'comfort' | 'light' | 'dark';

interface ThemeSelectorProps {
  currentTheme: ThemeOption;
  onThemeChange: (theme: ThemeOption) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-2">
      <div 
        className={`flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer ${
          currentTheme === 'comfort' ? 'bg-orange-50 dark:bg-gray-700' : ''
        }`}
        onClick={() => onThemeChange('comfort')}
      >
        <CircleHalf size={18} className={currentTheme === 'comfort' ? "text-[#F76D01]" : "text-gray-500 dark:text-gray-400"} />
        <span className={currentTheme === 'comfort' ? "text-[#F76D01] font-medium" : "dark:text-gray-200"}>Comfort</span>
        {currentTheme === 'comfort' && (
          <Badge variant="outline" className="ml-auto border-[#F76D01] bg-orange-50 text-[#F76D01] dark:bg-gray-700">
            Active
          </Badge>
        )}
      </div>
      
      <div 
        className={`flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer ${
          currentTheme === 'light' ? 'bg-orange-50 dark:bg-gray-700' : ''
        }`}
        onClick={() => onThemeChange('light')}
      >
        <Sun size={18} className={currentTheme === 'light' ? "text-[#F76D01]" : "text-gray-500 dark:text-gray-400"} />
        <span className={currentTheme === 'light' ? "text-[#F76D01] font-medium" : "dark:text-gray-200"}>Light</span>
        {currentTheme === 'light' && (
          <Badge variant="outline" className="ml-auto border-[#F76D01] bg-orange-50 text-[#F76D01] dark:bg-gray-700">
            Active
          </Badge>
        )}
      </div>
      
      <div 
        className={`flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer ${
          currentTheme === 'dark' ? 'bg-orange-50 dark:bg-gray-700' : ''
        }`}
        onClick={() => onThemeChange('dark')}
      >
        <Moon size={18} className={currentTheme === 'dark' ? "text-[#F76D01]" : "text-gray-500 dark:text-gray-400"} />
        <span className={currentTheme === 'dark' ? "text-[#F76D01] font-medium" : "dark:text-gray-200"}>Dark</span>
        {currentTheme === 'dark' && (
          <Badge variant="outline" className="ml-auto border-[#F76D01] bg-orange-50 text-[#F76D01] dark:bg-gray-700">
            Active
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ThemeSelector;
