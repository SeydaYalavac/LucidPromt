"use client";

import { useState } from "react";
import { Send, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  user: string;
  text: string;
  role: "dev" | "user" | "expert";
}

export function TrendChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", user: "dev_alex", text: "Has anyone tested the new API latency?", role: "dev" },
    { id: "2", user: "sarah_k", text: "Yes, seeing around 45ms consistently on edge networks.", role: "expert" },
    { id: "3", user: "jason_99", text: "Are there rate limits on the public endpoint?", role: "user" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Simulate AI moderation check
    const badWords = ["bad", "spam", "hate"];
    if (badWords.some(word => input.toLowerCase().includes(word))) {
      alert("⚠️ Mesajınız topluluk kurallarına aykırı kelimeler içeriyor.");
      return;
    }

    const newMsg: Message = {
      id: Date.now().toString(),
      user: "you",
      text: input,
      role: "user"
    };

    setMessages([...messages, newMsg]);
    setInput("");
    
    // Simulate someone replying
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        user: "system_expert",
        text: "That's a great point! The documentation covers this in the advanced section.",
        role: "expert"
      }]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="mt-16 rounded-3xl border border-white/5 bg-[#0B0B0D] overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#111114] px-6 py-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Live Discussion
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            </span>
          </h3>
          <p className="text-xs text-[#8B8B93] flex items-center gap-1 mt-1">
            <ShieldCheck size={14} className="text-[#06b6d4]" /> AI Moderated (Safe Space)
          </p>
        </div>
        <div className="text-xs font-medium text-[#8B8B93]">
          42 online
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className="flex gap-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#8B8B93]">
                <User size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${msg.role === 'expert' ? 'text-[#06b6d4]' : msg.role === 'dev' ? 'text-[#8b5cf6]' : 'text-[#8B8B93]'}`}>
                    {msg.user}
                  </span>
                  {msg.role === 'expert' && <span className="rounded bg-[#06b6d4]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#06b6d4]">EXPERT</span>}
                </div>
                <p className="mt-1 text-sm text-white/90 leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#8B8B93]">
                <User size={16} />
              </div>
              <div className="flex items-center gap-1 text-[#8B8B93]">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "0ms" }}></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "150ms" }}></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "300ms" }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 bg-[#111114] p-4">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or share insight..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-sm text-white placeholder-white/30 focus:border-[#06b6d4]/50 focus:outline-none focus:ring-1 focus:ring-[#06b6d4]/50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#06b6d4] text-black transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
