import React from 'react';
import { Button } from '@/ui';
import { Bell, MessageSquare, Globe, History, ChevronRight, Ticket, CreditCard, Images, Settings } from 'lucide-react';
import { MenuAction } from '@/components/shared/MenuAction';
import { SoonOverlay } from '@/components/ui/SoonOverlay';

interface MobileMenuActionsProps {
  receivedRequestsCount: number;
  totalUnreadMessages: number;
  onNavigate: (path: string) => void;
  showLogout?: boolean;
}

export function MobileMenuActions({ 
  receivedRequestsCount, 
  totalUnreadMessages, 
  onNavigate,
  showLogout = true
}: MobileMenuActionsProps) {

  return (
    <>
      {/* Action Center */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground px-4 py-2 bg-muted/20">Action Center</h3>
        <MenuAction 
          icon={Ticket} 
          label="Mes Parties" 
          onClick={() => onNavigate('/my-games')}
          variant="mobile"
        />
        <MenuAction 
          icon={Images} 
          label="My Pryze" 
          onClick={() => onNavigate('/pryzen-card')}
          variant="mobile"
        />
        <MenuAction 
          icon={Settings} 
          label="Settings" 
          onClick={() => onNavigate('/settings')}
          variant="mobile"
        />
        <SoonOverlay>
          <MenuAction 
            icon={Bell} 
            label="Notifications" 
            onClick={() => onNavigate('/notifications')}
            badge={receivedRequestsCount}
            variant="mobile"
          />
        </SoonOverlay>
        <SoonOverlay>
          <MenuAction 
            icon={MessageSquare} 
            label="Messages" 
            onClick={() => onNavigate('/messages')}
            badge={totalUnreadMessages}
            variant="mobile"
          />
        </SoonOverlay>
      </div>

      {/* Logout Button */}
      {showLogout && (
        <div className="px-4 py-4">
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => onNavigate('logout')}
          >
            Logout
          </Button>
        </div>
      )}
    </>
  );
}