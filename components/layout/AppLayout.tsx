
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { User, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import NotificationsDropdown from '../ui/NotificationsDropdown';
import UserProfileDropdown from '../ui/UserProfileDropdown';

const AppLayout: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        userRef.current &&
        !userRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const toggleProfile = () => {
    setIsProfileOpen(prev => !prev);
    setIsNotificationsOpen(false);
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
    setIsProfileOpen(false);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-end px-6 relative">
            <div className="flex items-center space-x-4">
                <button
                    ref={bellRef}
                    onClick={toggleNotifications}
                    className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                    <Bell size={20} className="text-gray-600" />
                </button>
                <button
                    ref={userRef}
                    onClick={toggleProfile}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <User size={20} className="text-gray-600" />
                </button>
                
                {isNotificationsOpen && <NotificationsDropdown ref={notificationsRef} onClose={() => setIsNotificationsOpen(false)} />}
                {isProfileOpen && <UserProfileDropdown ref={profileRef} onLogout={handleLogout} onClose={() => setIsProfileOpen(false)} />}
            </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default AppLayout;