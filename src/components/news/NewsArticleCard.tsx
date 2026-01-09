
import React from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '@/types/news';
import { Card, CardContent, Badge, Avatar, AvatarFallback, AvatarImage } from '@/ui';
import { Calendar, Eye, Heart, MessageCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface NewsArticleCardProps {
  article: NewsArticle;
}

export const NewsArticleCard = ({ article }: NewsArticleCardProps) => {
  const publishedDate = article.published_at ? new Date(article.published_at) : new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/news/${article.slug}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="md:flex">
            {/* Image */}
            {article.featured_image_url && (
              <div className="md:w-1/3 relative overflow-hidden">
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {article.category && (
                  <Badge 
                    className="absolute top-3 left-3"
                    style={{ backgroundColor: article.category.color }}
                  >
                    {article.category.name}
                  </Badge>
                )}
              </div>
            )}

            <CardContent className="md:w-2/3 p-6">
              <div className="space-y-4">
                {/* Author and Date */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {article.author && (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={article.author.avatar_url} />
                        <AvatarFallback>
                          {article.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{article.author.username}</span>
                      <span>•</span>
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(publishedDate, 'dd MMM yyyy', { locale: fr })}</span>
                  </div>
                  {article.reading_time_minutes && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.reading_time_minutes} min</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{article.views_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{article.likes_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{article.comments_count}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};
