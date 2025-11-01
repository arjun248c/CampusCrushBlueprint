// From PostgreSQL database blueprint with Campus Crush extensions
import {
  users,
  colleges,
  ratings,
  leaderboards,
  appeals,
  feedback,
  rateLimits,
  type User,
  type UpsertUser,
  type College,
  type InsertCollege,
  type Rating,
  type Leaderboard,
  type Appeal,
  type InsertAppeal,
  type Feedback,
  type InsertFeedback,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ne, inArray } from "drizzle-orm";
import { createHash } from "crypto";



// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined>;
  saveProfileImage(userId: string, file: Express.Multer.File): Promise<string>;
  
  // College operations
  getAllColleges(): Promise<College[]>;
  getCollege(id: string): Promise<College | undefined>;
  createCollege(college: InsertCollege): Promise<College>;
  
  // Profile discovery
  getRandomProfiles(userId: string, limit: number): Promise<User[]>;
  searchProfiles(userId: string, query: string, limit: number): Promise<User[]>;
  
  // Rating operations
  createRating(targetUserId: string, raterUserId: string, score: number, metadata: { ipHash?: string; deviceHash?: string; collegeId?: string }): Promise<Rating>;
  getUserRatings(userId: string): Promise<Rating[]>;
  updateUserStats(userId: string): Promise<void>;
  checkDuplicateRating(raterUserId: string, targetUserId: string): Promise<boolean>;
  
  // Appeals system
  createAppeal(userId: string, appealData: InsertAppeal): Promise<Appeal>;
  getUserAppeals(userId: string): Promise<Appeal[]>;
  
  // Rate limiting
  checkRateLimit(userId: string, ipHash: string, action: string): Promise<boolean>;
  recordAction(userId: string, ipHash: string, action: string): Promise<void>;
  
  // Feedback system
  createFeedback(userId: string, feedbackData: InsertFeedback): Promise<Feedback>;
  getUserFeedback(userId: string): Promise<Feedback[]>;
  getAllFeedback(limit?: number): Promise<Feedback[]>;
  
  // Leaderboard operations
  getLeaderboard(collegeId: string, periodType?: string): Promise<(Leaderboard & { user?: User })[]>;
  computeLeaderboard(collegeId: string): Promise<void>;
}

// Helper function to hash rater ID for anonymity
function hashRaterId(raterId: string): string {
  const salt = process.env.RATING_SALT || "campus_crush_salt_2024";
  return createHash("sha256").update(raterId + salt).digest("hex");
}

export class DatabaseStorage implements IStorage {
  // User operations (MANDATORY for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  // Profile operations
  async updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async saveProfileImage(userId: string, file: Express.Multer.File): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${userId}-${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Save file
    await fs.writeFile(filepath, file.buffer);
    
    // Return URL path
    return `/uploads/profiles/${filename}`;
  }

  // College operations
  async getAllColleges(): Promise<College[]> {
    return await db.select().from(colleges).where(eq(colleges.isActive, true));
  }

  async getCollege(id: string): Promise<College | undefined> {
    const [college] = await db.select().from(colleges).where(eq(colleges.id, id));
    return college;
  }

  async createCollege(collegeData: InsertCollege): Promise<College> {
    const [college] = await db.insert(colleges).values(collegeData).returning();
    return college;
  }

  // Profile discovery - get random opposite-gender profiles from same college
  async getRandomProfiles(userId: string, limit: number = 10): Promise<User[]> {
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!currentUser) return [];

    // Determine opposite gender
    let oppositeGender: string | null = null;
    if (currentUser.gender === "male") oppositeGender = "female";
    else if (currentUser.gender === "female") oppositeGender = "male";
    else return []; // For "other" gender, no opposite gender matching for now

    // Get random profiles from same college, opposite gender, verified users only
    const profiles = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.collegeId, currentUser.collegeId!),
          eq(users.gender, oppositeGender),
          eq(users.verificationStatus, "verified"),
          ne(users.id, userId)
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    return profiles;
  }

  // Search profiles by name or display name
  async searchProfiles(userId: string, query: string, limit: number = 20): Promise<User[]> {
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!currentUser) return [];

    // Determine opposite gender
    let oppositeGender: string | null = null;
    if (currentUser.gender === "male") oppositeGender = "female";
    else if (currentUser.gender === "female") oppositeGender = "male";
    else return []; // For "other" gender, no opposite gender matching for now

    // Search profiles by first name, last name, or display name
    const profiles = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.collegeId, currentUser.collegeId!),
          eq(users.gender, oppositeGender),
          eq(users.verificationStatus, "verified"),
          ne(users.id, userId),
          sql`(
            LOWER(${users.firstName}) LIKE LOWER(${'%' + query + '%'}) OR
            LOWER(${users.lastName}) LIKE LOWER(${'%' + query + '%'}) OR
            LOWER(${users.displayName}) LIKE LOWER(${'%' + query + '%'})
          )`
        )
      )
      .orderBy(users.firstName, users.lastName)
      .limit(limit);

    return profiles;
  }

  // Rating operations
  async createRating(
    targetUserId: string,
    raterUserId: string,
    score: number,
    metadata: { ipHash?: string; deviceHash?: string; collegeId?: string }
  ): Promise<Rating> {
    const raterIdHash = hashRaterId(raterUserId);
    
    // Check for duplicate rating
    const isDuplicate = await this.checkDuplicateRating(raterUserId, targetUserId);
    if (isDuplicate) {
      throw new Error("You have already rated this user");
    }
    
    const [rating] = await db
      .insert(ratings)
      .values({
        targetUserId,
        raterIdHash,
        score,
        collegeId: metadata.collegeId,
        ipHash: metadata.ipHash,
        deviceHash: metadata.deviceHash,
      })
      .returning();

    // Update target user stats
    await this.updateUserStats(targetUserId);

    return rating;
  }

  async checkDuplicateRating(raterUserId: string, targetUserId: string): Promise<boolean> {
    const raterIdHash = hashRaterId(raterUserId);
    const [existing] = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.raterIdHash, raterIdHash),
          eq(ratings.targetUserId, targetUserId)
        )
      )
      .limit(1);
    return !!existing;
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.targetUserId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  async updateUserStats(userId: string): Promise<void> {
    // Calculate average score and count
    const result = await db
      .select({
        count: sql<number>`count(*)::int`,
        avg: sql<string>`avg(${ratings.score})::numeric(3,2)`,
      })
      .from(ratings)
      .where(eq(ratings.targetUserId, userId));

    const stats = result[0];
    
    if (stats && stats.count > 0) {
      await db
        .update(users)
        .set({
          ratingsReceived: stats.count,
          averageScore: parseFloat(stats.avg),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }

  // Leaderboard operations
  async getLeaderboard(
    collegeId: string,
    periodType: string = "weekly"
  ): Promise<(Leaderboard & { user?: User })[]> {
    // Get the most recent leaderboard for this college
    const leaderboardEntries = await db
      .select()
      .from(leaderboards)
      .where(
        and(
          eq(leaderboards.collegeId, collegeId),
          eq(leaderboards.periodType, periodType)
        )
      )
      .orderBy(desc(leaderboards.periodStart), leaderboards.rank)
      .limit(10);

    if (leaderboardEntries.length === 0) {
      return [];
    }

    // Get user details for each entry
    const userIds = leaderboardEntries.map((entry) => entry.userId);
    const usersData = await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));

    // Combine leaderboard entries with user data
    return leaderboardEntries.map((entry) => ({
      ...entry,
      user: usersData.find((u) => u.id === entry.userId),
    }));
  }

  async computeLeaderboard(collegeId: string): Promise<void> {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 7); // Last 7 days
    const periodEnd = new Date();

    // Get top users by average score in the last week
    const topUsers = await db
      .select({
        userId: users.id,
        averageScore: users.averageScore,
        totalRatings: users.ratingsReceived,
      })
      .from(users)
      .where(
        and(
          eq(users.collegeId, collegeId),
          eq(users.verificationStatus, "verified"),
          sql`${users.ratingsReceived} >= 5` // Minimum 5 ratings to appear on leaderboard
        )
      )
      .orderBy(desc(users.averageScore))
      .limit(10);

    // Clear existing leaderboard for this period
    await db
      .delete(leaderboards)
      .where(
        and(
          eq(leaderboards.collegeId, collegeId),
          eq(leaderboards.periodType, "weekly")
        )
      );

    // Insert new leaderboard entries
    if (topUsers.length > 0) {
      const leaderboardData = topUsers.map((user, index) => ({
        collegeId,
        userId: user.userId,
        rank: index + 1,
        averageScore: user.averageScore!,
        totalRatings: user.totalRatings!,
        periodStart,
        periodEnd,
        periodType: "weekly" as const,
      }));

      await db.insert(leaderboards).values(leaderboardData);
    }
  }

  // Appeals system
  async createAppeal(userId: string, appealData: InsertAppeal): Promise<Appeal> {
    const [appeal] = await db
      .insert(appeals)
      .values({
        ...appealData,
        userId,
      })
      .returning();
    return appeal;
  }

  async getUserAppeals(userId: string): Promise<Appeal[]> {
    return await db
      .select()
      .from(appeals)
      .where(eq(appeals.userId, userId))
      .orderBy(desc(appeals.createdAt));
  }

  // Rate limiting
  async checkRateLimit(userId: string, ipHash: string, action: string): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 1000); // 1 minute window
    
    const [existing] = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.userId, userId),
          eq(rateLimits.action, action),
          sql`${rateLimits.expiresAt} > ${now}`
        )
      )
      .limit(1);
    
    return existing && (existing.count || 0) >= 10; // Max 10 actions per minute
  }

  async recordAction(userId: string, ipHash: string, action: string): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 1000); // 1 minute from now
    
    await db
      .insert(rateLimits)
      .values({
        userId,
        ipHash,
        action,
        count: 1,
        windowStart: now,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [rateLimits.userId, rateLimits.action],
        set: {
          count: sql`${rateLimits.count} + 1`,
          expiresAt,
        },
      });
  }

  // Feedback system
  async createFeedback(userId: string, feedbackData: InsertFeedback): Promise<Feedback> {
    const [feedbackRecord] = await db
      .insert(feedback)
      .values({
        ...feedbackData,
        userId,
      })
      .returning();
    return feedbackRecord;
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  async getAllFeedback(limit: number = 50): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
