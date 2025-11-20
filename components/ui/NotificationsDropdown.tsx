import React, { useState, useEffect, forwardRef } from 'react';
import { getNotifications } from '../../lib/api';
import { HistoryItem } from '../../types';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NotificationsDropdownProps {
  onClose: () => void;
}

const NotificationsDropdown = forwardRef<HTMLDivElement, NotificationsDropdownProps>(({ onClose }, ref) => {
  const [notifications, setNotifications] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await getNotifications(user.id);
        if (data) {
          setNotifications(data);
        }
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return (
    <div
      ref={ref}
      className="absolute top-16 right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in-20 slide-in-from-top-4 duration-300"
    >
      <div className="p-4 border-b">
        <h3 className="font-semibold text-soft-black">Notificações</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Carregando...</p>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 border-b last:border-b-0">
              <div className="flex items-start">
                <CheckCircle size={16} className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-soft-black capitalize">{item.acao.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{item.contrato?.titulo || item.valor}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.data).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-gray-500">Nenhuma notificação recente.</p>
        )}
      </div>
    </div>
  );
});

export default NotificationsDropdown;