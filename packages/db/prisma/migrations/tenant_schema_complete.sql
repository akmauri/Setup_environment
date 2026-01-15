-- Complete Tenant Schema Migration
-- This migration creates all tenant-specific tables
-- Apply this to each tenant schema when creating a new tenant

-- Users table (already exists, but included for completeness)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  picture VARCHAR(500),
  provider VARCHAR(50) NOT NULL DEFAULT 'google',
  provider_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_provider_id_idx ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);

-- Content table (media files)
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio', 'document'
  title VARCHAR(500),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds for video/audio
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'processing', 'ready', 'archived'
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS content_user_id_idx ON content(user_id);
CREATE INDEX IF NOT EXISTS content_type_status_idx ON content(type, status);
CREATE INDEX IF NOT EXISTS content_created_at_idx ON content(created_at DESC);

-- Social accounts table (connected platform accounts)
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'youtube', 'instagram', 'tiktok', etc.
  platform_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  display_name VARCHAR(255),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP(3),
  scopes TEXT[], -- array of OAuth scopes
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform, platform_user_id)
);

CREATE INDEX IF NOT EXISTS social_accounts_user_id_idx ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS social_accounts_platform_idx ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS social_accounts_active_idx ON social_accounts(is_active);

-- Workflows table (n8n workflow definitions)
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow_json JSONB NOT NULL, -- n8n workflow JSON
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  category VARCHAR(100),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS workflows_user_id_idx ON workflows(user_id);
CREATE INDEX IF NOT EXISTS workflows_active_idx ON workflows(is_active);
CREATE INDEX IF NOT EXISTS workflows_category_idx ON workflows(category);

-- Publish jobs table (scheduled publishing tasks)
CREATE TABLE IF NOT EXISTS publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMP(3) NOT NULL,
  published_at TIMESTAMP(3),
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'processing', 'published', 'failed'
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  platform_post_id VARCHAR(255),
  platform_post_url TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS publish_jobs_user_id_idx ON publish_jobs(user_id);
CREATE INDEX IF NOT EXISTS publish_jobs_status_idx ON publish_jobs(status);
CREATE INDEX IF NOT EXISTS publish_jobs_scheduled_at_idx ON publish_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS publish_jobs_content_id_idx ON publish_jobs(content_id);

-- Analytics table (performance metrics)
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  publish_job_id UUID REFERENCES publish_jobs(id) ON DELETE SET NULL,
  platform VARCHAR(50) NOT NULL,
  platform_post_id VARCHAR(255),
  metric_type VARCHAR(50) NOT NULL, -- 'views', 'likes', 'comments', 'shares', etc.
  metric_value BIGINT NOT NULL DEFAULT 0,
  metric_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS analytics_user_id_idx ON analytics(user_id);
CREATE INDEX IF NOT EXISTS analytics_content_id_idx ON analytics(content_id);
CREATE INDEX IF NOT EXISTS analytics_platform_date_idx ON analytics(platform, metric_date);
CREATE INDEX IF NOT EXISTS analytics_metric_type_idx ON analytics(metric_type);

-- Teams table (team management)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS teams_owner_id_idx ON teams(owner_id);

-- Team members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);

-- Comments table (content comments)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for threaded comments
  text TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_content_id_idx ON comments(content_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_comment_id);

-- Notifications table (in-app notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'publish_success', 'publish_failed', 'comment', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at on all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_accounts;
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_publish_jobs_updated_at ON publish_jobs;
CREATE TRIGGER update_publish_jobs_updated_at
  BEFORE UPDATE ON publish_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_updated_at ON analytics;
CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
