import { users, posts, comments, analytics, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type Analytics, type InsertAnalytics } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPosts(authorId?: number, status?: string, limit?: number, offset?: number): Promise<Post[]>;
  updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  incrementPostViews(id: number): Promise<boolean>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByPost(postId: number, status?: string): Promise<Comment[]>;
  getCommentsByUser(userId: number): Promise<Comment[]>;
  updateCommentStatus(id: number, status: string): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Analytics operations
  recordAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalytics(postId?: number, startDate?: Date, endDate?: Date): Promise<Analytics[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private analytics: Map<number, Analytics>;
  private currentUserId: number;
  private currentPostId: number;
  private currentCommentId: number;
  private currentAnalyticsId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.analytics = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentCommentId = 1;
    this.currentAnalyticsId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Post operations
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const now = new Date();
    const post: Post = {
      ...insertPost,
      id,
      createdAt: now,
      updatedAt: now,
      views: 0
    };
    this.posts.set(id, post);
    return post;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.slug === slug,
    );
  }

  async getPosts(authorId?: number, status?: string, limit = 10, offset = 0): Promise<Post[]> {
    let filteredPosts = Array.from(this.posts.values());
    
    if (authorId !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.authorId === authorId);
    }
    
    if (status !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.status === status);
    }
    
    // Sort by created date, newest first
    filteredPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return filteredPosts.slice(offset, offset + limit);
  }

  async updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost: Post = { 
      ...post, 
      ...postData, 
      updatedAt: new Date() 
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async incrementPostViews(id: number): Promise<boolean> {
    const post = this.posts.get(id);
    if (!post) return false;
    
    post.views = (post.views || 0) + 1;
    this.posts.set(id, post);
    return true;
  }

  // Comment operations
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: now
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPost(postId: number, status?: string): Promise<Comment[]> {
    let postComments = Array.from(this.comments.values())
      .filter(comment => comment.postId === postId);
    
    if (status !== undefined) {
      postComments = postComments.filter(comment => comment.status === status);
    }
    
    // Sort by created date, newest first
    postComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return postComments;
  }

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.authorId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async updateCommentStatus(id: number, status: string): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    comment.status = status;
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Analytics operations
  async recordAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const now = new Date();
    const analyticsEntry: Analytics = {
      ...insertAnalytics,
      id,
      date: now
    };
    this.analytics.set(id, analyticsEntry);
    return analyticsEntry;
  }

  async getAnalytics(postId?: number, startDate?: Date, endDate?: Date): Promise<Analytics[]> {
    let filteredAnalytics = Array.from(this.analytics.values());
    
    if (postId !== undefined) {
      filteredAnalytics = filteredAnalytics.filter(entry => entry.postId === postId);
    }
    
    if (startDate) {
      filteredAnalytics = filteredAnalytics.filter(entry => 
        new Date(entry.date) >= startDate
      );
    }
    
    if (endDate) {
      filteredAnalytics = filteredAnalytics.filter(entry => 
        new Date(entry.date) <= endDate
      );
    }
    
    return filteredAnalytics;
  }
}

export const storage = new MemStorage();
