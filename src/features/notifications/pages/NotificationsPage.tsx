import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { NotificationsList } from '../components';
import { useNotifications } from '../hooks';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-6 px-4">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Chargement des notifications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/', { replace: true })}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="text-primary"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <NotificationsList 
          notifications={notifications}
          onMarkAsRead={markAsRead}
        />
      </div>
    </Layout>
  );
}