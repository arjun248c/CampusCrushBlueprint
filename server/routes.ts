import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRatingSchema, insertAppealSchema, insertFeedbackSchema, users, ratings } from "../shared/schema";
import { createHash } from "crypto";
import rateLimit from "express-rate-limit";
import { monitoring } from "./monitoring";
import session from "express-session";
import multer from "multer";
import path from "path";

// Helper to get user ID from request
function getUserId(req: any): string {
  return req.session?.userId;
}

// Simple auth middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.session?.userId) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Helper to hash IP/device for abuse prevention
function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Enhanced rate limiting middleware
async function checkCustomRateLimit(req: any, res: any, next: any, action: string) {
  try {
    const userId = getUserId(req);
    const ipHash = req.ip ? hashValue(req.ip) : "unknown";
    
    if (userId) {
      const isLimited = await storage.checkRateLimit(userId, ipHash, action);
      if (isLimited) {
        return res.status(429).json({ message: `Too many ${action} attempts. Please slow down.` });
      }
      
      await storage.recordAction(userId, ipHash, action);
    }
    
    next();
  } catch (error) {
    console.error(`Rate limit check failed for ${action}:`, error);
    next(); // Continue on error to avoid blocking legitimate requests
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting middleware
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const ratingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 ratings per minute
    message: "Too many rating submissions, please slow down",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute for general API
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Apply monitoring and rate limiting to all API routes
  app.use("/api", monitoring.performanceMiddleware());
  app.use("/api", apiLimiter);

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'campus-crush-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    name: 'campus-crush-session'
  }));

  // ============ Auth Routes ============
  app.post("/api/auth/login", authLimiter, async (req: any, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt:', { email, hasPassword: !!password });
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      // Simple demo login - in production, verify password hash
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      console.log('Session after login:', req.session);
      
      // Save session explicitly
      await new Promise((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
            reject(err);
          } else {
            console.log('Session saved successfully');
            resolve(undefined);
          }
        });
      });
      
      res.json({ user, message: "Login successful", sessionId: req.sessionID });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", authLimiter, async (req: any, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email || !firstName) {
        return res.status(400).json({ message: "Email and first name required" });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const user = await storage.upsertUser({
        email,
        firstName,
        lastName,
      });
      
      req.session.userId = user.id;
      res.json({ user, message: "Registration successful" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get("/api/auth/user", 
    authLimiter, 
    async (req: any, res) => {
      try {
        console.log('Auth check - Session:', req.session);
        console.log('Auth check - SessionID:', req.sessionID);
        const userId = getUserId(req);
        console.log('Auth check - UserId:', userId);
        
        if (!userId) {
          console.log('No user ID in session, returning null');
          return res.json(null);
        }
        
        const user = await storage.getUser(userId);
        console.log('User found:', !!user, user?.id);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    }
  );

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // ============ Profile Routes ============
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  app.put("/api/profile", authLimiter, isAuthenticated, upload.single('profileImage'), async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { displayName, bio } = req.body;

      let profileImageUrl = undefined;
      if (req.file) {
        profileImageUrl = await storage.saveProfileImage(userId, req.file);
      }

      const updateData: any = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (bio !== undefined) updateData.bio = bio;
      if (profileImageUrl) updateData.profileImageUrl = profileImageUrl;
      updateData.updatedAt = new Date();

      const updated = await storage.updateUserProfile(userId, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/profile/setup", authLimiter, isAuthenticated, upload.single('profileImage'), async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { collegeId, email, gender, displayName, bio } = req.body;

      // Basic validation
      if (!collegeId || typeof collegeId !== "string") {
        return res.status(400).json({ message: "Valid college ID is required" });
      }
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Valid email is required" });
      }
      if (!email.endsWith('@sggs.ac.in')) {
        return res.status(400).json({ message: "Email must be from SGGS college (@sggs.ac.in)" });
      }
      if (!gender || !["male", "female", "other"].includes(gender)) {
        return res.status(400).json({ message: "Valid gender is required" });
      }

      let profileImageUrl = undefined;
      if (req.file) {
        // Save image and get URL
        profileImageUrl = await storage.saveProfileImage(userId, req.file);
      }

      const updated = await storage.updateUserProfile(userId, {
        email,
        collegeId,
        gender,
        displayName: displayName || undefined,
        bio: bio || undefined,
        profileImageUrl,
        verificationStatus: "verified", // Auto-verify for SGGS email domain
        lastActiveAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      console.error("Error setting up profile:", error);
      res.status(500).json({ message: "Failed to setup profile" });
    }
  });

  // ============ College Routes ============
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getAllColleges();
      res.json(colleges);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      res.status(500).json({ message: "Failed to fetch colleges" });
    }
  });

  // ============ Discovery Routes ============
  app.get("/api/profiles/random", 
    (req, res, next) => checkCustomRateLimit(req, res, next, "profile_view"),
    isAuthenticated, 
    async (req: any, res) => {
      try {
        const userId = getUserId(req);
        const limit = parseInt(req.query.limit as string) || 10;

        // Check if user has completed onboarding
        const user = await storage.getUser(userId);
        if (!user?.collegeId || !user?.gender) {
          return res.status(400).json({ message: "Please complete your profile first" });
        }

        const profiles = await storage.getRandomProfiles(userId, limit);
        res.json(profiles);
      } catch (error) {
        console.error("Error fetching random profiles:", error);
        res.status(500).json({ message: "Failed to fetch profiles" });
      }
    }
  );

  app.get("/api/profiles/search", 
    (req, res, next) => checkCustomRateLimit(req, res, next, "profile_search"),
    isAuthenticated, 
    async (req: any, res) => {
      try {
        const userId = getUserId(req);
        const query = req.query.q as string;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!query || query.trim().length < 2) {
          return res.status(400).json({ message: "Search query must be at least 2 characters" });
        }

        // Check if user has completed onboarding
        const user = await storage.getUser(userId);
        if (!user?.collegeId || !user?.gender) {
          return res.status(400).json({ message: "Please complete your profile first" });
        }

        const profiles = await storage.searchProfiles(userId, query.trim(), limit);
        res.json(profiles);
      } catch (error) {
        console.error("Error searching profiles:", error);
        res.status(500).json({ message: "Failed to search profiles" });
      }
    }
  );

  // ============ Rating Routes ============
  app.post("/api/ratings", 
    (req, res, next) => checkCustomRateLimit(req, res, next, "rating"),
    isAuthenticated, 
    async (req: any, res) => {
      console.log('=== RATING SUBMISSION START ===');
      console.log('Request body:', req.body);
      console.log('Session:', req.session);
      
      try {
        const userId = getUserId(req);
        console.log('User ID from session:', userId);
        
        if (!userId) {
          console.log('No user ID found in session');
          return res.status(401).json({ message: "Authentication required" });
        }
        
        // Validate input
        const validation = insertRatingSchema.safeParse(req.body);
        if (!validation.success) {
          console.log('Validation failed:', validation.error.errors);
          return res.status(400).json({ 
            message: "Invalid rating data",
            errors: validation.error.errors 
          });
        }

        const { targetUserId, score } = validation.data;
        console.log('Validated data:', { targetUserId, score });

        // Prevent self-rating
        if (targetUserId === userId) {
          console.log('Self-rating attempt blocked');
          return res.status(400).json({ message: "You cannot rate yourself" });
        }

        // Get user and target user
        const user = await storage.getUser(userId);
        const targetUser = await storage.getUser(targetUserId);
        console.log('Users found:', { 
          rater: !!user, 
          target: !!targetUser,
          raterGender: user?.gender,
          targetGender: targetUser?.gender,
          raterCollege: user?.collegeId,
          targetCollege: targetUser?.collegeId
        });

        if (!user) {
          console.log('Rater user not found');
          return res.status(404).json({ message: "Your profile not found" });
        }

        if (!targetUser) {
          console.log('Target user not found');
          return res.status(404).json({ message: "User not found" });
        }

        // Check if users have required fields
        if (!user.collegeId || !user.gender) {
          console.log('Rater missing required fields:', { collegeId: user.collegeId, gender: user.gender });
          return res.status(400).json({ message: "Please complete your profile first" });
        }

        if (!targetUser.collegeId || !targetUser.gender) {
          console.log('Target user missing required fields');
          return res.status(400).json({ message: "Target user profile incomplete" });
        }

        // Verify both users are from same college
        if (user.collegeId !== targetUser.collegeId) {
          console.log('College mismatch:', { rater: user.collegeId, target: targetUser.collegeId });
          return res.status(403).json({ message: "You can only rate users from your college" });
        }

        // Verify opposite gender
        const isOppositeGender = 
          (user.gender === "male" && targetUser.gender === "female") ||
          (user.gender === "female" && targetUser.gender === "male");

        console.log('Gender check:', { isOppositeGender, raterGender: user.gender, targetGender: targetUser.gender });
        if (!isOppositeGender) {
          return res.status(403).json({ message: "You can only rate opposite gender students" });
        }

        // Create metadata for abuse prevention
        const ipHash = req.ip ? hashValue(req.ip) : undefined;
        const deviceHash = req.headers["user-agent"] ? hashValue(req.headers["user-agent"]) : undefined;
        console.log('Creating rating with metadata:', { ipHash: !!ipHash, deviceHash: !!deviceHash });

        // Create rating (includes duplicate check)
        const rating = await storage.createRating(
          targetUserId,
          userId,
          score,
          {
            ipHash,
            deviceHash,
            collegeId: user.collegeId,
          }
        );

        console.log('Rating created successfully:', rating.id);
        console.log('=== RATING SUBMISSION END ===');
        res.json(rating);
      } catch (error) {
        console.error("Error creating rating:", error);
        
        if (error instanceof Error && error.message === "You have already rated this user") {
          return res.status(409).json({ message: error.message });
        }
        
        res.status(500).json({ message: "Failed to submit rating" });
      }
    }
  );

  // ============ Recent Activity Routes ============
  app.get("/api/recent-activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const limit = parseInt(req.query.limit as string) || 20;
      
      const activities = await storage.getRecentActivity(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // ============ Leaderboard Routes ============
  app.get("/api/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);

      if (!user?.collegeId) {
        return res.status(400).json({ message: "Please complete your profile first" });
      }

      const periodType = (req.query.period as string) || "weekly";
      const leaderboard = await storage.getLeaderboard(user.collegeId, periodType);

      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // ============ Feedback Routes ============
  app.post("/api/feedback", authLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      
      // Validate input
      const validation = insertFeedbackSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid feedback data",
          errors: validation.error.errors 
        });
      }

      const feedbackRecord = await storage.createFeedback(userId, validation.data);
      res.json(feedbackRecord);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const userFeedback = await storage.getUserFeedback(userId);
      res.json(userFeedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // ============ Appeals Routes ============
  app.post("/api/appeals", authLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      
      // Validate input
      const validation = insertAppealSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid appeal data",
          errors: validation.error.errors 
        });
      }

      const appeal = await storage.createAppeal(userId, validation.data);
      res.json(appeal);
    } catch (error) {
      console.error("Error creating appeal:", error);
      res.status(500).json({ message: "Failed to submit appeal" });
    }
  });

  app.get("/api/appeals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const appeals = await storage.getUserAppeals(userId);
      res.json(appeals);
    } catch (error) {
      console.error("Error fetching appeals:", error);
      res.status(500).json({ message: "Failed to fetch appeals" });
    }
  });

  // ============ Admin Routes (for testing) ============
  app.post("/api/admin/compute-leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);

      if (!user?.collegeId) {
        return res.status(400).json({ message: "User not found" });
      }

      await storage.computeLeaderboard(user.collegeId);
      res.json({ message: "Leaderboard computed successfully" });
    } catch (error) {
      console.error("Error computing leaderboard:", error);
      res.status(500).json({ message: "Failed to compute leaderboard" });
    }
  });

  // Monitoring endpoints
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const stats = monitoring.getPerformanceStats();
      const endpointStats = monitoring.getEndpointStats();
      const recentErrors = monitoring.getRecentErrors(5);
      
      res.json({
        performance: stats,
        endpoints: endpointStats,
        recentErrors,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const allFeedback = await storage.getAllFeedback(limit);
      res.json(allFeedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Error handling middleware (must be last)
  app.use(monitoring.errorMiddleware());

  const httpServer = createServer(app);
  return httpServer;
}
