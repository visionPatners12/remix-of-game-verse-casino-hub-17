
-- Create news categories table
CREATE TABLE public.news_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#3B82F6',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create news tags table
CREATE TABLE public.news_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create news articles table
CREATE TABLE public.news_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author_id uuid REFERENCES auth.users,
  category_id uuid REFERENCES public.news_categories,
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

-- Create junction table for article tags
CREATE TABLE public.news_article_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES public.news_articles ON DELETE CASCADE,
  tag_id uuid REFERENCES public.news_tags ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

-- Create news comments table
CREATE TABLE public.news_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES public.news_articles ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  parent_id uuid REFERENCES public.news_comments,
  content text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create news article views table for analytics
CREATE TABLE public.news_article_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES public.news_articles ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  ip_address inet,
  user_agent text,
  referrer text,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create news article likes table
CREATE TABLE public.news_article_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES public.news_articles ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_article_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON public.news_categories
  FOR SELECT USING (is_active = true);

-- RLS Policies for tags (public read)
CREATE POLICY "Anyone can view tags" ON public.news_tags
  FOR SELECT USING (true);

-- RLS Policies for articles (public read published, author write)
CREATE POLICY "Anyone can view published articles" ON public.news_articles
  FOR SELECT USING (status = 'published' AND published_at <= now());

CREATE POLICY "Authors can manage their articles" ON public.news_articles
  FOR ALL USING (auth.uid() = author_id);

-- RLS Policies for article tags (public read)
CREATE POLICY "Anyone can view article tags" ON public.news_article_tags
  FOR SELECT USING (true);

-- RLS Policies for comments (public read approved, users write their own)
CREATE POLICY "Anyone can view approved comments" ON public.news_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create comments" ON public.news_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.news_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for article views (users can insert their own)
CREATE POLICY "Users can record their views" ON public.news_article_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for article likes (users manage their own)
CREATE POLICY "Anyone can view likes count" ON public.news_article_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their likes" ON public.news_article_likes
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_news_articles_status_published ON public.news_articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_news_articles_category ON public.news_articles(category_id);
CREATE INDEX idx_news_articles_author ON public.news_articles(author_id);
CREATE INDEX idx_news_articles_slug ON public.news_articles(slug);
CREATE INDEX idx_news_comments_article ON public.news_comments(article_id, is_approved);
CREATE INDEX idx_news_article_views_article ON public.news_article_views(article_id);
CREATE INDEX idx_news_article_likes_article ON public.news_article_likes(article_id);

-- Create function to update article counts
CREATE OR REPLACE FUNCTION update_article_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'news_comments' THEN
    UPDATE public.news_articles 
    SET comments_count = (
      SELECT COUNT(*) FROM public.news_comments 
      WHERE article_id = COALESCE(NEW.article_id, OLD.article_id) AND is_approved = true
    )
    WHERE id = COALESCE(NEW.article_id, OLD.article_id);
  END IF;
  
  IF TG_TABLE_NAME = 'news_article_likes' THEN
    UPDATE public.news_articles 
    SET likes_count = (
      SELECT COUNT(*) FROM public.news_article_likes 
      WHERE article_id = COALESCE(NEW.article_id, OLD.article_id)
    )
    WHERE id = COALESCE(NEW.article_id, OLD.article_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR UPDATE OR DELETE ON public.news_comments
  FOR EACH ROW EXECUTE FUNCTION update_article_counts();

CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON public.news_article_likes
  FOR EACH ROW EXECUTE FUNCTION update_article_counts();

-- Insert some initial categories
INSERT INTO public.news_categories (name, slug, description, color) VALUES
  ('Actualités Football', 'actualites-football', 'Toutes les actualités du monde du football', '#10B981'),
  ('Mises à jour Plateforme', 'mises-a-jour-plateforme', 'Nouvelles fonctionnalités et améliorations', '#3B82F6'),
  ('Guides & Tutoriels', 'guides-tutoriels', 'Guides pour mieux utiliser la plateforme', '#F59E0B'),
  ('Événements', 'evenements', 'Tournois et événements spéciaux', '#EF4444'),
  ('Annonces', 'annonces', 'Annonces importantes de la plateforme', '#8B5CF6');

-- Insert some initial tags
INSERT INTO public.news_tags (name, slug) VALUES
  ('football', 'football'),
  ('mise-a-jour', 'mise-a-jour'),
  ('tutoriel', 'tutoriel'),
  ('tournoi', 'tournoi'),
  ('paris', 'paris'),
  ('tips', 'tips'),
  ('strategie', 'strategie'),
  ('communaute', 'communaute');
