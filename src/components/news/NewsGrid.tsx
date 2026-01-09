
import React from 'react';
import { NewsArticle, NewsCategory } from '@/types/news';
import { NewsArticleCard } from './NewsArticleCard';
import { FeaturedNewsCard } from './FeaturedNewsCard';
import { motion } from 'framer-motion';

interface NewsGridProps {
  articles: NewsArticle[];
  featuredArticles: NewsArticle[];
  currentCategory?: NewsCategory;
}

export const NewsGrid = ({ articles, featuredArticles, currentCategory }: NewsGridProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Aucun article trouvé
        </h3>
        <p className="text-muted-foreground">
          {currentCategory 
            ? `Aucun article dans la catégorie "${currentCategory.name}"`
            : "Essayez de modifier vos critères de recherche"
          }
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Featured Articles Section */}
      {featuredArticles.length > 0 && !currentCategory && (
        <motion.section variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-6">Articles à la une</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <FeaturedNewsCard key={article.id} article={article} />
            ))}
          </div>
        </motion.section>
      )}

      {/* All Articles Section */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-6">
          {currentCategory ? currentCategory.name : 'Dernières actualités'}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {articles.map((article) => (
            <NewsArticleCard key={article.id} article={article} />
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};
