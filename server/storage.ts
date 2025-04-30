import { 
  users, type User, type InsertUser,
  meetings, type Meeting, type InsertMeeting,
  messages, type Message, type InsertMessage,
  participants, type Participant, type InsertParticipant
} from "@shared/schema";

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
    const meeting: Meeting = { ...insertMeeting, id, createdAt };
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
    const participant: Participant = { ...insertParticipant, id, joinedAt };
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
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
}

export const storage = new MemStorage();
