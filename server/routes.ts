// From Replit Auth blueprint with Campus Crush endpoints
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRatingSchema } from "@shared/schema";
import { createHash } from "crypto";
import rateLimit from "express-rate-limit";

// Helper to get user ID from request
function getUserId(req: any): string {
  return req.user?.claims?.sub;
}

// Helper to hash IP/device for abuse prevention
function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
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

  // Apply general rate limiting to all API routes
  app.use("/api", apiLimiter);

  // Auth middleware
  await setupAuth(app);

  // ============ Auth Routes ============
  app.get("/api/auth/user", authLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
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

  app.post("/api/profile/setup", authLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { collegeId, gender, displayName, bio } = req.body;

      // Basic validation
      if (!collegeId || typeof collegeId !== "string") {
        return res.status(400).json({ message: "Valid college ID is required" });
      }
      if (!gender || !["male", "female", "other"].includes(gender)) {
        return res.status(400).json({ message: "Valid gender is required" });
      }

      const updated = await storage.updateUserProfile(userId, {
        collegeId,
        gender,
        displayName: displayName || undefined,
        bio: bio || undefined,
        verificationStatus: "verified", // Auto-verify for MVP (would check email domain in production)
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
  app.get("/api/profiles/random", isAuthenticated, async (req: any, res) => {
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
  });

  // ============ Rating Routes ============
  app.post("/api/ratings", ratingLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      
      // Validate input
      const validation = insertRatingSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid rating data",
          errors: validation.error.errors 
        });
      }

      const { targetUserId, score } = validation.data;

      // Prevent self-rating
      if (targetUserId === userId) {
        return res.status(400).json({ message: "You cannot rate yourself" });
      }

      // Get user and target user
      const user = await storage.getUser(userId);
      const targetUser = await storage.getUser(targetUserId);

      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify both users are from same college
      if (user?.collegeId !== targetUser?.collegeId) {
        return res.status(403).json({ message: "You can only rate users from your college" });
      }

      // Verify opposite gender
      const isOppositeGender = 
        (user?.gender === "male" && targetUser?.gender === "female") ||
        (user?.gender === "female" && targetUser?.gender === "male");

      if (!isOppositeGender) {
        return res.status(403).json({ message: "You can only rate opposite gender students" });
      }

      // Create metadata for abuse prevention
      const ipHash = req.ip ? hashValue(req.ip) : undefined;
      const deviceHash = req.headers["user-agent"] ? hashValue(req.headers["user-agent"]) : undefined;

      // Create rating
      const rating = await storage.createRating(
        targetUserId,
        userId,
        score,
        {
          ipHash,
          deviceHash,
          collegeId: user?.collegeId || undefined,
        }
      );

      res.json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Failed to submit rating" });
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

  const httpServer = createServer(app);
  return httpServer;
}
