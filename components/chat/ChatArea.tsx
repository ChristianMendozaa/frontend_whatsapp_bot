"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import AgentControls from "@/components/chat/AgentControls";
import { Send, Bot, User, ShieldAlert } from "lucide-react";

export default function ChatArea({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isBotActive, setIsBotActive] = useState(user.is_bot_active);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fetchMessages = async () => {
    const { data } = await supabase.from("messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    setIsBotActive(user.is_bot_active);

    const subscription = supabase
      .channel(`public:messages:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${user.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    const userSub = supabase
      .channel(`public:users:${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` }, (payload) => {
        setIsBotActive(payload.new.is_bot_active);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(userSub);
    };
  }, [user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // 1. Send via Backend FastAPI (Proxy via Server Action)
      const { sendWhatsAppMessageAction } = await import('@/app/actions');
      await sendWhatsAppMessageAction(user.id, user.phone_number, newMessage);

      // 2. Clear input. The Realtime subscription will automatically show the message.
      setNewMessage("");
    } catch (error) {
      alert("Hubo un error al pedirle al backend que envíe el mensaje.");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#e5ddd5] w-full">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] flex items-center justify-between px-4 border-l border-gray-200 z-10 shrink-0 shadow-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white mr-3">
             {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 leading-tight">{user.name}</h2>
            <p className="text-xs text-gray-500">{user.phone_number}</p>
          </div>
        </div>
        <AgentControls user={user} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-20">
        {!isBotActive && (
           <div className="flex justify-center my-4">
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                 <ShieldAlert size={14} /> Atención Humana Requerida
              </span>
           </div>
        )}

        {messages.map((msg) => {
           let isMine = msg.sender_type !== 'user';
           let bubbleClass = isMine ? "bg-[#dcf8c6] rounded-tl-lg rounded-tr-lg rounded-bl-lg" : "bg-white rounded-tl-lg rounded-tr-lg rounded-br-lg";
           let alignment = isMine ? "justify-end" : "justify-start";
           
           return (
            <div key={msg.id} className={`flex ${alignment}`}>
              <div className={`max-w-[70%] text-sm px-3 py-2 shadow-sm relative ${bubbleClass}`}>
                {msg.sender_type === "bot" && <Bot size={14} className="text-gray-400 absolute -left-5 top-1" />}
                {msg.sender_type === "human" && <User size={14} className="text-gray-400 absolute -right-5 top-1" />}
                
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div className="text-[10px] text-gray-400 text-right mt-1 w-full relative">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
           )}
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#f0f2f5] p-3 flex shrink-0 border-t border-gray-200">
        <form onSubmit={sendMessage} className="w-full flex items-center space-x-2">
          <input
            type="text"
            className={`flex-1 rounded-full border-none px-5 py-3 focus:outline-none focus:ring-0 text-sm shadow-sm text-gray-800 ${isBotActive ? 'bg-gray-200 cursor-not-allowed opacity-70' : 'bg-white'}`}
            placeholder={isBotActive ? "Bot automático activo (Cambia a modo humano para escribir)" : "Escribe un mensaje como humano..."}
            value={newMessage}
            autoFocus
            disabled={isBotActive}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isBotActive}
            className={`w-[45px] h-[45px] rounded-full flex items-center justify-center transition-all shadow-md ${isBotActive ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-[#00a884] text-white hover:bg-[#008f6f]'}`}
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
