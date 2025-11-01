import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  integer,
  real,
  timestamp,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Colleges/Universities
export const colleges = pgTable("colleges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  emailDomain: text("email_domain").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  
  // Campus Crush specific fields
  collegeId: uuid("college_id").references(() => colleges.id),
  gender: text("gender"),
  displayName: text("display_name"),
  bio: text("bio"),
  verificationStatus: text("verification_status").default("unverified"),
  verificationMethod: text("verification_method"),
  
  // Stats
  ratingsReceived: integer("ratings_received").default(0),
  averageScore: real("average_score"),
  
  // Metadata for abuse prevention
  lastActiveAt: timestamp("last_active_at"),
  deviceHash: text("device_hash"),
  ipHash: text("ip_hash"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings table with privacy-first anonymity
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Anonymized rater - stored as salted hash
  raterIdHash: text("rater_id_hash").notNull(),
  
  // Target user being rated
  targetUserId: uuid("target_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Rating data
  score: integer("score").notNull(),
  
  // Context
  collegeId: uuid("college_id").references(() => colleges.id),
  
  // Anti-abuse metadata
  ipHash: text("ip_hash"),
  deviceHash: text("device_hash"),
  
  // Status for appeals
  status: text("status").default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("ratings_target_idx").on(table.targetUserId),
  index("ratings_college_idx").on(table.collegeId),
  index("ratings_created_idx").on(table.createdAt),
  index("ratings_rater_target_idx").on(table.raterIdHash, table.targetUserId),
]);

// Rating pairs to prevent duplicate ratings
export const ratingPairs = pgTable("rating_pairs", {
  id: uuid("id").primaryKey().defaultRandom(),
  raterIdHash: text("rater_id_hash").notNull(),
  targetUserId: uuid("target_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("rating_pairs_unique_idx").on(table.raterIdHash, table.targetUserId),
]);

// Appeals system
export const appeals = pgTable("appeals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ratingId: uuid("rating_id").references(() => ratings.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("appeals_user_idx").on(table.userId),
  index("appeals_status_idx").on(table.status),
]);

// Rate limiting tracking
export const rateLimits = pgTable("rate_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  action: text("action").notNull(),
  count: integer("count").default(1),
  windowStart: timestamp("window_start").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => [
  index("rate_limits_user_action_idx").on(table.userId, table.action),
  index("rate_limits_ip_action_idx").on(table.ipHash, table.action),
  index("rate_limits_expires_idx").on(table.expiresAt),
]);

// User feedback system
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  category: text("category"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rating: integer("rating"),
  status: text("status").default("open"),
  priority: text("priority").default("medium"),
  deviceInfo: text("device_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("feedback_user_idx").on(table.userId),
  index("feedback_status_idx").on(table.status),
  index("feedback_type_idx").on(table.type),
  index("feedback_created_idx").on(table.createdAt),
]);

// Leaderboards - precomputed weekly rankings
export const leaderboards = pgTable("leaderboards", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull().references(() => colleges.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  
  // Leaderboard data
  rank: integer("rank").notNull(),
  averageScore: real("average_score").notNull(),
  totalRatings: integer("total_ratings").notNull(),
  
  // Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  periodType: text("period_type").default("weekly"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("leaderboards_college_period_idx").on(table.collegeId, table.periodStart),
]);

// Relations
export const collegesRelations = relations(colleges, ({ many }) => ({
  users: many(users),
  ratings: many(ratings),
  leaderboards: many(leaderboards),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.id],
  }),
  ratingsReceived: many(ratings),
  leaderboardEntries: many(leaderboards),
}));

export const ratingsRelations = relations(ratings, ({ one, many }) => ({
  targetUser: one(users, {
    fields: [ratings.targetUserId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [ratings.collegeId],
    references: [colleges.id],
  }),
  appeals: many(appeals),
}));

export const ratingPairsRelations = relations(ratingPairs, ({ one }) => ({
  targetUser: one(users, {
    fields: [ratingPairs.targetUserId],
    references: [users.id],
  }),
}));

export const appealsRelations = relations(appeals, ({ one }) => ({
  user: one(users, {
    fields: [appeals.userId],
    references: [users.id],
  }),
  rating: one(ratings, {
    fields: [appeals.ratingId],
    references: [ratings.id],
  }),
  reviewer: one(users, {
    fields: [appeals.reviewedBy],
    references: [users.id],
  }),
}));

export const rateLimitsRelations = relations(rateLimits, ({ one }) => ({
  user: one(users, {
    fields: [rateLimits.userId],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  college: one(colleges, {
    fields: [leaderboards.collegeId],
    references: [colleges.id],
  }),
  user: one(users, {
    fields: [leaderboards.userId],
    references: [users.id],
  }),
}));

// Zod Schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertCollegeSchema = createInsertSchema(colleges).omit({ id: true, createdAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ 
  id: true, 
  createdAt: true,
  raterIdHash: true, // Will be computed server-side
  ipHash: true,
  deviceHash: true,
}).extend({
  targetUserId: z.string().min(1, "Target user is required"),
  score: z.number().min(1).max(10, "Score must be between 1 and 10"),
});

// Additional schemas
export const insertAppealSchema = createInsertSchema(appeals).omit({ 
  id: true, 
  createdAt: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
}).extend({
  reason: z.enum(["inappropriate", "fake_rating", "harassment", "spam", "other"]),
  description: z.string().min(10, "Please provide more details").max(500, "Description too long"),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  priority: true,
}).extend({
  type: z.enum(["bug", "feature", "improvement", "other"]),
  category: z.string().optional(),
  title: z.string().min(5, "Title too short").max(100, "Title too long"),
  description: z.string().min(10, "Please provide more details").max(1000, "Description too long"),
  rating: z.number().min(1).max(5).optional(),
  deviceInfo: z.string().optional(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type College = typeof colleges.$inferSelect;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type RatingPair = typeof ratingPairs.$inferSelect;
export type Appeal = typeof appeals.$inferSelect;
export type InsertAppeal = z.infer<typeof insertAppealSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
