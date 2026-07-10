"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "aria";
  content: string;
  toolUsed?: string;
}

export default function AriaChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "aria",
      content: "Hello! I am Aria, your AI assistant running securely and 100% locally. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Failed to fetch");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "aria",
          content: data.response,
          toolUsed: data.tool_used,
        },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "aria",
          content: `Error: ${errorMessage}. Please ensure the FastAPI backend is running on port 8000 and Ollama is active locally.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-col h-screen bg-gray-950/90 text-gray-100 font-sans selection:bg-cyan-500/30"
      style={{ backgroundImage: 'url("/arc-reactor.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-900/50 backdrop-blur-md border-b border-cyan-900/50 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shadow-lg shadow-cyan-500/40 border border-cyan-400/50">
            <img src="/arc-reactor.png" alt="Aria" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-cyan-50">Aria Ark-Reactor</h1>
            <p className="text-xs text-cyan-400/80">Offline & Secure (100% Free)</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.role === "user"
                  ? "bg-cyan-600 text-white rounded-br-none"
                  : "bg-gray-900/80 backdrop-blur-sm border border-cyan-900/30 text-gray-200 rounded-bl-none"
              }`}
            >
              {msg.toolUsed && (
                <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 w-fit px-2 py-1 rounded-md">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Used Tool: {msg.toolUsed}
                </div>
              )}
              <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-cyan-900/30 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-gray-900/50 backdrop-blur-md border-t border-cyan-900/50">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-gray-800/80 text-white px-5 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-cyan-600/20 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-3">
          Aria handles intents securely and offline. Verification is recommended.
        </p>
      </div>
    </div>
  );
}
