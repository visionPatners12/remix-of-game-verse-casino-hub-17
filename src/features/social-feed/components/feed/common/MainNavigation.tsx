import React, { useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@/ui';
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  TrendingUp, 
  Radio, 
  Flame,
  Goal,
  Video
} from "lucide-react";
import { useScrollDirection } from '@/hooks/useScrollDirection';
export type FeedFilter = 'foryou' | 'orders' | 'forecasts' | 'highlights' | 'trending' | 'live';

interface MainNavigationProps {
  selected: FeedFilter;
  onSelect: (filter: FeedFilter) => void;
  variant: 'sidebar' | 'mobile';
}

export function MainNavigation({ selected, onSelect, variant }: MainNavigationProps) {
  const { t } = useTranslation('feed');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const { scrollDirection, isAtTop } = useScrollDirection({ threshold: 10 });
  
  // Hide when scrolling down and not at top
  const shouldHide = scrollDirection === 'down' && !isAtTop;

  const navigationItems = useMemo(() => [
    {
      id: 'foryou' as const,
      icon: BookOpen,
      label: t('navigation.forYou'),
      shortLabel: t('navigation.forYou'),
      badge: null
    },
    {
      id: 'orders' as const,
      icon: Goal,
      label: t('navigation.betsHub'),
      shortLabel: t('navigation.bets'),
      badge: null
    },
    {
      id: 'forecasts' as const,
      icon: TrendingUp,
      label: t('navigation.predictions'),
      shortLabel: t('navigation.predictions'),
      badge: null
    },
    {
      id: 'highlights' as const,
      icon: Video,
      label: t('navigation.highlights'),
      shortLabel: t('navigation.highlights'),
      badge: null
    },
    {
      id: 'trending' as const,
      icon: Flame,
      label: t('navigation.trending'),
      shortLabel: t('navigation.trending'),
      badge: 'Soon',
      comingSoon: true
    },
    {
      id: 'live' as const,
      icon: Radio,
      label: t('navigation.liveNow'),
      shortLabel: t('navigation.live'),
      badge: 'Soon',
      isLive: true,
      comingSoon: true
    }
  ], [t]);

  useEffect(() => {
    if (variant === 'mobile' && scrollContainerRef.current && buttonRefs.current[selected]) {
      const container = scrollContainerRef.current;
      const button = buttonRefs.current[selected];
      
      if (button) {
        const containerWidth = container.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        
        const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selected, variant]);

  if (variant === 'mobile') {
    return (
      <div 
        className={`fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 transition-transform duration-300 ease-in-out ${
          shouldHide ? '-translate-y-[200%]' : 'translate-y-0'
        }`}
        style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <div ref={scrollContainerRef} className="flex space-x-4 px-4 overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => {
            const isActive = selected === item.id;
            
            return (
              <button
                key={item.id}
                ref={(el) => buttonRefs.current[item.id] = el}
                onClick={() => {
                  if ('vibrate' in navigator) {
                    navigator.vibrate(5);
                  }
                  onSelect(item.id);
                }}
                className={cn(
                  "relative py-3 border-b-2 text-xs tracking-wider uppercase transition-colors",
                  isActive
                    ? "border-primary font-semibold text-foreground"
                    : "border-transparent font-medium text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  {item.shortLabel}
                  {item.badge && item.comingSoon && (
                    <span className="relative inline-flex items-center">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-500/20 text-amber-500 rounded-full border border-amber-500/30 animate-pulse">
                        {item.badge}
                      </span>
                    </span>
                  )}
                  {item.badge && !item.comingSoon && (
                    <span className={cn(
                      "text-[10px] font-bold",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-20 bg-background border-r border-border flex flex-col items-center py-6 space-y-4 sticky top-14 h-[calc(100vh-56px)]">
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = selected === item.id;
        
        return (
          <div key={item.id} className="relative group">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-14 h-14 p-0 rounded-xl transition-all duration-300 flex flex-col items-center justify-center relative focus-ring",
                "group transform hover:scale-[1.01] hover:shadow-subtle active:scale-95",
                 item.id === 'live' && item.isLive
                   ? "bg-red-500/10 text-red-500 shadow-sm border border-red-500/20"
                   : isActive 
                     ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
                     : "text-muted-foreground hover:text-foreground hover:bg-muted/10 border border-transparent hover:border-border"
              )}
              title={item.label}
            >
              {/* Animated live indicator on desktop */}
              {item.id === 'live' && item.isLive && (
                <div className="absolute -top-1 -left-1 w-3 h-3">
                  <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                </div>
              )}
              
               <IconComponent className={cn(
                 "h-5 w-5",
                 item.id === 'live' && item.isLive && "text-red-500"
               )} />
              
              {isActive && item.id !== 'live' && (
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-accent rounded-full border-2 border-background shadow-subtle" />
              )}
              
              {item.badge && item.comingSoon && (
                <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-500/20 text-amber-500 rounded-full border border-amber-500/30 shadow-sm animate-pulse">
                  {item.badge}
                </div>
              )}
              
              {item.badge && !item.comingSoon && (
                <div className={cn(
                  "absolute -top-1 -right-1 min-w-[18px] h-4 text-xs rounded-full flex items-center justify-center px-1 font-semibold shadow-subtle",
                   item.id === 'live' && item.isLive
                     ? "bg-red-500/20 text-red-500 border border-red-500/30"
                     : "bg-accent text-accent-foreground border border-accent/20"
                )}>
                  {item.badge}
                </div>
              )}
            </Button>
            
            <div className="absolute left-full ml-4 px-3 py-2 bg-popover border border-border text-popover-foreground text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-md">
              {item.label}
              {item.id === 'live' && item.isLive && (
                <span className="ml-2 text-red-500 font-semibold">● {t('navigation.liveBadge')}</span>
              )}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover border-l border-t border-border rotate-45" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
