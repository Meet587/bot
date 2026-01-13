"use client";

import { useState, useEffect } from 'react';
import FileUpload from '@/components/file-upload';
import ChatInterface from '@/components/chat-interface';
import Sidebar, { Chat } from '@/components/sidebar';
import { MessageSquare, UploadCloud, Menu, X } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setIsLoadingChats(true);
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
        // Select first chat if available and none selected
        if (!selectedChatId && data.chats && data.chats.length > 0) {
          // Optional: Auto-select latest
          setSelectedChatId(data.chats[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chats", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const title = `Chat ${chats.length + 1}`; // Simple dynamic title
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        const data = await res.json();
        setChats([data.chat, ...chats]);
        setSelectedChatId(data.chat.id);
        setActiveTab('upload'); // Default to upload for new chat? Or chat?
        // User flow: New Chat -> Upload document -> Ask question.
        // So default to upload makes sense.
      }
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setChats(chats.filter((c) => c.id !== chatId));
        if (selectedChatId === chatId) {
          setSelectedChatId(null);
          setActiveTab('upload');
        }
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  const renderContent = () => {
    if (!selectedChatId) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PDF ChatBot</h1>
          <p className="text-gray-500 max-w-md mb-8">
            Select a chat from the sidebar or create a new one to get started. Upload your documents and ask questions instantly.
          </p>
          <button
            onClick={handleNewChat}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <UploadCloud className="w-5 h-5" />
            Start New Chat
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto w-full p-4 md:p-8 h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 mb-6 rounded-xl shadow-sm overflow-hidden flex-shrink-0">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl text-gray-900 tracking-tight">
                {chats.find(c => c.id === selectedChatId)?.title || "Chat"}
              </h1>
            </div>
            <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload
                </span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </span>
              </button>
            </nav>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
            {activeTab === 'upload' ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full max-w-md">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Upload a PDF</h2>
                    <p className="text-gray-600">
                      Upload documents to this chat context.
                    </p>
                  </div>
                  <FileUpload
                    chatId={selectedChatId}
                    onUploadComplete={() => setActiveTab('chat')}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full">
                <ChatInterface chatId={selectedChatId} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={(id) => {
            setSelectedChatId(id);
            setIsSidebarOpen(false); // Close on mobile select
            // Automatically switch to chat tab on existing chat select normally, 
            // but user might want to stick to current tab. 
            // Let's reset to 'chat' tab if they select a chat to see history?
            // Actually, if they select a chat, they probably want to see the chat.
            setActiveTab('chat');
          }}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isLoading={isLoadingChats}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full relative">
        {renderContent()}
      </div>
    </main>
  );
}
