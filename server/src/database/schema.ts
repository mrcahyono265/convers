import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  level: text("level").default("beginner"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversationSessions = pgTable("conversation_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  topic: text("topic"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => conversationSessions.id).notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  grammarMistakes: jsonb("grammar_mistakes"),
  suggestedCorrection: text("suggested_correction"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversationMemories = pgTable("conversation_memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  memoryType: text("memory_type").notNull(), // 'grammar_weakness', 'interest', etc.
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vocabularies = pgTable("vocabularies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  word: text("word").notNull(),
  meaning: text("meaning"),
  example: text("example"),
  status: text("status").default("learning"), // 'learning', 'review', 'mastered'
  reviewCount: integer("review_count").default(0),
  practiceAttempts: integer("practice_attempts").default(0),
  lastReviewedAt: timestamp("last_reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journals = pgTable("journals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  aiFeedback: jsonb("ai_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyProgress = pgTable("daily_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  conversationMinutes: integer("conversation_minutes").default(0),
  vocabularyReviewed: integer("vocabulary_reviewed").default(0),
  journalWritten: boolean("journal_written").default(false),
  averageConfidence: integer("average_confidence").default(0),
});
