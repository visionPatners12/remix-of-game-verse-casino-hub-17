import React from 'react';

interface SoonOverlayProps {
  children: React.ReactNode;
  enabled?: boolean;
  className?: string;
}

export const SoonOverlay = ({ children, enabled = true, className = "" }: SoonOverlayProps) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="blur-[1px] opacity-75 pointer-events-none">
        {children}
      </div>
      {/* Badge "Soon" en exposant */}
      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10 border-2 border-background">
        Soon
      </div>
    </div>
  );
};