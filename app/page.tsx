"use client";

import { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import KnowledgeAdmin from "@/components/knowledge/KnowledgeAdmin";
import { MessageCircle, Database } from "lucide-react";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "rag">("chat");

  return (
    <main className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <div className="w-full max-w-[1600px] mx-auto flex bg-white shadow-xl lg:my-6 lg:rounded-xl overflow-hidden border border-gray-200">
        
        {/* App Side Navigation Menu */}
        <div className="w-[60px] bg-[#f0f2f5] border-r flex flex-col items-center py-4 space-y-4 shrink-0 z-20">
           <button 
              onClick={() => setActiveTab("chat")}
              className={`p-3 rounded-xl transition-all ${activeTab === "chat" ? "bg-white text-[#00a884] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
              title="Chats de WhatsApp"
           >
              <MessageCircle size={24} />
           </button>
           <button 
              onClick={() => setActiveTab("rag")}
              className={`p-3 rounded-xl transition-all ${activeTab === "rag" ? "bg-white text-[#00a884] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
              title="Base de Conocimiento (RAG)"
           >
              <Database size={24} />
           </button>
        </div>

        {activeTab === "chat" ? (
          <>
            {/* Sidebar */}
            <div className="w-full md:w-[380px] border-r bg-white flex flex-col z-10 shrink-0">
              <ChatSidebar selectedUser={selectedUser} onSelectUser={setSelectedUser} />
            </div>
            
            {/* Right Area */}
            <div className="hidden md:flex flex-1 flex-col relative bg-[#efeae2] h-full">
              {selectedUser ? (
                 <ChatArea user={selectedUser} />
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" width="80" className="opacity-50 blur-[2px] mb-4" />
                    <h1 className="text-3xl font-light text-gray-500 mb-2">WhatsApp Web Híbrido</h1>
                    <p className="text-gray-400">Selecciona un chat a la izquierda para interactuar.</p>
                 </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col h-full bg-white relative">
             <KnowledgeAdmin />
          </div>
        )}
        
      </div>
    </main>
  );
}
