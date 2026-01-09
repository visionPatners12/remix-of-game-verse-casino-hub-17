import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MainTabBarProps {
  activeTab: 'overview' | 'staff';
  onTabChange: (tab: 'overview' | 'staff') => void;
}

export function MainTabBar({ activeTab, onTabChange }: MainTabBarProps) {
  return (
    <div className="bg-background px-4 py-3 border-b border-border">
      <div className="flex gap-3">
        <Badge
          variant={activeTab === 'overview' ? "default" : "secondary"}
          className={`
            cursor-pointer transition-colors duration-200 px-4 py-2
            ${activeTab === 'overview' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }
          `}
          onClick={() => onTabChange('overview')}
        >
          <span className="text-sm font-medium">Overview</span>
        </Badge>
        
        <Badge
          variant={activeTab === 'staff' ? "default" : "secondary"}
          className={`
            cursor-pointer transition-colors duration-200 px-4 py-2
            ${activeTab === 'staff' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }
          `}
          onClick={() => onTabChange('staff')}
        >
          <span className="text-sm font-medium">Staff</span>
        </Badge>
      </div>
    </div>
  );
}