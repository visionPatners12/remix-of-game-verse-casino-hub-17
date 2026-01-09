import React from 'react';
import { cn } from '@/lib/utils';

interface NetworkIndicatorProps {
  isOnline: boolean;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({ isOnline }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 transition-colors duration-300",
        !isOnline && "text-destructive"
      )}
      title={isOnline ? "Connected" : "Offline"}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isOnline 
            ? "bg-green-500" 
            : "bg-destructive animate-pulse"
        )}
      />
      {!isOnline && (
        <span className="text-[10px] font-medium animate-pulse">Offline</span>
      )}
    </div>
  );
};
