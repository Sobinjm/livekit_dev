import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { User } from "@shared/schema";

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  user: User;
}

export default function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  user
}: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const getRandomColor = (userId: number) => {
    const colors = [
      "bg-primary text-white",
      "bg-neutral-200 text-neutral-600",
      "bg-blue-500 text-white",
      "bg-green-500 text-white",
      "bg-purple-500 text-white",
      "bg-amber-500 text-white",
    ];
    
    return colors[userId % colors.length];
  };

  return (
    <div 
      className={`absolute right-0 top-16 bottom-0 w-80 bg-white border-l border-neutral-200 shadow-lg transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-medium">Meeting Chat</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-sm">
              <p>No messages yet</p>
              <p>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2 text-xs font-medium ${getRandomColor(msg.senderId)}`}>
                  {getInitials(msg.senderName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline">
                    <span className="font-medium text-sm">{msg.senderName}</span>
                    <span className="text-neutral-500 text-xs ml-2">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-sm text-neutral-700 mt-1">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-3 border-t border-neutral-200">
          <form className="flex items-center" onSubmit={handleSubmit}>
            <Input
              type="text"
              className="flex-1"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" size="icon" className="ml-2 h-9 w-9" disabled={!message.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
