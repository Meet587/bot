"use client";

import { Plus, MessageSquare, Trash2, Github, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

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
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };
    return (
        <div className="w-64 bg-sidebar h-screen flex flex-col border-r border-sidebar-border text-sidebar-foreground flex-shrink-0 transition-all duration-300">
            <div className="p-4 border-b border-sidebar-border">
                <Button
                    onClick={onNewChat}
                    className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </Button>
            </div>

            <ScrollArea className="flex-1 p-2 min-h-0">
                <div className="space-y-1">
                    {isLoading ? (
                        <div className="space-y-2 px-2 py-4">
                            <Skeleton className="h-10 w-full bg-sidebar-accent" />
                            <Skeleton className="h-10 w-full bg-sidebar-accent" />
                            <Skeleton className="h-10 w-full bg-sidebar-accent" />
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="text-muted-foreground text-center text-sm py-4">No chats yet.</div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={`group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all ${selectedChatId === chat.id
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate text-sm font-medium">{chat.title || "Untitled Chat"}</span>
                                </div>
                                {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                    }}
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 p-0 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button> */}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center justify-between w-full text-sidebar-foreground text-sm">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                                <Github className="w-4 h-4" />
                            </AvatarFallback>
                        </Avatar>
                        <span>User</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
