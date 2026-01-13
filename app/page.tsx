"use client";

import { useState, useEffect } from 'react';
import FileUpload from '@/components/file-upload';
import ChatInterface from '@/components/chat-interface';
import Sidebar, { Chat } from '@/components/sidebar';
import { MessageSquare, UploadCloud, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
        setActiveTab('upload');
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

  const SidebarComponent = (
    <Sidebar
      chats={chats}
      selectedChatId={selectedChatId}
      onSelectChat={(id) => {
        setSelectedChatId(id);
        setIsSidebarOpen(false);
        setActiveTab('chat');
      }}
      onNewChat={handleNewChat}
      onDeleteChat={handleDeleteChat}
      isLoading={isLoadingChats}
    />
  );

  const renderContent = () => {
    if (!selectedChatId) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to PDF ChatBot</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            Select a chat from the sidebar or create a new one to get started. Upload your documents and ask questions instantly.
          </p>
          <Button
            onClick={handleNewChat}
            size="lg"
            className="gap-2"
          >
            <UploadCloud className="w-5 h-5" />
            Start New Chat
          </Button>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto w-full p-4 md:p-8 h-full flex flex-col">
        {/* Header */}
        <header className="bg-background border-b border-border mb-6 rounded-xl shadow-sm overflow-hidden flex-shrink-0">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl text-foreground tracking-tight">
                {chats.find(c => c.id === selectedChatId)?.title || "Chat"}
              </h1>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'chat')} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="upload" className="h-full m-0 data-[state=inactive]:hidden">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full max-w-md">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-foreground mb-4">Upload a PDF</h2>
                    <p className="text-muted-foreground">
                      Upload documents to this chat context.
                    </p>
                  </div>
                  <FileUpload
                    chatId={selectedChatId}
                    onUploadComplete={() => setActiveTab('chat')}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="h-full m-0 data-[state=inactive]:hidden">
              <div className="h-full">
                <ChatInterface chatId={selectedChatId} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <main className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            {SidebarComponent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        {SidebarComponent}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full relative">
        {renderContent()}
      </div>
    </main>
  );
}
