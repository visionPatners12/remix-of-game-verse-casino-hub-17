
import { Button } from "@/ui";
import { ProfileMenu } from "./ProfileMenu";
import { WebProfileMenu } from "./web/WebProfileMenu";
import { NavigationMobile } from "./NavigationMobile";
import { Link } from "react-router-dom";
import { NavItem } from "./types";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResponsive } from "@/hooks/useResponsive";

interface UserSectionProps {
  isAuthenticated: boolean;
  user: {
    name: string;
    avatar: string;
    balance: {
      real: number;
      bonus: number;
    };
  };
  navItems: NavItem[];
  isActivePath: (path: string) => boolean;
  onLogout: () => void;
  totalUnreadMessages: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disableNavigation?: boolean;
  
  isLoading: boolean;
}

// Format balance with proper decimal places
const formatBalance = (amount: number): string => {
  return amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

export const UserSection = ({
  isAuthenticated,
  user,
  navItems,
  isActivePath,
  onLogout,
  totalUnreadMessages,
  isOpen,
  setIsOpen,
  disableNavigation = false,
  
  isLoading
}: UserSectionProps) => {
  const isMobile = useIsMobile();
  const { isMobile: isResponsiveMobile } = useResponsive();

  if (isAuthenticated) {
    return (
      <>
        <div className={`flex items-center ${isMobile ? "gap-2" : "gap-1"}`}>
          {/* Balance Display - Clean minimal design */}
          <div className={`bg-card/60 backdrop-blur-sm rounded-xl border border-border/30 ${
            isMobile ? "px-3 py-2" : "px-3 py-1.5"
          }`}>
            <div className="flex items-center gap-2.5">
              <Button
                asChild
                className={`p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 ${
                  isMobile ? "w-8 h-8 rounded-xl" : "w-6 h-6 rounded-lg"
                }`}
              >
                <Link to="/deposit" aria-label="Add funds">
                  <Plus className={isMobile ? "w-4 h-4" : "w-3.5 h-3.5"} />
                </Link>
              </Button>
              <Link to="/wallet" className="hover:opacity-80 transition-opacity">
                <span className={`text-foreground font-bold tracking-tight ${
                  isMobile ? "text-base" : "text-sm"
                }`}>
                  {isLoading ? "..." : `$${formatBalance(user.balance.real)}`}
                </span>
              </Link>
            </div>
          </div>

          {/* Profile Menu - Desktop only */}
          {!isMobile && (
            <div className="scale-90">
              {isResponsiveMobile ? (
                <ProfileMenu user={user} onLogout={onLogout} />
              ) : (
                <WebProfileMenu 
                  user={{
                    user_metadata: {
                      username: user.name,
                      avatar_url: user.avatar
                    },
                    email: `${user.name}@example.com`,
                    balance: user.balance
                  }} 
                  onLogout={onLogout} 
                />
              )}
            </div>
          )}
        </div>
        
        {/* Navigation Mobile */}
        <NavigationMobile
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navItems={navItems}
          isActivePath={isActivePath}
          user={user}
          onLogout={onLogout}
          disableNavigation={disableNavigation}
        />

      </>
    );
  }

  // Hide login/signup buttons - authentication handled by Privy
  return (
    <NavigationMobile
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      navItems={navItems}
      isActivePath={isActivePath}
      user={user}
      onLogout={onLogout}
      disableNavigation={disableNavigation}
    />
  );
};
