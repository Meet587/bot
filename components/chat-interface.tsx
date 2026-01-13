
"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    chatId: string | null;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch history when chatId changes
    useEffect(() => {
        if (chatId) {
            fetchHistory();
        } else {
            setMessages([]);
        }
    }, [chatId]);

    const fetchHistory = async () => {
        if (!chatId) return;
        try {
            const res = await fetch(`/api/chats/${chatId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatId) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`/api/chats/${chatId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: userMessage.content }),
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();
            const botMessage: Message = { role: 'assistant', content: data.content };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            // Handle error visually if needed
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-full w-full overflow-hidden border-border shadow-lg bg-background rounded-xl">
            <ScrollArea className="flex-1 bg-muted/10 min-h-0">
                <div className="p-4 space-y-4 min-h-full">
                    {!chatId ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                            <h3 className="text-lg font-semibold">Select a chat to start</h3>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground mt-20">
                            <h3 className="text-lg font-semibold">Ask me anything about your PDF in this chat!</h3>
                        </div>
                    ) : (
                        messages.map((m, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                <Avatar className={`w-8 h-8 ${m.role === 'user' ? 'bg-primary' : 'bg-muted'}`}>
                                    <AvatarFallback className={m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                                        {m.role === 'user' ? (
                                            <User className="w-5 h-5" />
                                        ) : (
                                            <Bot className="w-5 h-5" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-card text-card-foreground border border-border rounded-tl-none'
                                        }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm ml-12">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="p-4 bg-background border-t border-border flex gap-2">
                <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={chatId ? "Type your question..." : "Select a chat first"}
                    disabled={!chatId}
                    className="flex-1"
                />
                <Button
                    type="submit"
                    disabled={!input.trim() || isLoading || !chatId}
                    size="icon"
                    className="shrink-0"
                >
                    <Send className="w-5 h-5" />
                </Button>
            </form>
        </Card>
    );
}
