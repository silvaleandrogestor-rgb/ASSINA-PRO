import React, { forwardRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserProfileDropdownProps {
  onLogout: () => void;
  onClose: () => void;
}

const UserProfileDropdown = forwardRef<HTMLDivElement, UserProfileDropdownProps>(({ onLogout, onClose }, ref) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    fetchUser();
  }, []);

  return (
    <div ref={ref} className="absolute top-16 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-3 border-b border-gray-200">
        <p className="text-sm font-medium text-soft-black truncate">Logado como</p>
        <p className="text-sm text-gray-500 truncate">{userEmail || 'Carregando...'}</p>
      </div>
      <div className="py-2">
        <Link 
          to="/configuracoes" 
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Settings size={16} className="mr-2" />
          Configurações
        </Link>
        <button 
          onClick={onLogout} 
          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} className="mr-2" />
          Sair
        </button>
      </div>
    </div>
  );
});

export default UserProfileDropdown;
