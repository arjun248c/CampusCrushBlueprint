-- Migration script for Campus Crush enhancements
-- Run this after updating schema.ts

-- Add new columns to ratings table
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Create rating_pairs table for duplicate prevention
CREATE TABLE IF NOT EXISTS rating_pairs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id_hash TEXT NOT NULL,
  target_user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create appeals table
CREATE TABLE IF NOT EXISTS appeals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating_id VARCHAR REFERENCES ratings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by VARCHAR REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  ip_hash TEXT,
  action VARCHAR(50) NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER,
  status VARCHAR(20) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  device_info TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ratings_rater_target_idx ON ratings(rater_id_hash, target_user_id);
CREATE INDEX IF NOT EXISTS rating_pairs_unique_idx ON rating_pairs(rater_id_hash, target_user_id);
CREATE INDEX IF NOT EXISTS appeals_user_idx ON appeals(user_id);
CREATE INDEX IF NOT EXISTS appeals_status_idx ON appeals(status);
CREATE INDEX IF NOT EXISTS rate_limits_user_action_idx ON rate_limits(user_id, action);
CREATE INDEX IF NOT EXISTS rate_limits_ip_action_idx ON rate_limits(ip_hash, action);
CREATE INDEX IF NOT EXISTS rate_limits_expires_idx ON rate_limits(expires_at);
CREATE INDEX IF NOT EXISTS feedback_user_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);
CREATE INDEX IF NOT EXISTS feedback_type_idx ON feedback(type);
CREATE INDEX IF NOT EXISTS feedback_created_idx ON feedback(created_at);

-- Add unique constraint to prevent duplicate ratings
CREATE UNIQUE INDEX IF NOT EXISTS rating_pairs_unique_constraint 
ON rating_pairs(rater_id_hash, target_user_id);