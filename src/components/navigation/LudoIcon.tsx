import React from 'react';
import { cn } from '@/lib/utils';

interface LudoIconProps {
  className?: string;
  size?: number;
}

/**
 * Custom Ludo board icon for gaming navigation
 */
export const LudoIcon: React.FC<LudoIconProps> = ({ className, size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Board outline */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Cross paths in center */}
      <path
        d="M2 10h8v4H2M14 10h8v4h-8M10 2v8h4V2M10 14v8h4v-8"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      
      {/* Corner zones - simplified */}
      <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="15" y="3" width="6" height="6" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="3" y="15" width="6" height="6" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="15" y="15" width="6" height="6" rx="1" fill="currentColor" opacity="0.2" />
      
      {/* Game pieces (dots) */}
      <circle cx="5" cy="5" r="1.2" fill="currentColor" />
      <circle cx="8" cy="5" r="1.2" fill="currentColor" />
      <circle cx="19" cy="5" r="1.2" fill="currentColor" />
      <circle cx="5" cy="19" r="1.2" fill="currentColor" />
      <circle cx="19" cy="19" r="1.2" fill="currentColor" />
      
      {/* Center star */}
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8" />
    </svg>
  );
};
