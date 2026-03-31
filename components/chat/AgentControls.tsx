"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bot, UserRoundCheck } from "lucide-react";

export default function AgentControls({ user }: { user: any }) {
  const [isActive, setIsActive] = useState(user.is_bot_active);

  useEffect(() => {
    setIsActive(user.is_bot_active);
  }, [user]);

  const toggleBot = async () => {
    const newVal = !isActive;
    setIsActive(newVal);
    await supabase.from("users").update({ is_bot_active: newVal }).eq("id", user.id);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-xs text-gray-500 font-medium">Control actual:</span>
      <button 
        onClick={toggleBot}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-full shadow-sm border transition-colors ${
          isActive 
            ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
            : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        }`}
      >
        {isActive ? <Bot size={16} className="mr-1 mt-[-2px]"/> : <UserRoundCheck size={16} className="mr-1 mt-[-2px]"/>}
        <span className="text-sm font-semibold">{isActive ? "IA Automática" : "Modo Humano"}</span>
      </button>
    </div>
  );
}
