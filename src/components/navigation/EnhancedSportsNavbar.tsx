import React, { useState } from 'react';
import { ScrollArea } from '@/ui';
import { cn } from '@/lib/utils';
import { getSportById } from '@/lib/sportsMapping';
import { FaStar } from 'react-icons/fa';

// Import the full sports mapping
const sportsMapping = [
  { id: "33", name: 'Football', slug: 'football' },
  { id: "31", name: 'Basketball', slug: 'basketball' },
  { id: "45", name: 'Tennis', slug: 'tennis' },
  { id: "32", name: 'Ice Hockey', slug: 'ice-hockey' },
  { id: "28", name: 'Baseball', slug: 'baseball' },
  { id: "44", name: 'American Football', slug: 'american-football' },
  { id: "40", name: 'Cricket', slug: 'cricket' },
  { id: "26", name: 'Volleyball', slug: 'volleyball' },
  { id: "1", name: 'Table Tennis', slug: 'table-tennis' },
  { id: "36", name: 'MMA', slug: 'mma' },
  { id: "29", name: 'Boxing', slug: 'boxing' },
  { id: "59", name: 'Rugby Union', slug: 'rugby-union' },
  { id: "58", name: 'Rugby League', slug: 'rugby-league' },
  { id: "1061", name: 'Counter-Strike 2', slug: 'cs2' },
  { id: "1001", name: 'CS:GO', slug: 'csgo' },
  { id: "1002", name: 'League of Legends', slug: 'lol' },
  { id: "1000", name: 'Dota 2', slug: 'dota-2' },
  { id: "56", name: 'Politics', slug: 'politics' },
  { id: "66", name: 'Unique', slug: 'unique' },
];

const sports = [
  { id: 'all', name: 'Tous', slug: 'all', icon: FaStar },
  ...sportsMapping.map(sport => ({
    ...sport,
    icon: getSportById(sport.id).icon
  }))
];

interface EnhancedSportsNavbarProps {
  activeSport?: string;
  onSportChange?: (sportId: string) => void;
  className?: string;
}

export function EnhancedSportsNavbar({ 
  activeSport = 'all', 
  onSportChange,
  className 
}: EnhancedSportsNavbarProps) {
  const [selectedSport, setSelectedSport] = useState(activeSport);

  const handleSportClick = (sportId: string) => {
    setSelectedSport(sportId);
    onSportChange?.(sportId);
  };

  return (
    <div className={cn("bg-card/50 border-b border-border/20 backdrop-blur-sm", className)}>
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-0.5 px-3 py-2 min-w-max">
          {sports.map((sport) => (
            <button
              key={sport.id}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:scale-105 min-w-[60px] group flex-shrink-0",
                selectedSport === sport.id 
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-sm" 
                  : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleSportClick(sport.id)}
            >
              {/* Icône du sport */}
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                selectedSport === sport.id 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted/40 group-hover:bg-muted/80"
              )}>
                <sport.icon className="w-3.5 h-3.5" />
              </div>
              
              {/* Nom du sport - petite police en bas */}
              <span className={cn(
                "text-[10px] font-medium text-center leading-tight max-w-full break-words",
                selectedSport === sport.id 
                  ? "text-primary font-semibold" 
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {sport.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}