import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  isGuest: boolean("is_guest").default(true),
  level: text("level").default("beginner"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversationSessions = pgTable("conversation_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  topic: text("topic"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
}, (table) => ({
  userIdIdx: index("idx_sessions_user_id").on(table.userId),
}));

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => conversationSessions.id).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  grammarMistakes: jsonb("grammar_mistakes"),
  suggestedCorrection: text("suggested_correction"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("idx_messages_session_id").on(table.sessionId),
}));

export const conversationMemories = pgTable("conversation_memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  memoryType: text("memory_type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_memories_user_id").on(table.userId),
}));

export const vocabularies = pgTable("vocabularies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  word: text("word").notNull(),
  meaning: text("meaning"),
  example: text("example"),
  status: text("status").default("learning"),
  reviewCount: integer("review_count").default(0),
  practiceAttempts: integer("practice_attempts").default(0),
  lastReviewedAt: timestamp("last_reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdWordIdx: index("idx_vocab_user_id_word").on(table.userId, table.word),
}));

export const journals = pgTable("journals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  aiFeedback: jsonb("ai_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_journals_user_id").on(table.userId),
}));

export const dailyProgress = pgTable("daily_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  conversationMinutes: integer("conversation_minutes").default(0),
  vocabularyReviewed: integer("vocabulary_reviewed").default(0),
  journalWritten: boolean("journal_written").default(false),
  averageConfidence: integer("average_confidence").default(0),
  averageWpm: integer("average_wpm").default(0),
}, (table) => ({
  userIdDateIdx: index("idx_progress_user_id_date").on(table.userId, table.date),
}));
