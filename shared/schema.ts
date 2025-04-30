import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

// Meeting model
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  meetingId: text("meeting_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  isRecording: boolean("is_recording").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeetingSchema = createInsertSchema(meetings).pick({
  meetingId: true,
  name: true,
  description: true,
  createdBy: true,
  isRecording: true,
});

// Message model for chat
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  meetingId: text("meeting_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  meetingId: true,
  senderId: true,
  content: true,
});

// Participant model
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  meetingId: text("meeting_id").notNull(),
  userId: integer("user_id").notNull(),
  isHost: boolean("is_host").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  meetingId: true,
  userId: true,
  isHost: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
