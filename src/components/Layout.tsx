
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';
import ProfileDropdown from './ProfileDropdown';
import { Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center">
            <span className="text-gray-700">Good afternoon, Malek!</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Clock className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="outline" className="rounded-md">
              Invite
            </Button>
            <Button variant="outline" className="rounded-md">
              Revert to classic UI
            </Button>
            <ProfileDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
          <div className="w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
