
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MainTabs = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    if (location.pathname === '/get-started') return 'get-started';
    if (location.pathname === '/') return 'home';
    return '';
  };

  return (
    <Tabs value={getActiveTab()} className="w-full">
      <TabsList className="w-full justify-start bg-transparent p-0 h-12 border-b border-gray-200 dark:border-gray-700">
        <TabsTrigger 
          value="get-started"
          variant="underline"
          className="h-full data-[state=active]:text-[#F76D01] rounded-none border-b-2 border-transparent data-[state=active]:border-[#F76D01]"
          asChild
        >
          <Link to="/get-started">Get Started</Link>
        </TabsTrigger>
        <TabsTrigger 
          value="home"
          variant="underline"
          className="h-full data-[state=active]:text-[#F76D01] rounded-none border-b-2 border-transparent data-[state=active]:border-[#F76D01]"
          asChild
        >
          <Link to="/">Home</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default MainTabs;
