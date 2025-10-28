import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth (MANDATORY)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Colleges/Universities
export const colleges = pgTable("colleges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emailDomain: text("email_domain").notNull().unique(), // e.g., "stanford.edu"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table for Replit Auth (MANDATORY with extensions)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Campus Crush specific fields
  collegeId: varchar("college_id").references(() => colleges.id),
  gender: varchar("gender", { length: 20 }), // "male", "female", "other"
  displayName: text("display_name"),
  bio: text("bio"),
  verificationStatus: varchar("verification_status", { length: 20 }).default("unverified"), // "unverified", "pending", "verified", "rejected"
  verificationMethod: varchar("verification_method", { length: 20 }), // "email", "id_upload"
  
  // Stats
  ratingsReceived: integer("ratings_received").default(0),
  averageScore: decimal("average_score", { precision: 3, scale: 2 }), // e.g., 8.75
  
  // Metadata for abuse prevention
  lastActiveAt: timestamp("last_active_at"),
  deviceHash: text("device_hash"),
  ipHash: text("ip_hash"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings table with privacy-first anonymity
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Anonymized rater - stored as salted hash
  raterIdHash: text("rater_id_hash").notNull(), // One-way hash of rater ID
  
  // Target user being rated
  targetUserId: varchar("target_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Rating data
  score: integer("score").notNull(), // 1-10
  
  // Context
  collegeId: varchar("college_id").references(() => colleges.id),
  
  // Anti-abuse metadata
  ipHash: text("ip_hash"),
  deviceHash: text("device_hash"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("ratings_target_idx").on(table.targetUserId),
  index("ratings_college_idx").on(table.collegeId),
  index("ratings_created_idx").on(table.createdAt),
]);

// Leaderboards - precomputed weekly rankings
export const leaderboards = pgTable("leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collegeId: varchar("college_id").notNull().references(() => colleges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Leaderboard data
  rank: integer("rank").notNull(),
  averageScore: decimal("average_score", { precision: 3, scale: 2 }).notNull(),
  totalRatings: integer("total_ratings").notNull(),
  
  // Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  periodType: varchar("period_type", { length: 20 }).default("weekly"), // "weekly", "monthly"
  
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

export const ratingsRelations = relations(ratings, ({ one }) => ({
  targetUser: one(users, {
    fields: [ratings.targetUserId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [ratings.collegeId],
    references: [colleges.id],
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type College = typeof colleges.$inferSelect;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;
