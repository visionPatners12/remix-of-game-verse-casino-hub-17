import React from 'react';
import { Bell, MessageCircle, Camera, Globe } from 'lucide-react';
import { Badge } from '@/ui';

interface MenuActionsWebProps {
  receivedRequests: number;
  unreadMessages: number;
  onNavigation: (path: string) => void;
}

export const MenuActionsWeb = ({ 
  receivedRequests, 
  unreadMessages, 
  onNavigation 
}: MenuActionsWebProps) => {
  return (
    <div className="space-y-2">
      {/* Action Center */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Action Center
        </p>
        
        <button
          onClick={() => onNavigation('/friends')}
          className="w-full flex items-center justify-between px-2 py-2 hover:bg-muted/50 rounded-md transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm text-foreground">Notifications</span>
          </div>
          {receivedRequests > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 text-xs">
              {receivedRequests}
            </Badge>
          )}
        </button>

        <button
          onClick={() => onNavigation('/messages')}
          className="w-full flex items-center justify-between px-2 py-2 hover:bg-muted/50 rounded-md transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm text-foreground">Messages</span>
          </div>
          {unreadMessages > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 text-xs">
              {unreadMessages}
            </Badge>
          )}
        </button>
      </div>

      {/* Gallery */}
      <div className="space-y-1">
        <button
          onClick={() => onNavigation('/gallery')}
          className="w-full flex items-center gap-3 px-2 py-2 hover:bg-muted/50 rounded-md transition-all duration-300 group"
        >
          <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm text-foreground">Pryzen Gallery</span>
        </button>
      </div>

      {/* Language */}
      <div className="space-y-1">
        <button
          onClick={() => {}}
          className="w-full flex items-center gap-3 px-2 py-2 hover:bg-muted/50 rounded-md transition-all duration-300 group"
        >
          <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm text-foreground">Language</span>
          <span className="text-xs text-muted-foreground ml-auto">EN</span>
        </button>
      </div>
    </div>
  );
};