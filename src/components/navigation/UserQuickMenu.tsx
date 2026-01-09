import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage, Button, Badge } from "@/ui";
import { Separator } from "@/ui";
import { Link } from "react-router-dom";
import { 
  User, 
  Wallet, 
  Target, 
  History, 
  Trophy, 
  TrendingUp, 
  MessageSquare, 
  Bell,
  Settings,
  LogOut,
  X,
  Ticket,
  LayoutDashboard
} from "lucide-react";
import { UserQuickMenuProps } from "./types";

export const UserQuickMenu = ({ user, onLogout, isInGameRoom, onClose }: UserQuickMenuProps) => {
  const { t } = useTranslation('navigation');

  const quickActions = [
    {
      label: t('quickActions.bet'),
      href: "/mes-paris",
      icon: Ticket,
      color: "text-green-500",
      badge: "5",
      badgeColor: "bg-green-500/20 text-green-400"
    },
    {
      label: t('quickActions.wallet'),
      href: "/wallet",
      icon: Wallet,
      color: "text-blue-500",
      badge: user.balance ? `${user.balance.real + user.balance.bonus}€` : undefined,
      badgeColor: "bg-blue-500/20 text-blue-400"
    },
    {
      label: t('quickActions.messages'),
      href: "/friends",
      icon: MessageSquare,
      color: "text-purple-500",
      badge: "2",
      badgeColor: "bg-purple-500/20 text-purple-400"
    },
    {
      label: t('quickActions.performance'),
      href: "/performances",
      icon: TrendingUp,
      color: "text-orange-500"
    }
  ];

  const menuItems = [
    {
      label: t('links.dashboard', 'Dashboard'),
      href: "/user-dashboard",
      icon: LayoutDashboard
    },
    {
      label: t('links.myProfile'),
      href: "/profile",
      icon: User
    },
    {
      label: t('links.history'),
      href: "/my-bets",
      icon: History
    },
    {
      label: t('links.achievements'),
      href: "/achievements",
      icon: Trophy
    },
    {
      label: t('links.notifications'),
      href: "/notifications",
      icon: Bell,
      badge: "3"
    },
    {
      label: t('links.settings'),
      href: "/settings",
      icon: Settings
    }
  ];

  return (
    <div className="w-80 bg-gradient-to-b from-[#151a32] to-[#0d111e] border border-border/20 rounded-lg shadow-xl p-4">
      {/* Header avec fermeture */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{t('menu.userMenu')}</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4 text-white/60" />
          </Button>
        )}
      </div>

      {/* Profil utilisateur */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-lg">
        <Avatar className="h-12 w-12 border-2 border-primary/30">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-white">
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-white font-medium">{user.name}</p>
          {user.balance && (
            <div className="flex gap-2 text-xs">
              <span className="text-green-400">{user.balance.real}€</span>
              <span className="text-blue-400">{user.balance.bonus}€ bonus</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mb-4">
        <h4 className="text-white/80 text-sm font-medium mb-2">{t('quickActions.title')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link 
                key={action.label}
                to={action.href}
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <IconComponent className={`h-4 w-4 ${action.color}`} />
                  {action.badge && (
                    <Badge className={`text-xs ${action.badgeColor || 'bg-white/20 text-white/80'}`}>
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-white/90 text-xs font-medium">{action.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator className="bg-border/30 my-3" />

      {/* Menu complet */}
      <div className="space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link 
              key={item.label}
              to={item.href}
              onClick={onClose}
              className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md transition-colors group"
            >
              <div className="flex items-center gap-3">
                <IconComponent className="h-4 w-4 text-white/60 group-hover:text-primary/80" />
                <span className="text-white/90 text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <Badge className="bg-red-500/20 text-red-400 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      <Separator className="bg-border/30 my-3" />

      {/* Déconnexion */}
      <Button 
        variant="ghost" 
        className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          onLogout();
          onClose?.();
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {t('menu.logout')}
      </Button>
    </div>
  );
};
