
import React from "react";
import { cn } from "@/lib/utils";

interface AvatarFallbackProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "team" | "league" | "user";
}

const getThemeColorFromName = (name: string, variant: "team" | "league" | "user" = "team"): string => {
  // Utiliser les couleurs du thème au lieu des couleurs personnalisées
  const teamColors = [
    "bg-primary/80", "bg-secondary/80", "bg-accent/80", 
    "bg-blue-500/80", "bg-green-500/80", "bg-red-500/80", 
    "bg-purple-500/80", "bg-orange-500/80", "bg-cyan-500/80", 
    "bg-pink-500/80", "bg-indigo-500/80", "bg-teal-500/80"
  ];
  
  const leagueColors = [
    "bg-muted/80", "bg-border/80", "bg-primary/60", "bg-secondary/60"
  ];
  
  const colors = variant === "league" ? leagueColors : teamColors;
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string, variant: "team" | "league" | "user" = "team"): string => {
  // For teams, return empty string (no initials)
  if (variant === "team") return "";
  
  if (!name) return variant === "league" ? "L" : "U";
  
  if (variant === "league") {
    return name.substring(0, 2).toUpperCase();
  }
  
  // Only for user variant
  return name.charAt(0).toUpperCase();
};

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base"
};

export function AvatarFallback({ name, className, size = "md", variant = "team" }: AvatarFallbackProps) {
  const bgColor = getThemeColorFromName(name, variant);
  const initials = getInitials(name, variant);
  
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold border-0",
        bgColor,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
