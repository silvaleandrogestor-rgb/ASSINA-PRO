

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { User, Bell, ChevronsLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();

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
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-end px-6">
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />
                </button>
                 <button className="p-2 rounded-full hover:bg-gray-100">
                    <User size={20} className="text-gray-600" />
                </button>
                <button onClick={handleLogout} className="flex items-center text-sm font-medium text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-red-50">
                    <ChevronsLeft size={20} className="mr-1" />
                    Sair
                </button>
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