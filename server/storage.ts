import {
  users,
  queueEntries,
  reviews,
  galleryItems,
  aiChatMessages,
  queueAnalytics,
  type User,
  type UpsertUser,
  type QueueEntry,
  type InsertQueueEntry,
  type Review,
  type InsertReview,
  type GalleryItem,
  type InsertGalleryItem,
  type AiChatMessage,
  type InsertAiChatMessage,
  type QueueAnalytics,
  type InsertQueueAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (simplified for self-hosted auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Queue management
  getCurrentQueueLength(): Promise<number>;
  addQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry>;
  completeQueueEntry(id: number, actualDuration: number): Promise<void>;
  getQueueAnalytics(date: Date): Promise<QueueAnalytics[]>;
  insertQueueAnalytics(analytics: InsertQueueAnalytics): Promise<void>;
  
  // Reviews
  getVisibleReviews(): Promise<Review[]>;
  addReview(review: InsertReview): Promise<Review>;
  
  // Gallery
  getVisibleGalleryItems(): Promise<GalleryItem[]>;
  addGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  
  // AI Chat
  getAiChatHistory(userId: string): Promise<AiChatMessage[]>;
  addAiChatMessage(message: InsertAiChatMessage & { userId: string }): Promise<AiChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Queue management
  async getCurrentQueueLength(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(queueEntries)
      .where(eq(queueEntries.isCompleted, false));
    return result.count;
  }

  async addQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry> {
    const [queueEntry] = await db
      .insert(queueEntries)
      .values(entry)
      .returning();
    return queueEntry;
  }

  async completeQueueEntry(id: number, actualDuration: number): Promise<void> {
    await db
      .update(queueEntries)
      .set({ 
        isCompleted: true, 
        actualDuration 
      })
      .where(eq(queueEntries.id, id));
  }

  async getQueueAnalytics(date: Date): Promise<QueueAnalytics[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(queueAnalytics)
      .where(
        and(
          gte(queueAnalytics.date, startOfDay),
          lte(queueAnalytics.date, endOfDay)
        )
      );
  }

  async insertQueueAnalytics(analytics: InsertQueueAnalytics): Promise<void> {
    await db.insert(queueAnalytics).values(analytics);
  }

  // Reviews
  async getVisibleReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.isVisible, true))
      .orderBy(desc(reviews.createdAt));
  }

  async addReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  // Gallery
  async getVisibleGalleryItems(): Promise<GalleryItem[]> {
    return await db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.isVisible, true))
      .orderBy(galleryItems.sortOrder);
  }

  async addGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const [newItem] = await db
      .insert(galleryItems)
      .values(item)
      .returning();
    return newItem;
  }

  // AI Chat
  async getAiChatHistory(userId: string): Promise<AiChatMessage[]> {
    return await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.userId, userId))
      .orderBy(aiChatMessages.timestamp);
  }

  async addAiChatMessage(message: InsertAiChatMessage & { userId: string }): Promise<AiChatMessage> {
    const [newMessage] = await db
      .insert(aiChatMessages)
      .values(message)
      .returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
