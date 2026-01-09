import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TeamData {
  id: string | null;
  name: string;
  slug?: string | null;
  logo?: string | null;
}

interface TeamButtonProps {
  team: TeamData | null;
  initials: string;
  variant: 'home' | 'away';
  onClick: (team: TeamData | null) => void;
}

export function TeamButton({ 
  team, 
  initials, 
  variant,
  onClick 
}: TeamButtonProps) {
  const isHome = variant === 'home';
  const isClickable = !!team?.id;
  const teamName = team?.name || 'Unknown';
  const teamLogo = team?.logo || '';

  return (
    <button
      onClick={() => onClick(team)}
      disabled={!isClickable}
      className={cn(
        "flex flex-col items-center gap-1 flex-1 min-w-0 max-w-[40%] transition-all",
        isClickable && "hover:scale-105 cursor-pointer group"
      )}
    >
      <Avatar className={cn(
        "w-10 h-10 sm:w-14 sm:h-14 border border-primary/20 bg-primary/5 shrink-0",
        isHome ? "" : "border-secondary/20 bg-secondary/5",
        isClickable && isHome && "group-hover:border-primary/40 group-hover:bg-primary/10 transition-all",
        isClickable && !isHome && "group-hover:border-secondary/40 group-hover:bg-secondary/10 transition-all"
      )}>
        <AvatarImage src={teamLogo} alt={`${teamName} logo`} />
        <AvatarFallback className={cn(
          "text-xs sm:text-sm font-bold",
          isHome ? "text-primary bg-primary/10" : "text-secondary bg-secondary/10"
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className={cn(
        "text-xs sm:text-sm font-semibold text-foreground text-center leading-tight line-clamp-2 px-1",
        isClickable && isHome && "group-hover:text-primary transition-colors",
        isClickable && !isHome && "group-hover:text-secondary transition-colors"
      )}>
        {teamName}
      </span>
    </button>
  );
}
