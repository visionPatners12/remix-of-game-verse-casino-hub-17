import { NewsArticle } from '../types/player';
import { ExternalLink } from 'lucide-react';

interface PlayerRelatedNewsProps {
  news: NewsArticle[];
}

export function PlayerRelatedNews({ news }: PlayerRelatedNewsProps) {
  if (!news || news.length === 0) return null;

  // Show first 5 articles
  const recentNews = news.slice(0, 5);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Related News
      </h3>
      
      <div className="space-y-1">
        {recentNews.map((article, index) => (
          <a 
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors -mx-2 px-2 rounded"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {article.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {article.date}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
