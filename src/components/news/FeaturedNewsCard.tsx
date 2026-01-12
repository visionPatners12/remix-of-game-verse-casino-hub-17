
import React from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '@/types/news';
import { Card, CardContent, Badge } from '@/ui';
import { Calendar, Eye, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface FeaturedNewsCardProps {
  article: NewsArticle;
}

export const FeaturedNewsCard = ({ article }: FeaturedNewsCardProps) => {
  const publishedDate = article.published_at ? new Date(article.published_at) : new Date();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/news/${article.slug}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Featured Badge */}
              <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-900">
                À la une
              </Badge>

              {/* Category Badge */}
              {article.category && (
                <Badge 
                  variant="outline" 
                  className="absolute top-3 right-3 bg-black/20 text-foreground border-border/50"
                >
                  {article.category.name}
                </Badge>
              )}
            </div>
          )}

          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(publishedDate, 'dd MMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.views_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{article.likes_count}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-xl line-clamp-2 hover:text-primary transition-colors">
                {article.title}
              </h3>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-muted-foreground line-clamp-3">
                  {article.excerpt}
                </p>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
