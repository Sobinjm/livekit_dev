import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { ChatMessage } from '@/components/ChatPanel';

export function useChat(meetingId: string, userId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { sendMessage: sendWebSocketMessage, messages: wsMessages } = useWebSocket(meetingId, userId);
  
  // Update chat messages when WebSocket receives new messages
  useEffect(() => {
    setMessages(wsMessages);
  }, [wsMessages]);
  
  // Function to send a chat message
  function sendMessage(content: string) {
    if (content.trim()) {
      sendWebSocketMessage(content);
    }
  }
  
  return {
    messages,
    sendMessage,
  };
}
