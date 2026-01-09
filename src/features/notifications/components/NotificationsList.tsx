import { Bell } from "lucide-react";
import { NotificationItem } from './NotificationItem';
import { NotificationItem as NotificationItemType } from '../types';

interface NotificationsListProps {
  notifications: NotificationItemType[];
  onMarkAsRead: (id: string) => void;
}

export function NotificationsList({ notifications, onMarkAsRead }: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No notifications</h3>
        <p className="text-muted-foreground">
          You will receive your notifications here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}
