import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface MenuActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  badge?: number;
  variant?: 'mobile' | 'desktop' | 'auto';
  className?: string;
}

export function MenuAction({ 
  icon: Icon, 
  label, 
  onClick, 
  badge,
  variant = 'auto',
  className = ''
}: MenuActionProps) {
  const { isMobile } = useResponsive();
  const actualVariant = variant === 'auto' ? (isMobile ? 'mobile' : 'desktop') : variant;

  if (actualVariant === 'mobile') {
    return (
      <div 
        className={`flex items-center gap-3 px-4 py-3 bg-background active:bg-muted/30 cursor-pointer relative ${className}`}
        onClick={onClick}
      >
        <Icon className="h-5 w-5 text-foreground" />
        <span className="text-sm flex-1">{label}</span>
        {badge && badge > 0 && (
          <span className="bg-destructive text-destructive-foreground rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center text-xs font-semibold">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  // Desktop variant - more compact
  return (
    <div 
      className={`flex items-center gap-2 p-3 border border-border bg-card/20 hover:bg-card/40 rounded-lg cursor-pointer transition-all duration-200 group relative ${className}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-primary group-hover:text-primary-hover transition-colors duration-200" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      {badge && badge > 0 && (
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-full flex items-center justify-center font-bold text-[10px] w-5 h-5 ml-1">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary ml-auto transition-colors duration-200" />
    </div>
  );
}