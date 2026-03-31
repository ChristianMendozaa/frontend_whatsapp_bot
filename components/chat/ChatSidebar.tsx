"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export default function ChatSidebar({ selectedUser, onSelectUser }: any) {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("updated_at", { ascending: false, nullsFirst: false });
    if (data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();

    // Suscripción Realtime para cuando lleguen usuarios nuevos o cambie su estado
    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="h-16 bg-[#f0f2f5] flex items-center px-4 justify-between shrink-0">
        <h2 className="text-lg font-semibold text-gray-700">Contactos</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors relative ${
              selectedUser?.id === user.id ? "bg-gray-100" : ""
            }`}
          >
            {/* Si está en Rojo, damos resaltado visual */}
            {!user.is_bot_active && (
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
            )}

            <div className="relative">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                 {user.name.charAt(0).toUpperCase()}
              </div>
              {!user.is_bot_active && (
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white z-10 shadow-sm animate-pulse"></div>
              )}
            </div>
            
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className={`text-md font-medium truncate ${!user.is_bot_active ? 'text-red-700' : 'text-black'}`}>
                   {user.name}
                </h3>
                <span className={`text-xs ${!user.is_bot_active ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                  {user.updated_at ? format(new Date(user.updated_at), "HH:mm") : format(new Date(user.created_at), "HH:mm")}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate mb-1">
                 {(() => {
                    try {
                       const { parsePhoneNumber } = require('libphonenumber-js');
                       const phoneNumber = parsePhoneNumber('+' + user.phone_number);
                       return phoneNumber.formatInternational();
                    } catch (e) {
                       return `+${user.phone_number.substring(0,3)} ${user.phone_number.substring(3)}`;
                    }
                 })()}
              </p>
              {user.last_message && (
                 <p className="text-xs text-gray-600 truncate opacity-80 italic">
                    {user.last_message}
                 </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
