import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/ChatPanel';

export function useWebSocket(meetingId: string, userId: number) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // Set up WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      console.log('Connecting to WebSocket at:', wsUrl);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Connection opened
      socket.addEventListener('open', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Join the meeting
        const joinMessage = {
          type: 'join',
          payload: {
            meetingId,
            userId,
            displayName: 'Test User' // In a real app, this would be the user's display name
          }
        };
        
        socket.send(JSON.stringify(joinMessage));
      });
      
      // Handle connection error
      socket.addEventListener('error', (event: Event) => {
        console.error('WebSocket connection error:', event);
      });
      
      // Listen for messages
      socket.addEventListener('message', (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'chat_message':
            const message: ChatMessage = {
              id: data.payload.id,
              senderId: data.payload.senderId,
              senderName: data.payload.senderId === userId ? 'You' : 'Other User', // In a real app, this would be the actual username
              content: data.payload.content,
              timestamp: new Date(data.payload.sentAt)
            };
            
            setMessages(prev => [...prev, message]);
            break;
            
          case 'participant_joined':
            console.log('Participant joined:', data.payload);
            break;
            
          case 'participant_left':
            console.log('Participant left:', data.payload);
            break;
            
          case 'error':
            console.error('WebSocket error:', data.payload);
            break;
        }
      });
      
      // Connection closed
      socket.addEventListener('close', (event: CloseEvent) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
      });
      
      // Clean up on unmount
      return () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          // Send leave message
          const leaveMessage = {
            type: 'leave',
            payload: {
              meetingId,
              userId
            }
          };
          
          socket.send(JSON.stringify(leaveMessage));
          socket.close();
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      return () => {}; // Empty cleanup function
    }
  }, [meetingId, userId]);
  
  // Function to send chat messages
  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const chatMessage = {
        type: 'chat',
        payload: {
          meetingId,
          senderId: userId,
          message
        }
      };
      
      socketRef.current.send(JSON.stringify(chatMessage));
      
      // Add message to local state
      // In a real app, this would be added when the server confirms receipt
      const newMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        senderId: userId,
        senderName: 'You',
        content: message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
    }
  };
  
  return {
    isConnected,
    messages,
    sendMessage
  };
}
