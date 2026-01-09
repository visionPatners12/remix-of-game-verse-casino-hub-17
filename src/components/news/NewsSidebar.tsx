
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/ui';
import { TrendingUp, Tag, Calendar } from 'lucide-react';
// Hooks disabled for security - removing SQL injection vulnerabilities
import { Link, useSearchParams } from 'react-router-dom';

export const NewsSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Temporarily disabled - security fix in progress
  const popularArticles: any[] = [];
  const popularTags: any[] = [];

  const handleTagClick = (tagSlug: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tag', tagSlug);
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      {/* Popular Articles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Articles populaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularArticles?.slice(0, 5).map((article) => (
            <Link 
              key={article.id} 
              to={`/news/${article.slug}`}
              className="block group"
            >
              <div className="flex gap-3">
                {article.featured_image_url && (
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-16 h-12 object-cover rounded flex-shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(article.published_at || '').toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5 text-primary" />
            Tags populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags?.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleTagClick(tag.slug)}
              >
                #{tag.name}
                <span className="ml-1 text-xs">({tag.usage_count})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Signup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Recevez les dernières actualités directement dans votre boîte mail.
          </p>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Votre email"
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            />
            <button className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              S'abonner
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
