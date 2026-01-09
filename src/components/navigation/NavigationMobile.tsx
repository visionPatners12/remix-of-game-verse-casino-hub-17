
import { Link } from "react-router-dom";
import { Button } from "@/ui";
import { NavItem, UserQuickMenuProps } from "./types";

interface NavigationMobileProps extends UserQuickMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  navItems: NavItem[];
  isActivePath: (path: string) => boolean;
  disableNavigation?: boolean;
}

export const NavigationMobile = ({ 
  isOpen, 
  setIsOpen, 
  navItems, 
  isActivePath, 
  user, 
  onLogout, 
  disableNavigation 
}: NavigationMobileProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-background border-t">
      <div className="container mx-auto px-4 py-4">
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={disableNavigation ? "#" : item.href}
              onClick={() => !disableNavigation && setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActivePath(item.href)
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-foreground hover:bg-accent"
              } ${disableNavigation ? "pointer-events-none opacity-50" : ""}`}
            >
              {item.icon && (
                <div className="relative">
                  <span>{item.icon}</span>
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-primary font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              {user.balance && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  ${user.balance.real} + 
                  <img 
                    src="/lovable-uploads/2886bb16-b2b7-4ea8-ac61-21cb05749d7e.png" 
                    alt="STX" 
                    className="h-3 w-3 object-contain mx-1"
                  />
                  {user.balance.bonus} STX
                </div>
              )}
            </div>
          </div>
          
          <Button 
            onClick={onLogout}
            variant="outline" 
            className="w-full"
          >
            <i className="ri-logout-box-r-line mr-2"></i>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
