import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Dice5, Gamepad2, MessageCircle, TrendingUp } from "lucide-react";
import { FaBasketballBall } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage, Badge } from "@/ui";
import { getMetadataString, type UserMetadata } from "@/types/user-metadata";

export const MobileBottomBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { t } = useTranslation('navigation');

  if (!isMobile) return null;

  const metadata = user?.user_metadata as UserMetadata | undefined;
  const avatarUrl = getMetadataString(metadata, 'avatar_url');
  const username = getMetadataString(metadata, 'username');

  const navigationItems = [
    {
      to: "/mobile-menu",
      component: (
        <div className="relative flex flex-col items-center justify-center min-w-[52px] min-h-[52px] px-3 py-2">
          <div className="relative mb-1">
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={avatarUrl} 
                alt={username || user?.email || "User"} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {(username || user?.email || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[7px] bg-destructive text-destructive-foreground flex items-center justify-center border-2 border-background">
              3
            </Badge>
          </div>
          <span className="text-[9px] font-medium text-center leading-none">{t('menu.profile')}</span>
        </div>
      ),
      label: t('menu.profile'),
      isActive: location.pathname === "/mobile-menu"
    },
    {
      to: "/games",
      icon: <Dice5 className="text-lg mb-0.5" />,
      label: t('menu.game'),
      isActive: location.pathname === "/games" || location.pathname.startsWith("/games")
    },
    {
      to: "/wallet",
      icon: <Gamepad2 className="text-lg mb-0.5" />,
      label: t('menu.wallet'),
      isActive: location.pathname === "/wallet" || location.pathname.startsWith("/wallet")
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10000] bg-background border-t border-border md:hidden lg:hidden shadow-sm">
      {/* Navigation content with fixed height */}
      <div className="flex items-center justify-around py-2 max-w-sm mx-auto h-16">
        {navigationItems.map((item) => {
          const isDisabled = 'comingSoon' in item && item.comingSoon;
          
          const content = item.component || (
            <>
              <div className="flex items-center justify-center h-5 w-5 mb-0.5">
                {item.icon}
              </div>
              <span className="text-[9px] font-medium text-center leading-none">
                {item.label}
              </span>
              {'badge' in item && item.badge && (
                <Badge className={cn(
                  "absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[7px] flex items-center justify-center border-2 border-background",
                  isDisabled 
                    ? "bg-amber-500/20 text-amber-500 border-amber-500/30" 
                    : "bg-destructive text-destructive-foreground"
                )}>
                  {String(item.badge)}
                </Badge>
              )}
            </>
          );

          const baseClassName = cn(
            "flex flex-col items-center justify-center relative touch-target",
            "min-w-[48px] min-h-[48px] px-2 py-1.5 rounded-2xl",
            "transition-smooth haptic-feedback",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            isDisabled
              ? "text-muted-foreground/50 cursor-not-allowed"
              : item.isActive
                ? "bg-primary/15 text-primary shadow-glow scale-105" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20 active:bg-muted/30"
          );
          
          if (isDisabled) {
            return (
              <div key={item.to} className={baseClassName}>
                {content}
              </div>
            );
          }
          
          return (
            <Link key={item.to} to={item.to} className={baseClassName}>
              {content}
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for iOS home indicator */}
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
};
