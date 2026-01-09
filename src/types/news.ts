
export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NewsTag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  author_id?: string;
  category_id?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  published_at?: string;
  scheduled_at?: string;
  views_count: number;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  reading_time_minutes?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
  schema_markup?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category?: NewsCategory;
  tags?: NewsTag[];
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  } | null;
}

interface NewsComment {
  id: string;
  article_id: string;
  user_id?: string;
  parent_id?: string;
  content: string;
  is_approved: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  replies?: NewsComment[];
}

interface ArticleView {
  id: string;
  article_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  viewed_at: string;
}

interface ArticleLike {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
}
