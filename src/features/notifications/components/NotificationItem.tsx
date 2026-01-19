import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, UserPlus, Trophy, TrendingUp, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { NotificationItem as NotificationItemType } from '../types';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead: (id: string) => void;
}

const getNotificationIcon = (type: NotificationItemType['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="h-5 w-5 text-red-500" fill="currentColor" />;
    case 'comment':
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    case 'follow':
      return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'bet_win':
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 'bet_lose':
      return <TrendingUp className="h-5 w-5 text-red-500" />;
    case 'friend_request':
      return <UserPlus className="h-5 w-5 text-blue-500" />;
    case 'system':
      return <Bell className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  return (
    <div
      className={`p-4 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer ${
        !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar or Icon */}
        <div className="relative flex-shrink-0">
          {notification.user && notification.type !== 'system' ? (
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={notification.user.avatar} 
                alt={notification.user.name} 
              />
              <AvatarFallback>
                {notification.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          )}
          
          {/* Type indicator */}
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm">
                {notification.user && (
                  <span className="font-semibold text-primary">
                    @{notification.user.name}
                  </span>
                )}{' '}
                <span className={!notification.read ? 'font-medium' : ''}>
                  {notification.content}
                </span>
              </p>
              
              {/* Metadata */}
              {notification.metadata && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {notification.metadata.winAmount && (
                    <span className="text-green-600 font-medium">
                      +{notification.metadata.winAmount}€
                    </span>
                  )}
                  {notification.metadata.betAmount && !notification.metadata.winAmount && (
                    <span>
                      Stake: {notification.metadata.betAmount}€
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(notification.time, { 
              addSuffix: true, 
              locale: fr 
            })}
          </p>

          {/* Action buttons */}
          {notification.actionable && (
            <div className="flex gap-2 mt-3">
              {notification.type === 'follow' && (
                <Button size="sm" className="h-8">
                  Follow
                </Button>
              )}
              {notification.type === 'friend_request' && (
                <>
                  <Button size="sm" className="h-8">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="h-8">
                    Ignore
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}