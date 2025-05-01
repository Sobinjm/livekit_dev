import { 
  users, type User, type InsertUser,
  meetings, type Meeting, type InsertMeeting,
  messages, type Message, type InsertMessage,
  participants, type Participant, type InsertParticipant
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Meeting methods
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingByMeetingId(meetingId: string): Promise<Meeting | undefined>;
  updateMeetingRecording(meetingId: string, isRecording: boolean): Promise<boolean>;
  
  // Participant methods
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipant(meetingId: string, userId: number): Promise<Participant | undefined>;
  getMeetingParticipants(meetingId: string): Promise<Participant[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMeetingMessages(meetingId: string): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetings: Map<number, Meeting>;
  private participants: Map<string, Participant>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private meetingIdCounter: number;
  private participantIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.meetings = new Map();
    this.participants = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.meetingIdCounter = 1;
    this.participantIdCounter = 1;
    this.messageIdCounter = 1;
    
    // Add a default test user
    this.createUser({
      username: "testuser",
      password: "password",
      displayName: "Test User"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Meeting methods
  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingIdCounter++;
    const createdAt = new Date();
    const meeting: Meeting = { 
      ...insertMeeting, 
      id, 
      createdAt,
      description: insertMeeting.description || null,
      isRecording: insertMeeting.isRecording ?? false
    };
    this.meetings.set(id, meeting);
    return meeting;
  }
  
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }
  
  async getMeetingByMeetingId(meetingId: string): Promise<Meeting | undefined> {
    return Array.from(this.meetings.values()).find(
      (meeting) => meeting.meetingId === meetingId,
    );
  }
  
  async updateMeetingRecording(meetingId: string, isRecording: boolean): Promise<boolean> {
    const meeting = await this.getMeetingByMeetingId(meetingId);
    if (meeting) {
      meeting.isRecording = isRecording;
      this.meetings.set(meeting.id, meeting);
      return true;
    }
    return false;
  }
  
  // Participant methods
  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.participantIdCounter++;
    const joinedAt = new Date();
    const participant: Participant = { 
      ...insertParticipant, 
      id, 
      joinedAt,
      isHost: insertParticipant.isHost ?? false
    };
    this.participants.set(`${participant.meetingId}-${participant.userId}`, participant);
    return participant;
  }
  
  async getParticipant(meetingId: string, userId: number): Promise<Participant | undefined> {
    return this.participants.get(`${meetingId}-${userId}`);
  }
  
  async getMeetingParticipants(meetingId: string): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter(
      (participant) => participant.meetingId === meetingId,
    );
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const sentAt = new Date();
    const message: Message = { ...insertMessage, id, sentAt };
    this.messages.set(id, message);
    return message;
  }
  
  async getMeetingMessages(meetingId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.meetingId === meetingId)
      .sort((a, b) => {
        const aTime = a.sentAt ? a.sentAt.getTime() : 0;
        const bTime = b.sentAt ? b.sentAt.getTime() : 0;
        return aTime - bTime;
      });
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.username, username));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const results = await db.insert(users).values(insertUser).returning();
      return results[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  // Meeting methods
  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    try {
      const results = await db.insert(meetings).values(insertMeeting).returning();
      return results[0];
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  }
  
  async getMeeting(id: number): Promise<Meeting | undefined> {
    try {
      const results = await db.select().from(meetings).where(eq(meetings.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error("Error getting meeting:", error);
      return undefined;
    }
  }
  
  async getMeetingByMeetingId(meetingId: string): Promise<Meeting | undefined> {
    try {
      const results = await db.select().from(meetings).where(eq(meetings.meetingId, meetingId));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error("Error getting meeting by meetingId:", error);
      return undefined;
    }
  }
  
  async updateMeetingRecording(meetingId: string, isRecording: boolean): Promise<boolean> {
    try {
      const results = await db
        .update(meetings)
        .set({ isRecording })
        .where(eq(meetings.meetingId, meetingId))
        .returning();
      
      return results.length > 0;
    } catch (error) {
      console.error("Error updating meeting recording:", error);
      return false;
    }
  }
  
  // Participant methods
  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    try {
      const results = await db.insert(participants).values(insertParticipant).returning();
      return results[0];
    } catch (error) {
      console.error("Error adding participant:", error);
      throw error;
    }
  }
  
  async getParticipant(meetingId: string, userId: number): Promise<Participant | undefined> {
    try {
      const results = await db
        .select()
        .from(participants)
        .where(and(
          eq(participants.meetingId, meetingId),
          eq(participants.userId, userId)
        ));
      
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error("Error getting participant:", error);
      return undefined;
    }
  }
  
  async getMeetingParticipants(meetingId: string): Promise<Participant[]> {
    try {
      return await db
        .select()
        .from(participants)
        .where(eq(participants.meetingId, meetingId));
    } catch (error) {
      console.error("Error getting meeting participants:", error);
      return [];
    }
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const results = await db.insert(messages).values(insertMessage).returning();
      return results[0];
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }
  
  async getMeetingMessages(meetingId: string): Promise<Message[]> {
    try {
      return await db
        .select()
        .from(messages)
        .where(eq(messages.meetingId, meetingId))
        .orderBy(messages.sentAt);
    } catch (error) {
      console.error("Error getting meeting messages:", error);
      return [];
    }
  }
}

// Add a test user on startup
async function ensureTestUser() {
  try {
    const dbStorage = new DatabaseStorage();
    let user = await dbStorage.getUserByUsername("testuser");
    if (!user) {
      console.log("Creating test user 'testuser'");
      await dbStorage.createUser({
        username: "testuser",
        password: "password",
        displayName: "Test User"
      });
    }
  } catch (error) {
    console.error("Error setting up test user:", error);
  }
}

// Initialize the database storage
export const storage = new DatabaseStorage();

// Set up the test user after tables are created
ensureTestUser().catch(console.error);
