import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPostSchema, insertCommentSchema, insertAnalyticsSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Error handling for Zod validation
  const handleValidation = (schema: any, data: any) => {
    try {
      return { success: true, data: schema.parse(data) };
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, error: error.format() };
      }
      throw error;
    }
  };

  // Check if user is authenticated middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Posts API
  // Fetch all posts (public endpoint)
  app.get("/api/posts/all", async (req, res) => {
    try {
      const status = "published"; // Only published posts for public viewing
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      
      const posts = await storage.getPosts(undefined, status, limit, offset);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get posts with filtering
  app.get("/api/posts", async (req, res) => {
    try {
      const authorId = req.query.authorId ? Number(req.query.authorId) : undefined;
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const offset = req.query.offset ? Number(req.query.offset) : 0;

      const posts = await storage.getPosts(authorId, status, limit, offset);
      
      // Only return published posts to unauthenticated users
      if (!req.isAuthenticated()) {
        const publishedPosts = posts.filter(post => post.status === "published");
        return res.json(publishedPosts);
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Only allow access to published posts for unauthenticated users
      if (!req.isAuthenticated() && post.status !== "published") {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment post views
      await storage.incrementPostViews(postId);
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const validation = handleValidation(insertPostSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Validation failed", errors: validation.error });
      }
      
      // Set current user as author
      const post = await storage.createPost({
        ...validation.data,
        authorId: req.user!.id
      });
      
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is the author
      if (post.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validation = handleValidation(insertPostSchema.partial(), req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Validation failed", errors: validation.error });
      }
      
      const updatedPost = await storage.updatePost(postId, validation.data);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is the author
      if (post.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deletePost(postId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Explicitly increment post views
  app.post("/api/posts/:id/view", async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      await storage.incrementPostViews(postId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment view count" });
    }
  });

  // Comments API
  // Get comments for a specific post
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = Number(req.params.postId);
      
      // Check if post exists
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // If not authenticated, only approved comments are visible
      const status = !req.isAuthenticated() ? "approved" : undefined;
      
      const comments = await storage.getCommentsByPost(postId, status);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // Get comments by post ID (alternative endpoint)
  app.get("/api/comments/:postId", async (req, res) => {
    try {
      const postId = Number(req.params.postId);
      
      // Check if post exists
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // If not authenticated, only approved comments are visible
      const status = !req.isAuthenticated() ? "approved" : undefined;
      
      const comments = await storage.getCommentsByPost(postId, status);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", isAuthenticated, async (req, res) => {
    try {
      const postId = Number(req.params.postId);
      
      // Check if post exists and allows comments
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.allowComments === false) {
        return res.status(403).json({ message: "Comments are disabled for this post" });
      }
      
      const validation = handleValidation(insertCommentSchema, {
        ...req.body,
        postId,
        authorId: req.user!.id
      });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation failed", errors: validation.error });
      }
      
      const comment = await storage.createComment(validation.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.put("/api/comments/:id/status", isAuthenticated, async (req, res) => {
    try {
      const commentId = Number(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "approved", "rejected", "spam"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Check if user is post author
      const post = await storage.getPost(comment.postId);
      if (!post || post.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedComment = await storage.updateCommentStatus(commentId, status);
      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update comment status" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const commentId = Number(req.params.id);
      const comment = await storage.getComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Check if user is post author or comment author
      const post = await storage.getPost(comment.postId);
      if ((!post || post.authorId !== req.user!.id) && comment.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteComment(commentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Analytics API
  app.get("/api/analytics", isAuthenticated, async (req, res) => {
    try {
      const postId = req.query.postId ? Number(req.query.postId) : undefined;
      const startDateStr = req.query.startDate as string | undefined;
      const endDateStr = req.query.endDate as string | undefined;
      
      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;
      
      const analytics = await storage.getAnalytics(postId, startDate, endDate);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post("/api/analytics", async (req, res) => {
    try {
      const validation = handleValidation(insertAnalyticsSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Validation failed", errors: validation.error });
      }
      
      const analytics = await storage.recordAnalytics(validation.data);
      res.status(201).json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to record analytics" });
    }
  });

  // User profile API
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const allowedFields = ["firstName", "lastName", "bio", "website", "avatar", "twitter", "linkedin", "github"];
      
      const updateData: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
