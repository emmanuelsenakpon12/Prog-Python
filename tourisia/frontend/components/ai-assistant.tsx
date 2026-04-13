"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "ai";
    content: string;
}

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content: "Bonjour ! Je suis l'Assistant Voyage de Tourisia. Comment puis-je vous aider aujourd'hui ? Je peux vous suggérer des hôtels, des activités ou planifier votre séjour.",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message.trim() || isLoading) return;

        const userMsg = message.trim();
        setMessage("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}ai/assistant.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMsg }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
            } else {
                toast.error("L'assistant rencontre un problème.");
                setMessages((prev) => [
                    ...prev,
                    { role: "ai", content: data.response || "Désolé, je rencontre une difficulté technique." },
                ]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            toast.error("Erreur de connexion à l'assistant.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-[#2563eb] p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Assistant Tourisia</h3>
                                <p className="text-[10px] text-white/70 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    En ligne • IA
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                        ? "bg-[#2563eb] text-white rounded-tr-none shadow-md"
                                        : "bg-muted text-foreground rounded-tl-none border border-border/50 shadow-sm"
                                        }`}
                                >
                                    {msg.role === "ai" ? (
                                        <div className="prose prose-sm max-w-none dark:prose-invert
                                                prose-p:leading-relaxed prose-pre:bg-muted-foreground/10
                                                prose-strong:font-bold prose-strong:text-[#2563eb]
                                                prose-ul:list-disc prose-ul:pl-4 prose-li:my-1
                                                msg-markdown overflow-wrap-anywhere">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#2563eb]" />
                                    <span className="text-xs text-muted-foreground italic">En train de réfléchir...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border bg-white/50">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Posez votre question..."
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 transition-all pr-12"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <button
                                disabled={!message.trim() || isLoading}
                                onClick={handleSendMessage}
                                className="absolute right-2 p-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative p-4 rounded-2xl shadow-xl transition-all duration-500 overflow-hidden ${isOpen ? "bg-white text-[#2563eb] scale-90" : "bg-[#2563eb] text-white hover:scale-105"
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                    {isOpen ? <X className="h-6 w-6" /> : <div className="relative"><Bot className="h-6 w-6" /><div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div></div>}
                </div>
            </button>
        </div>
    );
};
