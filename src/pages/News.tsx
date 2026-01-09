
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { SEOHead } from '@/components/news/SEOHead';
import { NewsHeader } from '@/components/news/NewsHeader';
import { NewsCategoriesNav } from '@/components/news/NewsCategoriesNav';
import { NewsGrid } from '@/components/news/NewsGrid';
import { NewsSidebar } from '@/components/news/NewsSidebar';
import { NewsSearch } from '@/components/news/NewsSearch';
// News hooks removed for security - SQL injection fix in progress
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useResponsive } from '@/hooks/useResponsive';

export default function News() {
  const [searchParams] = useSearchParams();
  const { isMobile } = useResponsive();
  
  const categorySlug = searchParams.get('category') || undefined;
  const tagSlug = searchParams.get('tag') || undefined;
  const search = searchParams.get('search') || undefined;

  // News functionality temporarily disabled - security fix in progress
  const articles: any[] = [];
  const articlesLoading = false;
  const categories: any[] = [];
  const featuredArticles: any[] = [];

  const currentCategory = categories?.find(cat => cat.slug === categorySlug);

  return (
    <Layout>
      <SEOHead
        title={`Actualités${currentCategory ? ` - ${currentCategory.name}` : ''}`}
        description="Découvrez les dernières actualités de notre plateforme de paris sportifs. News, mises à jour, guides et événements."
        keywords={['actualités', 'news', 'football', 'paris sportifs', 'plateforme', 'guides']}
      />

      <div className="min-h-screen bg-background">
        <NewsHeader />
        
        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <NewsSearch />
          </div>

          {/* Categories Navigation */}
          <div className="mb-8">
            <NewsCategoriesNav categories={categories || []} />
          </div>

          <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {/* Main Content */}
            <div className={isMobile ? '' : 'lg:col-span-2'}>
              {articlesLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <NewsGrid 
                  articles={articles || []} 
                  featuredArticles={featuredArticles || []}
                  currentCategory={currentCategory}
                />
              )}
            </div>

            {/* Sidebar */}
            {!isMobile && (
              <div className="lg:col-span-1">
                <NewsSidebar />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
