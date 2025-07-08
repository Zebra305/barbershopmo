import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertQueueEntrySchema, insertReviewSchema, insertGalleryItemSchema, insertAiChatMessageSchema } from "@shared/schema";
import { z } from "zod";

interface QueueUpdateMessage {
  type: 'queue_update';
  count: number;
  estimatedWait: string;
  businessStatus?: {
    isOpen: boolean;
    message: string;
    nextOpenTime?: string;
  };
}

interface AiChatMessage {
  type: 'ai_chat';
  message: string;
  isFromUser: boolean;
}

type WebSocketMessage = QueueUpdateMessage | AiChatMessage;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Simple admin check middleware (for demo purposes)
  const checkAdminSession = (req: any, res: any, next: any) => {
    const adminHeader = req.headers['x-admin-session'];
    console.log('Admin header check:', adminHeader, typeof adminHeader);
    if (adminHeader === 'true') {
      next();
    } else {
      res.status(403).json({ message: "Admin access required" });
    }
  };

  // Auth routes are handled in auth.ts

  // Queue management routes
  app.get('/api/queue/status', async (req, res) => {
    try {
      const queueLength = await storage.getCurrentQueueLength();
      const estimatedWait = Math.max(queueLength * 15, 0); // 15 minutes per person
      const { getBusinessStatus } = await import('@shared/business-hours');
      const businessStatus = getBusinessStatus();
      
      res.json({
        count: queueLength,
        estimatedWait: estimatedWait > 0 ? `${estimatedWait}-${estimatedWait + 5} minutes` : 'No wait',
        lastUpdate: new Date().toISOString(),
        businessStatus,
      });
    } catch (error) {
      console.error("Error fetching queue status:", error);
      res.status(500).json({ message: "Failed to fetch queue status" });
    }
  });

  app.post('/api/queue/add', checkAdminSession, async (req: any, res) => {
    try {

      const data = insertQueueEntrySchema.parse(req.body);
      const entry = await storage.addQueueEntry(data);
      
      // Broadcast queue update via WebSocket
      const queueLength = await storage.getCurrentQueueLength();
      await broadcastQueueUpdate(queueLength);
      
      res.json(entry);
    } catch (error) {
      console.error("Error adding queue entry:", error);
      res.status(500).json({ message: "Failed to add queue entry" });
    }
  });

  app.post('/api/queue/complete/:id', checkAdminSession, async (req: any, res) => {
    try {

      const id = parseInt(req.params.id);
      const { actualDuration } = req.body;
      
      await storage.completeQueueEntry(id, actualDuration);
      
      // Broadcast queue update via WebSocket
      const queueLength = await storage.getCurrentQueueLength();
      await broadcastQueueUpdate(queueLength);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing queue entry:", error);
      res.status(500).json({ message: "Failed to complete queue entry" });
    }
  });

  app.get('/api/queue/analytics/:date', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const date = new Date(req.params.date);
      const analytics = await storage.getQueueAnalytics(date);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching queue analytics:", error);
      res.status(500).json({ message: "Failed to fetch queue analytics" });
    }
  });

  // Reviews routes
  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await storage.getVisibleReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const data = insertReviewSchema.parse(req.body);
      const review = await storage.addReview(data);
      res.json(review);
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ message: "Failed to add review" });
    }
  });

  // Gallery routes
  app.get('/api/gallery', async (req, res) => {
    try {
      const items = await storage.getVisibleGalleryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      res.status(500).json({ message: "Failed to fetch gallery items" });
    }
  });

  app.post('/api/gallery', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const data = insertGalleryItemSchema.parse(req.body);
      const item = await storage.addGalleryItem(data);
      res.json(item);
    } catch (error) {
      console.error("Error adding gallery item:", error);
      res.status(500).json({ message: "Failed to add gallery item" });
    }
  });

  // AI Chat routes
  app.get('/api/ai-chat/history', checkAdminSession, async (req: any, res) => {
    try {
      const history = await storage.getAiChatHistory('admin-demo');
      res.json(history);
    } catch (error) {
      console.error("Error fetching AI chat history:", error);
      res.status(500).json({ message: "Failed to fetch AI chat history" });
    }
  });

  app.post('/api/ai-chat/message', checkAdminSession, async (req: any, res) => {
    try {
      const data = insertAiChatMessageSchema.parse(req.body);
      const message = await storage.addAiChatMessage({
        ...data,
        userId: 'admin-demo',
      });

      // TODO: Send to AI webhook via n8n
      // For now, we'll just store the message
      
      res.json(message);
    } catch (error) {
      console.error("Error adding AI chat message:", error);
      res.status(500).json({ message: "Failed to add AI chat message" });
    }
  });

  // Webhook for AI responses
  app.post('/api/webhook/ai-response', async (req, res) => {
    try {
      const { userId, message } = req.body;
      
      const aiMessage = await storage.addAiChatMessage({
        userId,
        message,
        isFromUser: false,
      });

      // Broadcast AI response via WebSocket
      broadcastAiMessage(userId, message, false);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error processing AI webhook:", error);
      res.status(500).json({ message: "Failed to process AI response" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<WebSocket, string>();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          clients.set(ws, data.userId);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });

  async function broadcastQueueUpdate(count: number) {
    const estimatedWait = Math.max(count * 15, 0);
    const { getBusinessStatus } = await import('@shared/business-hours');
    const businessStatus = getBusinessStatus();
    
    const message: QueueUpdateMessage = {
      type: 'queue_update',
      count,
      estimatedWait: estimatedWait > 0 ? `${estimatedWait}-${estimatedWait + 5} minutes` : 'No wait',
      businessStatus,
    };
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  function broadcastAiMessage(userId: string, message: string, isFromUser: boolean) {
    const wsMessage: AiChatMessage = {
      type: 'ai_chat',
      message,
      isFromUser,
    };
    
    clients.forEach((clientUserId, client) => {
      if (clientUserId === userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(wsMessage));
      }
    });
  }

  return httpServer;
}
