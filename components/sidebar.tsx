"use client";

import { Plus, MessageSquare, Trash2, Github } from "lucide-react";

export interface Chat {
    id: string;
    title: string;
    created_at: string;
}

interface SidebarProps {
    chats: Chat[];
    onSelectChat: (chatId: string) => void;
    selectedChatId: string | null;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
    isLoading: boolean;
}

export default function Sidebar({ chats, onSelectChat, selectedChatId, onNewChat, onDeleteChat, isLoading }: SidebarProps) {
    return (
        <div className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800 text-white flex-shrink-0 transition-all duration-300">
            <div className="p-4 border-b border-gray-800">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                    <div className="text-gray-400 text-center text-sm py-4">Loading chats...</div>
                ) : chats.length === 0 ? (
                    <div className="text-gray-500 text-center text-sm py-4">No chats yet.</div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={`group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all ${selectedChatId === chat.id
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                                }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate text-sm font-medium">{chat.title || "Untitled Chat"}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <Github className="w-4 h-4" />
                    </div>
                    <span>User</span>
                </div>
            </div>
        </div>
    );
}
