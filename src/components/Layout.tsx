
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';
import ProfileDropdown from './ProfileDropdown';
import { Clock, Bell, MessageSquare, FileText, Settings, Users, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Layout = () => {
  const [showHelp, setShowHelp] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm">
          <div className="flex items-center">
            <span className="text-gray-700 font-medium">
              {getGreeting()}, <span className="font-semibold">Malek!</span>
            </span>
          </div>
          <div className="hidden md:flex items-center max-w-md w-full mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                className="pl-10 pr-4 py-2 w-full bg-gray-50 focus-visible:ring-gray-400" 
                placeholder="Search everything..." 
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full p-0">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  <NotificationItem 
                    title="Campaign completed" 
                    message="Your 'Tech News' campaign has completed all posts" 
                    time="5 min ago" 
                    type="success"
                  />
                  <NotificationItem 
                    title="Content error" 
                    message="Failed to generate content for 'Health Tips'" 
                    time="2 hours ago" 
                    type="error"
                  />
                  <NotificationItem 
                    title="New feature available" 
                    message="Try our new AI content enhancement tools" 
                    time="1 day ago" 
                    type="info"
                  />
                </div>
                <DropdownMenuSeparator />
                <Button variant="ghost" className="w-full justify-center text-sm">
                  View all notifications
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Messages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>No new messages</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" className="rounded-full">
              <FileText className="h-5 w-5 text-gray-600" />
            </Button>
            
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowHelp(!showHelp)}>
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </Button>
            
            <Button variant="outline" className="rounded-md hidden md:flex">
              Invite
            </Button>
            <Button variant="outline" className="rounded-md hidden md:flex items-center gap-2">
              <Users size={16} />
              Team
            </Button>
            <ProfileDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto w-full">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
        
        {showHelp && (
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 w-[300px] z-50">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="font-medium">Help & Resources</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowHelp(false)}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <a href="#" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-md transition-colors">
                <FileText size={16} className="text-[#F76D01]" />
                <span>Documentation</span>
              </a>
              <a href="#" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-md transition-colors">
                <MessageSquare size={16} className="text-[#F76D01]" />
                <span>Contact Support</span>
              </a>
              <a href="#" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-md transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#F76D01]">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor" />
                </svg>
                <span>Tutorial Videos</span>
              </a>
              <a href="#" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-md transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#F76D01]">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="currentColor" />
                </svg>
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const NotificationItem = ({ title, message, time, type }: NotificationItemProps) => {
  const getIconByType = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.44593 1.51726C8.18329 0.985818 7.44981 0.985818 7.18717 1.51726L1.17204 13.5173C0.917543 14.0348 1.29252 14.65 1.87487 14.65H13.7582C14.3406 14.65 14.7156 14.0348 14.461 13.5173L8.44593 1.51726ZM7.81655 5.53234C7.81655 5.20441 7.53868 4.94234 7.19155 4.94234C6.84442 4.94234 6.56655 5.20441 6.56655 5.53234V9.53234C6.56655 9.86026 6.84442 10.1223 7.19155 10.1223C7.53868 10.1223 7.81655 9.86026 7.81655 9.53234V5.53234ZM7.19155 12.1223C7.67378 12.1223 8.06655 11.7445 8.06655 11.2823C8.06655 10.8201 7.67378 10.4423 7.19155 10.4423C6.70931 10.4423 6.31655 10.8201 6.31655 11.2823C6.31655 11.7445 6.70931 12.1223 7.19155 12.1223Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer">
      {getIconByType()}
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600">{message}</div>
        <div className="text-xs text-gray-400 mt-1">{time}</div>
      </div>
    </div>
  );
};

export default Layout;
