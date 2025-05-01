import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./prisma-storage";
import { v4 as uuidv4 } from "uuid";
import { AccessToken } from "livekit-server-sdk";
import { z } from "zod";

interface WSMessage {
  type: string;
  payload: any;
}

// Zod schemas for validation
const meetingSchema = z.object({
  meeting_id: z.string().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  created_at: z.coerce.date().optional().default(new Date()),
  created_by: z.number(),
  is_recording: z.boolean().optional().default(false),
});

const participantSchema = z.object({
  meeting_id: z.string(),
  user_id: z.number(),
  is_host: z.boolean().optional().default(false),
});

const messageSchema = z.object({
  meeting_id: z.string(),
  sender_id: z.number(),
  content: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time chat and meeting updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by meetingId
  const connections: Record<string, WebSocket[]> = {};
  
  wss.on('connection', (ws: WebSocket) => {
    let meetingId: string = '';
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message) as WSMessage;
        
        switch (data.type) {
          case 'join':
            meetingId = data.payload.meetingId;
            if (!connections[meetingId]) {
              connections[meetingId] = [];
            }
            connections[meetingId].push(ws);
            
            // Broadcast to other participants that someone joined
            broadcastToMeeting(meetingId, {
              type: 'participant_joined',
              payload: {
                userId: data.payload.userId,
                displayName: data.payload.displayName
              }
            }, ws);
            break;
            
          case 'chat':
            if (meetingId && data.payload.message && data.payload.senderId) {
              // Store the message
              const messageData = {
                meeting_id: meetingId,
                sender_id: data.payload.senderId,
                content: data.payload.message
              };
              
              try {
                const parsedMessage = messageSchema.parse(messageData);
                const savedMessage = await storage.createMessage(parsedMessage);
                
                // Broadcast to all participants in the meeting
                broadcastToMeeting(meetingId, {
                  type: 'chat_message',
                  payload: {
                    id: savedMessage.id,
                    senderId: savedMessage.sender_id,
                    content: savedMessage.content,
                    sentAt: savedMessage.sent_at
                  }
                });
              } catch (error) {
                ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message data' } }));
              }
            }
            break;
            
          case 'leave':
            if (meetingId) {
              // Remove from connections
              connections[meetingId] = connections[meetingId].filter(conn => conn !== ws);
              
              // Broadcast to other participants that someone left
              broadcastToMeeting(meetingId, {
                type: 'participant_left',
                payload: {
                  userId: data.payload.userId
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Clean up connection when WebSocket closes
      if (meetingId && connections[meetingId]) {
        connections[meetingId] = connections[meetingId].filter(conn => conn !== ws);
      }
    });
  });
  
  function broadcastToMeeting(meetingId: string, data: any, exclude?: WebSocket) {
    if (connections[meetingId]) {
      const message = JSON.stringify(data);
      connections[meetingId].forEach(client => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }
  
  // API Routes
  app.get('/api/user/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (user) {
      // Don't send password back to client
      const { password, ...userData } = user;
      res.json(userData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
  
  // Create a meeting
  app.post('/api/meetings', async (req, res) => {
    try {
      const meeting_id = uuidv4().substring(0, 8);
      const meetingData = {
        ...req.body,
        meeting_id
      };
      
      const parsedMeeting = meetingSchema.parse(meetingData);
      const meeting = await storage.createMeeting(parsedMeeting);
      
      // Add creator as a participant and host
      const participantData = {
        meeting_id: meeting.meeting_id,
        user_id: meeting.created_by,
        is_host: true
      };
      
      const parsedParticipant = participantSchema.parse(participantData);
      await storage.addParticipant(parsedParticipant);
      
      res.status(201).json(meeting);
    } catch (error) {
      console.error('Error creating meeting:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid meeting data', errors: error.format() });
      } else {
        res.status(400).json({ message: 'Invalid meeting data' });
      }
    }
  });
  
  // Get meeting details
  app.get('/api/meetings/:meetingId', async (req, res) => {
    const { meetingId } = req.params;
    const meeting = await storage.getMeetingByMeetingId(meetingId);
    
    if (meeting) {
      res.json(meeting);
    } else {
      res.status(404).json({ message: 'Meeting not found' });
    }
  });
  
  // Join a meeting
  app.post('/api/meetings/:meetingId/join', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { userId } = req.body;
      
      // Check if meeting exists
      const meeting = await storage.getMeetingByMeetingId(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user is already a participant
      const existingParticipant = await storage.getParticipant(meetingId, userId);
      if (existingParticipant) {
        return res.status(200).json({ message: 'Already joined', participant: existingParticipant });
      }
      
      // Add user as participant
      const participantData = {
        meeting_id: meetingId,
        user_id: userId,
        is_host: false
      };
      
      const parsedParticipant = participantSchema.parse(participantData);
      const participant = await storage.addParticipant(parsedParticipant);
      
      res.status(201).json({ message: 'Joined meeting successfully', participant });
    } catch (error) {
      console.error('Error joining meeting:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data', errors: error.format() });
      } else {
        res.status(400).json({ message: 'Invalid data' });
      }
    }
  });
  
  // Get meeting participants
  app.get('/api/meetings/:meetingId/participants', async (req, res) => {
    const { meetingId } = req.params;
    const participants = await storage.getMeetingParticipants(meetingId);
    res.json(participants);
  });
  
  // Get meeting chat messages
  app.get('/api/meetings/:meetingId/messages', async (req, res) => {
    const { meetingId } = req.params;
    const messages = await storage.getMeetingMessages(meetingId);
    res.json(messages);
  });
  
  // Toggle meeting recording
  app.post('/api/meetings/:meetingId/recording', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { isRecording, userId } = req.body;
      
      // Check if user is host
      const participant = await storage.getParticipant(meetingId, userId);
      if (!participant || !participant.is_host) {
        return res.status(403).json({ message: 'Only meeting hosts can control recording' });
      }
      
      const updated = await storage.updateMeetingRecording(meetingId, isRecording);
      if (updated) {
        // Broadcast recording status change
        if (connections[meetingId]) {
          broadcastToMeeting(meetingId, {
            type: 'recording_changed',
            payload: { isRecording }
          });
        }
        
        res.json({ message: 'Recording status updated', isRecording });
      } else {
        res.status(404).json({ message: 'Meeting not found' });
      }
    } catch (error) {
      console.error('Error updating recording status:', error);
      res.status(400).json({ message: 'Invalid data' });
    }
  });
  
  // Generate LiveKit token for video conference
  app.post('/api/meetings/:meetingId/token', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { userId, username } = req.body;
      
      // Check if meeting exists
      const meeting = await storage.getMeetingByMeetingId(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }
      
      // Check if user is a participant
      const participant = await storage.getParticipant(meetingId, userId);
      if (!participant) {
        return res.status(403).json({ message: 'User is not a participant in this meeting' });
      }
      
      // In a production app, these would be set via environment variables
      const apiKey = 'devkey';
      const apiSecret = 'secret';
      
      // Create token
      const at = new AccessToken(apiKey, apiSecret, {
        identity: userId.toString(),
        name: username
      });
      
      // Give permissions based on whether user is host
      at.addGrant({
        roomJoin: true,
        room: meetingId,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
      });
      
      const token = at.toJwt();
      res.json({ token });
      
    } catch (error) {
      console.error('Error generating token:', error);
      res.status(400).json({ message: 'Failed to generate token' });
    }
  });
  
  return httpServer;
}