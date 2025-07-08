import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Queue management
export const queueEntries = pgTable("queue_entries", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  serviceType: varchar("service_type").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // in minutes
  actualDuration: integer("actual_duration"), // in minutes, null if not completed
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name").notNull(),
  customerType: varchar("customer_type").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gallery items
export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url").notNull(),
  category: varchar("category").notNull(),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Chat messages
export const aiChatMessages = pgTable("ai_chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  isFromUser: boolean("is_from_user").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Analytics for queue prediction
export const queueAnalytics = pgTable("queue_analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  hour: integer("hour").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  queueLength: integer("queue_length").notNull(),
  averageWaitTime: integer("average_wait_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type QueueEntry = typeof queueEntries.$inferSelect;
export type InsertQueueEntry = typeof queueEntries.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = typeof aiChatMessages.$inferInsert;

export type QueueAnalytics = typeof queueAnalytics.$inferSelect;
export type InsertQueueAnalytics = typeof queueAnalytics.$inferInsert;

// Validation schemas
export const insertQueueEntrySchema = createInsertSchema(queueEntries).pick({
  serviceType: true,
  estimatedDuration: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  customerName: true,
  customerType: true,
  rating: true,
  comment: true,
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).pick({
  title: true,
  description: true,
  imageUrl: true,
  category: true,
});

export const insertAiChatMessageSchema = createInsertSchema(aiChatMessages).pick({
  message: true,
  isFromUser: true,
});
