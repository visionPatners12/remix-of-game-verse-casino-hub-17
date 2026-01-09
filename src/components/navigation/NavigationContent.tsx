
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationDesktop } from "./NavigationDesktop";
import { UserSection } from "./UserSection";
import { NavItem } from "./types";
import { useUnifiedWallet } from "@/features/wallet";
import { useWalletTokensThirdWeb } from "@/features/wallet/hooks/tokens/useWalletTokensThirdWeb";
import { useUserProfile } from "@/features/profile";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useAuth } from "@/features/auth";

import { useIsMobile } from "@/hooks/use-mobile";
import { useBaseBetslip } from '@azuro-org/sdk';

// Icônes Lucide React
import { Dice5, Gamepad2, Wallet } from "lucide-react";
import { FaBasketballBall } from "react-icons/fa";

interface NavigationContentProps {
  disableNavigation?: boolean;
}

export const NavigationContent = ({ disableNavigation = false }: NavigationContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('navigation');
  
  const location = useLocation();
  const { session, signOut } = useAuth();
  const { address, isLoading } = useUnifiedWallet();
  const { totalUnreadMessages } = useDirectMessages();
  const baseBetslip = useBaseBetslip();
  const { items: selections = [] } = baseBetslip || {};
  const isMobile = useIsMobile();
  const { totalValue: usdtBalance } = useWalletTokensThirdWeb();
  
  const { profile: userProfile } = useUserProfile();
  
  const user = {
    name: userProfile?.username || "Player",
    avatar: userProfile?.avatar_url || "",
    balance: {
      real: parseFloat((usdtBalance ?? 0).toFixed(2)),
      bonus: 0
    }
  };
  
  const authenticatedNavItems: NavItem[] = [
    { 
      label: t('menu.game'), 
      href: "/games", 
      icon: <Gamepad2 className="text-sm sm:text-base md:text-lg" />
    },
    { 
      label: t('menu.wallet'), 
      href: "/wallet", 
      icon: <Wallet className="text-sm sm:text-base md:text-lg" />
    },
  ];

  const publicNavItems: NavItem[] = [
    { 
      label: t('menu.game'), 
      href: "/games", 
      icon: <Gamepad2 className="text-sm sm:text-base md:text-lg" />
    },
  ];
  
  const handleLogout = async () => {
    await signOut();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || (path === "/profile" && location.pathname.startsWith("/profile"));
  };

  const logoUrl = "/pryzen-logo.png";

  return (
    <div className="h-full w-full">
      {/* Mobile Top Navbar */}
      {isMobile ? (
        <div className="w-full h-full px-4 flex items-center">
          <div className="flex justify-between items-center w-full">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src={logoUrl} 
                alt="PRYZEN" 
                className="h-7 object-contain transition-all duration-300 filter" 
              />
              <div className="flex flex-col">
                <span className="text-sm text-foreground font-bold tracking-wide">
                  PRYZEN
                </span>
                <span className="text-[10px] text-primary/80 font-medium tracking-wider">
                  GAMING EVOLVED
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              <UserSection
                isAuthenticated={!!session}
                user={user}
                navItems={session ? authenticatedNavItems : publicNavItems}
                isActivePath={isActivePath}
                onLogout={handleLogout}
                totalUnreadMessages={totalUnreadMessages || 0}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                disableNavigation={disableNavigation}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Navigation */
        <div className="w-full h-full px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={logoUrl} 
              alt="PRYZEN" 
              className="h-7 object-contain transition-all duration-300 filter" 
            />
            <div className="flex flex-col">
              <span className="text-sm text-foreground font-bold tracking-wide">
                PRYZEN
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider">
                GAMING EVOLVED
              </span>
            </div>
          </Link>
          
          <NavigationDesktop 
            navItems={session ? authenticatedNavItems : publicNavItems} 
            isActivePath={isActivePath} 
            disableNavigation={disableNavigation} 
          />
          
          <div className="flex items-center gap-3">
            
            <UserSection
              isAuthenticated={!!session}
              user={user}
              navItems={session ? authenticatedNavItems : publicNavItems}
              isActivePath={isActivePath}
              onLogout={handleLogout}
              totalUnreadMessages={totalUnreadMessages || 0}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              disableNavigation={disableNavigation}
              
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};
