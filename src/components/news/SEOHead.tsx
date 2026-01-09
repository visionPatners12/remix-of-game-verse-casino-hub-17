
import React, { useEffect } from 'react';
import { NewsArticle } from '@/types/news';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  article?: NewsArticle;
  canonical?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords = [], 
  article,
  canonical 
}: SEOHeadProps) => {
  useEffect(() => {
    const siteUrl = window.location.origin;
    const currentUrl = window.location.href;

    const created: Element[] = [];

    const setTitle = (t: string) => {
      document.title = t;
    };

    const upsertMeta = (attr: 'name' | 'property' | 'http-equiv', key: string, content?: string) => {
      if (!content) return;
      let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute('content', content);
    };

    const createMetaMulti = (attr: 'name' | 'property', key: string, values: string[] | undefined) => {
      if (!values || values.length === 0) return;
      values.forEach((v) => {
        const el = document.createElement('meta');
        el.setAttribute(attr, key);
        el.setAttribute('content', v);
        document.head.appendChild(el);
        created.push(el);
      });
    };

    const upsertLink = (rel: string, href: string, attrs?: Record<string, string>) => {
      if (!href) return;
      let el = Array.from(document.head.querySelectorAll(`link[rel="${rel}"]`)).find(
        (l) => (l as HTMLLinkElement).href === href
      ) as HTMLLinkElement | undefined;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        el.href = href;
        if (attrs) Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
        document.head.appendChild(el);
        created.push(el);
      } else if (attrs) {
        Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
      }
    };

    const addJsonLd = (json?: string | null) => {
      if (!json) return;
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.text = json;
      document.head.appendChild(el);
      created.push(el);
    };

    // Title (under 60 chars is ideal; keep existing behavior)
    setTitle(`${title} | PRYZEN`);

    // Keywords
    const allKeywords = [
      ...keywords,
      ...(article?.seo_keywords || []),
      ...(article?.tags?.map((tag) => tag.name) || []),
    ];

    // Basic Meta
    upsertMeta('name', 'description', description);
    if (allKeywords.length > 0) upsertMeta('name', 'keywords', allKeywords.join(', '));
    upsertMeta('name', 'robots', 'index, follow');
    upsertMeta('name', 'author', 'PRYZEN');

    // Canonical
    upsertLink('canonical', canonical || currentUrl);

    // Open Graph
    upsertMeta('property', 'og:title', article?.og_title || title);
    upsertMeta('property', 'og:description', article?.og_description || description);
    upsertMeta('property', 'og:type', article ? 'article' : 'website');
    upsertMeta('property', 'og:url', currentUrl);
    upsertMeta('property', 'og:site_name', 'PRYZEN');
    upsertMeta('property', 'og:locale', 'fr_FR');

    if (article?.featured_image_url) {
      upsertMeta('property', 'og:image', article.featured_image_url);
      upsertMeta('property', 'og:image:width', '1200');
      upsertMeta('property', 'og:image:height', '630');
      upsertMeta('property', 'og:image:alt', article.title);
    }

    // Article specific
    if (article) {
      upsertMeta('property', 'article:published_time', article.published_at);
      upsertMeta('property', 'article:modified_time', article.updated_at);
      upsertMeta('property', 'article:author', article.author?.username || 'PRYZEN Team');
      upsertMeta('property', 'article:section', article.category?.name || '');
      createMetaMulti('property', 'article:tag', article.tags?.map((t) => t.name));
    }

    // Twitter
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', article?.twitter_title || title);
    upsertMeta('name', 'twitter:description', article?.twitter_description || description);
    if (article?.twitter_image_url || article?.featured_image_url) {
      upsertMeta('name', 'twitter:image', article.twitter_image_url || article.featured_image_url);
    }

    // Additional Meta
    upsertMeta('name', 'viewport', 'width=device-width, initial-scale=1.0');
    upsertMeta('http-equiv', 'Content-Type', 'text/html; charset=UTF-8');
    upsertMeta('name', 'language', 'French');
    upsertMeta('name', 'revisit-after', '1 days');

    // Structured Data
    const generateArticleSchema = () => {
      if (!article) return null;
      const schema = {
        "@context": 'https://schema.org',
        "@type": 'NewsArticle',
        headline: article.seo_title || article.title,
        description: article.seo_description || article.excerpt || description,
        image: article.featured_image_url ? [article.featured_image_url] : [],
        datePublished: article.published_at,
        dateModified: article.updated_at,
        author: {
          "@type": 'Person',
          name: article.author?.username || 'PRYZEN Team',
        },
        publisher: {
          "@type": 'Organization',
          name: 'PRYZEN',
          logo: {
            "@type": 'ImageObject',
            url: `${siteUrl}/pryzen-logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": 'WebPage',
          "@id": currentUrl,
        },
        keywords: article.tags?.map((tag) => tag.name).join(', ') || '',
        articleSection: article.category?.name || '',
        wordCount: article.content?.length || 0,
        commentCount: (article as any).comments_count || 0,
        interactionStatistic: [
          {
            "@type": 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: (article as any).comments_count || 0,
          },
          {
            "@type": 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: (article as any).likes_count || 0,
          },
          {
            "@type": 'InteractionCounter',
            interactionType: 'https://schema.org/ViewAction',
            userInteractionCount: (article as any).views_count || 0,
          },
        ],
      };
      return JSON.stringify(schema);
    };

    if (article) addJsonLd(generateArticleSchema());

    // RSS
    upsertLink('alternate', `${siteUrl}/rss.xml`, {
      type: 'application/rss+xml',
      title: 'PRYZEN News Feed',
    });

    // Preconnect
    upsertLink('preconnect', 'https://fonts.googleapis.com');
    upsertLink('preconnect', 'https://fonts.gstatic.com', { crossOrigin: 'anonymous' });

    // Favicon
    upsertLink('icon', '/favicon.ico', { type: 'image/x-icon' });

    return () => {
      // Remove only the tags we created in this effect run
      created.forEach((el) => el.remove());
    };
  }, [title, description, canonical, JSON.stringify(keywords), JSON.stringify(article)]);

  return null;
};
