
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/ui';
import { Button, Card, CardContent, Badge, Textarea } from '@/ui';
import { 
  Image, 
  Hash, 
  AtSign, 
  Send,
  X,
  Smile
} from 'lucide-react';
import { useCreation } from './CreationManager';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

const QUICK_TEMPLATES = [
  { label: "🎯 Prediction", content: "My prediction for tonight's match:" },
  { label: "📊 Analysis", content: "Tactical analysis:" },
  { label: "🔥 Hot Take", content: "Unpopular hot take:" },
  { label: "❓ Question", content: "Your thoughts on:" },
];

const TRENDING_HASHTAGS = [
  "#ChampionsLeague", "#Ligue1", "#PremierLeague", 
  "#LaLiga", "#SerieA", "#Football"
];

export function QuickPostSheet() {
  const { isPostDialogOpen, setPostDialogOpen } = useCreation();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemplateSelect = (template: typeof QUICK_TEMPLATES[0]) => {
    setContent(template.content + ' ');
  };

  const handleHashtagToggle = (hashtag: string) => {
    setSelectedTags(prev => 
      prev.includes(hashtag) 
        ? prev.filter(tag => tag !== hashtag)
        : [...prev, hashtag]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate post sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success toast
      toast({
        title: "Post published!",
        description: "Your post has been published successfully.",
      });
      
      // Reset form
      setContent('');
      setSelectedTags([]);
      setPostDialogOpen(false);
      
      // Redirection vers la page home
      navigate('/');
    } catch (error) {
      logger.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = content.trim().length > 0;
  const charCount = content.length;
  const maxChars = 280;

  return (
    <Sheet open={isPostDialogOpen} onOpenChange={setPostDialogOpen}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-lg border-0 bg-background"
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">
                Create Post
              </SheetTitle>
              <SheetDescription>
                Share your predictions and analysis
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPostDialogOpen(false)}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-4 pb-20">
          {/* Quick templates */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">
              Quick Templates
            </h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((template) => (
                <Button
                  key={template.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="text-xs h-8"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Text area */}
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in sports?"
              className="min-h-[120px] text-base resize-none border-0 shadow-none focus-visible:ring-0 p-4"
              maxLength={maxChars}
            />
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Hash className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <AtSign className="h-4 w-4" />
                </Button>
              </div>
              <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charCount}/{maxChars}
              </span>
            </div>
          </div>

          {/* Trending hashtags */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">
              Trending Hashtags
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING_HASHTAGS.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant={selectedTags.includes(hashtag) ? "default" : "secondary"}
                  className="cursor-pointer text-xs"
                  onClick={() => handleHashtagToggle(hashtag)}
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                      <button
                        onClick={() => handleHashtagToggle(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fixed actions at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPostDialogOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                "Publishing..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
