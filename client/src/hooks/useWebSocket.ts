import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/ChatPanel';

export function useWebSocket(meetingId: string, userId: number) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000; // 2 seconds
  
  // Function to create and set up a WebSocket connection
  const setupWebSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }
    
    // Set up WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Make sure to use the correct port for the WebSocket connection
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;
    
    try {
      console.log(`Connecting to WebSocket at: ${wsUrl} (Attempt ${reconnectAttemptsRef.current + 1})`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Connection opened
      socket.addEventListener('open', () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        
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
        try {
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
        } catch (parseErr) {
          console.error('Error parsing WebSocket message:', parseErr);
        }
      });
      
      // Connection closed
      socket.addEventListener('close', (event: CloseEvent) => {
        console.log(`WebSocket disconnected: Code ${event.code}, Reason: ${event.reason || 'None'}`);
        setIsConnected(false);
        
        // Attempt to reconnect if not closing intentionally and haven't exceeded max attempts
        const wasIntentionallyClosed = event.code === 1000; // Normal closure
        if (!wasIntentionallyClosed && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current} in ${RECONNECT_DELAY}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setupWebSocket();
          }, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.error('Max reconnect attempts reached. Giving up.');
        }
      });
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
    }
  };
  
  useEffect(() => {
    // Initial connection setup
    setupWebSocket();
    
    // Clean up on unmount
    return () => {
      // Clear any pending reconnect timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Close the WebSocket if open
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          // Send leave message
          const leaveMessage = {
            type: 'leave',
            payload: {
              meetingId,
              userId
            }
          };
          
          socketRef.current.send(JSON.stringify(leaveMessage));
        } catch (e) {
          console.error('Error sending leave message:', e);
        }
        
        socketRef.current.close();
      }
    };
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
