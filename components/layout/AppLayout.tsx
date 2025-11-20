

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { User, Bell, ChevronsLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import NotificationsDropdown from '../ui/NotificationsDropdown';

const AppLayout: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                    <Bell size={20} className="text-gray-600" />
                </button>
                <Link to="/configuracoes" className="p-2 rounded-full hover:bg-gray-100">
                    <User size={20} className="text-gray-600" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-soft-black"
                >
                  <ChevronsLeft size={16} className="mr-1" />
                  Sair
                </button>
                {isNotificationsOpen && <NotificationsDropdown ref={notificationsRef} onClose={() => setIsNotificationsOpen(false)} />}
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
