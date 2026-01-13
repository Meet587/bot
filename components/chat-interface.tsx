
"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

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
        <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {!chatId ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <h3 className="text-lg font-semibold">Select a chat to start</h3>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20">
                        <h3 className="text-lg font-semibold">Ask me anything about your PDF in this chat!</h3>
                    </div>
                ) : (
                    messages.map((m, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                                    }`}
                            >
                                {m.role === 'user' ? (
                                    <User className="w-5 h-5 text-white" />
                                ) : (
                                    <Bot className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div
                                className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm ml-12">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={chatId ? "Type your question..." : "Select a chat first"}
                    disabled={!chatId}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading || !chatId}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
