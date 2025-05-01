import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { Prisma } from '@prisma/client';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Meeting methods
  createMeeting(meeting: any): Promise<any>;
  getMeeting(id: number): Promise<any | undefined>;
  getMeetingByMeetingId(meetingId: string): Promise<any | undefined>;
  updateMeetingRecording(meetingId: string, isRecording: boolean): Promise<boolean>;
  
  // Participant methods
  addParticipant(participant: any): Promise<any>;
  getParticipant(meetingId: string, userId: number): Promise<any | undefined>;
  getMeetingParticipants(meetingId: string): Promise<any[]>;
  
  // Message methods
  createMessage(message: any): Promise<any>;
  getMeetingMessages(meetingId: string): Promise<any[]>;
}

export class PrismaStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<any | undefined> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }
  
  async createUser(userData: any): Promise<any> {
    try {
      // Hash password if provided
      let data = {...userData};
      if (data.password && !data.password.startsWith('$2b$')) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      
      const user = await prisma.user.create({
        data
      });
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  // Meeting methods
  async createMeeting(meetingData: any): Promise<any> {
    try {
      // Ensure we have a meeting_id
      if (!meetingData.meeting_id) {
        meetingData.meeting_id = uuidv4().substring(0, 8);
      }
      
      const meeting = await prisma.meeting.create({
        data: meetingData,
        include: {
          creator: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
      });
      return meeting;
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  }
  
  async getMeeting(id: number): Promise<any | undefined> {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
      });
      return meeting;
    } catch (error) {
      console.error("Error getting meeting:", error);
      return undefined;
    }
  }
  
  async getMeetingByMeetingId(meetingId: string): Promise<any | undefined> {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { meeting_id: meetingId },
        include: {
          creator: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
      });
      return meeting;
    } catch (error) {
      console.error("Error getting meeting by meetingId:", error);
      return undefined;
    }
  }
  
  async updateMeetingRecording(meetingId: string, isRecording: boolean): Promise<boolean> {
    try {
      const meeting = await prisma.meeting.update({
        where: { meeting_id: meetingId },
        data: { is_recording: isRecording },
      });
      return !!meeting;
    } catch (error) {
      console.error("Error updating meeting recording:", error);
      return false;
    }
  }
  
  // Participant methods
  async addParticipant(participantData: any): Promise<any> {
    try {
      const participant = await prisma.participant.create({
        data: participantData,
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
      });
      return participant;
    } catch (error) {
      console.error("Error adding participant:", error);
      throw error;
    }
  }
  
  async getParticipant(meetingId: string, userId: number): Promise<any | undefined> {
    try {
      const participant = await prisma.participant.findFirst({
        where: {
          meeting_id: meetingId,
          user_id: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
      });
      return participant;
    } catch (error) {
      console.error("Error getting participant:", error);
      return undefined;
    }
  }
  
  async getMeetingParticipants(meetingId: string): Promise<any[]> {
    try {
      const participants = await prisma.participant.findMany({
        where: { meeting_id: meetingId },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
      });
      return participants;
    } catch (error) {
      console.error("Error getting meeting participants:", error);
      return [];
    }
  }
  
  // Message methods
  async createMessage(messageData: any): Promise<any> {
    try {
      const message = await prisma.message.create({
        data: messageData,
        include: {
          sender: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
      });
      return message;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }
  
  async getMeetingMessages(meetingId: string): Promise<any[]> {
    try {
      const messages = await prisma.message.findMany({
        where: { meeting_id: meetingId },
        include: {
          sender: {
            select: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
        orderBy: { sent_at: 'asc' },
      });
      return messages;
    } catch (error) {
      console.error("Error getting meeting messages:", error);
      return [];
    }
  }
}

// Add a test user on startup
async function ensureTestUser() {
  try {
    const storage = new PrismaStorage();
    let user = await storage.getUserByUsername("testuser");
    if (!user) {
      console.log("Creating test user 'testuser'");
      await storage.createUser({
        username: "testuser",
        password: "password123",
        display_name: "Test User",
      });
    }
  } catch (error) {
    console.error("Error setting up test user:", error);
  }
}

// Initialize the storage
export const storage = new PrismaStorage();

// Set up the test user
ensureTestUser().catch(console.error);