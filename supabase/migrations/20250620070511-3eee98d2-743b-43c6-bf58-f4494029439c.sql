
-- Migration: Phase 2.2 - App News Schema
-- Date: 2025-06-19
-- Description: Move news tables to app_news schema

-- =============================================
-- PHASE 2.2: APP_NEWS SCHEMA MIGRATION
-- =============================================

-- Create news tables in app_news schema
CREATE TABLE app_news.news_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#3B82F6',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_news.news_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_news.news_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author_id uuid REFERENCES auth.users,
  category_id uuid REFERENCES app_news.news_categories,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  scheduled_at timestamp with time zone,
  views_count integer NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  shares_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  reading_time_minutes integer,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  og_title text,
  og_description text,
  og_image_url text,
  twitter_title text,
  twitter_description text,
  twitter_image_url text,
  schema_markup jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_news.news_article_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES app_news.news_articles ON DELETE CASCADE,
  tag_id uuid REFERENCES app_news.news_tags ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

CREATE TABLE app_news.news_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES app_news.news_articles ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  parent_id uuid REFERENCES app_news.news_comments,
  content text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_news.news_article_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES app_news.news_articles ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  ip_address inet,
  user_agent text,
  referrer text,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE app_news.news_article_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES app_news.news_articles ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Migrate data from public schema to app_news
INSERT INTO app_news.news_categories 
SELECT * FROM public.news_categories;

INSERT INTO app_news.news_tags 
SELECT * FROM public.news_tags;

INSERT INTO app_news.news_articles 
SELECT id, title, slug, excerpt, content, featured_image_url, author_id, category_id, 
       status, is_featured, published_at, scheduled_at, views_count, likes_count, 
       shares_count, comments_count, reading_time_minutes, seo_title, seo_description, 
       seo_keywords, og_title, og_description, og_image_url, twitter_title, 
       twitter_description, twitter_image_url, schema_markup, created_at, updated_at
FROM public.news_articles;

INSERT INTO app_news.news_article_tags 
SELECT * FROM public.news_article_tags;

INSERT INTO app_news.news_comments 
SELECT * FROM public.news_comments;

INSERT INTO app_news.news_article_views 
SELECT * FROM public.news_article_views;

INSERT INTO app_news.news_article_likes 
SELECT * FROM public.news_article_likes;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA app_news TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app_news TO authenticated;

-- Enable Row Level Security
ALTER TABLE app_news.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_news.news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_news.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_news.news_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_news.news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_news.news_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_news.news_article_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON app_news.news_categories
  FOR SELECT USING (is_active = true);

-- RLS Policies for tags (public read)
CREATE POLICY "Anyone can view tags" ON app_news.news_tags
  FOR SELECT USING (true);

-- RLS Policies for articles (public read published, author write)
CREATE POLICY "Anyone can view published articles" ON app_news.news_articles
  FOR SELECT USING (status = 'published' AND published_at <= now());

CREATE POLICY "Authors can manage their articles" ON app_news.news_articles
  FOR ALL USING (auth.uid() = author_id);

-- RLS Policies for article tags (public read)
CREATE POLICY "Anyone can view article tags" ON app_news.news_article_tags
  FOR SELECT USING (true);

-- RLS Policies for comments (public read approved, users write their own)
CREATE POLICY "Anyone can view approved comments" ON app_news.news_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create comments" ON app_news.news_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON app_news.news_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for article views (users can insert their own)
CREATE POLICY "Users can record their views" ON app_news.news_article_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for article likes (users manage their own)
CREATE POLICY "Anyone can view likes count" ON app_news.news_article_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their likes" ON app_news.news_article_likes
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_app_news_articles_status_published ON app_news.news_articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_app_news_articles_category ON app_news.news_articles(category_id);
CREATE INDEX idx_app_news_articles_author ON app_news.news_articles(author_id);
CREATE INDEX idx_app_news_articles_slug ON app_news.news_articles(slug);
CREATE INDEX idx_app_news_comments_article ON app_news.news_comments(article_id, is_approved);
CREATE INDEX idx_app_news_article_views_article ON app_news.news_article_views(article_id);
CREATE INDEX idx_app_news_article_likes_article ON app_news.news_article_likes(article_id);

-- Create function to update article counts in app_news schema
CREATE OR REPLACE FUNCTION app_news.update_article_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'news_comments' THEN
    UPDATE app_news.news_articles 
    SET comments_count = (
      SELECT COUNT(*) FROM app_news.news_comments 
      WHERE article_id = COALESCE(NEW.article_id, OLD.article_id) AND is_approved = true
    )
    WHERE id = COALESCE(NEW.article_id, OLD.article_id);
  END IF;
  
  IF TG_TABLE_NAME = 'news_article_likes' THEN
    UPDATE app_news.news_articles 
    SET likes_count = (
      SELECT COUNT(*) FROM app_news.news_article_likes 
      WHERE article_id = COALESCE(NEW.article_id, OLD.article_id)
    )
    WHERE id = COALESCE(NEW.article_id, OLD.article_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for app_news schema
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR UPDATE OR DELETE ON app_news.news_comments
  FOR EACH ROW EXECUTE FUNCTION app_news.update_article_counts();

CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON app_news.news_article_likes
  FOR EACH ROW EXECUTE FUNCTION app_news.update_article_counts();

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Phase 2.2 Complete: Migrated news tables to app_news schema';
END $$;
