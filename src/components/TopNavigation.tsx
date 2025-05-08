
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs';

const TopNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine which tab should be active
  const getActiveTab = () => {
    if (currentPath === '/get-started') return 'get-started';
    if (currentPath === '/') return 'home';
    return '';
  };

  return (
    <div className="border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-4">
      <Tabs value={getActiveTab()} className="w-full">
        <TabsList className="h-12 w-full justify-start bg-transparent space-x-2 p-0">
          <TabsTrigger 
            value="get-started" 
            variant="underline" 
            className="h-full data-[state=active]:text-[#F76D01]"
            asChild
          >
            <Link to="/get-started">Get Started</Link>
          </TabsTrigger>
          <TabsTrigger 
            value="home" 
            variant="underline" 
            className="h-full data-[state=active]:text-[#F76D01]"
            asChild
          >
            <Link to="/">Home</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TopNavigation;
