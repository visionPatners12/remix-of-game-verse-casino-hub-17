import React, { memo, useRef, useState, useEffect } from 'react';
import { TabsList, TabsTrigger } from "@/ui";
import { 
  Target, 
  MessageSquare, 
  BarChart3, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  Trophy, 
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  value: string;
  label: string;
  icon: React.ElementType;
  visible: boolean;
}

interface MatchDetailsTabsProps {
  tabs: Tab[];
  isMobile: boolean;
}

export const MatchDetailsTabs = memo(function MatchDetailsTabs({ 
  tabs, 
  isMobile 
}: MatchDetailsTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftFade(scrollLeft > 8);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const visibleTabs = tabs.filter(tab => tab.visible);

  if (!isMobile) {
    // Desktop: standard tabs
    return (
      <div className="bg-background border-b border-border">
        <TabsList className="w-full h-12 bg-transparent p-0 rounded-none border-none">
          {visibleTabs.map(tab => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center justify-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    );
  }

  // Mobile: horizontal scroll with fade indicators
  return (
    <div className="relative bg-background border-b border-border">
      {/* Left fade indicator */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
          showLeftFade ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Right fade indicator */}
      <div 
        className={cn(
          "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
          showRightFade ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Scrollable tabs container */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <TabsList className="inline-flex h-12 bg-transparent p-0 rounded-none border-none min-w-full">
          {visibleTabs.map(tab => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="flex-shrink-0 px-4 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-1.5"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="text-xs whitespace-nowrap">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </div>
  );
});

// Export tab configurations helper
export const getMatchDetailsTabs = ({
  hasMatchId,
  showBoxScore,
  isFinished,
  isCricket,
  isBasketball,
  isNBABasketball,
  isPrematchFootball,
  isAmericanFootball,
  isBaseball,
  isHockey,
  isNHLTierHockey,
  isVolleyball,
  isRugby,
  isLive,
  hasAzuroGameId,
  isPrematch
}: {
  hasMatchId: boolean;
  showBoxScore: boolean;
  isFinished: boolean;
  isCricket: boolean;
  isBasketball: boolean;
  isNBABasketball: boolean;
  isPrematchFootball: boolean;
  isAmericanFootball: boolean;
  isBaseball: boolean;
  isHockey: boolean;
  isNHLTierHockey: boolean;
  isVolleyball: boolean;
  isRugby: boolean;
  isLive: boolean;
  hasAzuroGameId?: boolean;
  isPrematch?: boolean;
}): Tab[] => {
  // Cricket/Rugby prematch: only show Markets
  const isCricketPrematch = isCricket && isPrematch;
  const isRugbyPrematch = isRugby && isPrematch;
  const isPrematchOnlyMarkets = isCricketPrematch || isRugbyPrematch;
  // For generic hockey (non-NHL tier) and volleyball, only show BoxScore and Markets
  const isGenericHockey = isHockey && !isNHLTierHockey;
  
  return [
    {
      value: 'boxscore',
      label: isVolleyball || isGenericHockey ? 'Score' : 'Box Score',
      icon: ClipboardList,
      visible: showBoxScore && !isPrematchOnlyMarkets
    },
    {
      value: 'markets',
      label: 'Markets',
      icon: Target,
      visible: !isFinished
    },
    {
      value: 'events',
      label: 'Match Events',
      icon: MessageSquare,
      visible: hasMatchId && !isCricket && !isBasketball && !isPrematchFootball && !isGenericHockey && !isVolleyball && !isPrematchOnlyMarkets
    },
    {
      value: 'stats',
      label: 'Stats',
      icon: BarChart3,
      visible: hasMatchId && !isPrematchFootball && !isGenericHockey && !isVolleyball && !isPrematchOnlyMarkets
    },
    {
      value: 'lineup',
      label: isHockey ? 'Roster' : 'Lineup',
      icon: Users,
      visible: hasMatchId && !isAmericanFootball && !isCricket && !isBaseball && !(isBasketball && !isNBABasketball) && !isPrematchFootball && !isGenericHockey && !isVolleyball && !isPrematchOnlyMarkets
    },
    {
      value: 'roster',
      label: 'Roster',
      icon: Users,
      visible: hasMatchId && (isBaseball || isAmericanFootball) && !isPrematchOnlyMarkets
    },
    {
      value: 'squad',
      label: 'Squad',
      icon: Users,
      visible: hasMatchId && isCricket && !isPrematchOnlyMarkets
    },
    {
      value: 'performers',
      label: 'Stars',
      icon: Trophy,
      visible: hasMatchId && isCricket && !isPrematchOnlyMarkets
    },
    {
      value: 'injuries',
      label: 'Injuries',
      icon: AlertTriangle,
      visible: hasMatchId && isAmericanFootball && !isPrematchOnlyMarkets
    },
    {
      value: 'azuro-stats',
      label: 'Live',
      icon: Activity,
      visible: isBasketball && isLive && !isPrematchOnlyMarkets
    }
  ];
};
