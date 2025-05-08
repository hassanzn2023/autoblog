
import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-yellow-400 font-medium" 
        onClick={() => setIsOpen(!isOpen)}
      >
        AZ
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="font-medium">abbas zein</div>
            <div className="text-sm text-gray-500">abbaszn1999@gmail.com</div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-gray-500">Free Plan</span>
              <a href="#" className="text-xs text-seo-purple ml-2 font-medium">Upgrade</a>
            </div>
          </div>
          
          <div className="p-2">
            <a href="#" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <User size={18} className="text-gray-500" />
              <span>Theme</span>
              <span className="ml-auto">
                <ChevronRight size={18} className="text-gray-400" />
              </span>
            </a>
            
            <a href="#" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <Settings size={18} className="text-gray-500" />
              <span>Preferences</span>
            </a>
            
            <a href="#" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
              <LogOut size={18} className="text-gray-500" />
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default ProfileDropdown;
