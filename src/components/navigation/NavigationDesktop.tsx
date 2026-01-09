
import { Link } from "react-router-dom";
import { NavItem } from "./types";
import { Badge } from "@/ui";

interface NavigationDesktopProps {
  navItems: NavItem[];
  isActivePath: (path: string) => boolean;
  disableNavigation?: boolean;
}

export const NavigationDesktop = ({ navItems, isActivePath, disableNavigation }: NavigationDesktopProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navItems.map((item, index) => {
        const isDisabled = disableNavigation || item.comingSoon;
        
        const content = (
          <>
            {item.icon && (
              <div className="relative">
                <span className="text-lg">{item.icon}</span>
                {item.badge && typeof item.badge === 'number' && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shadow-lg">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              {item.href !== "/profile" && item.href !== "/search" && (
                <span className="font-semibold tracking-wide">{item.label}</span>
              )}
              {item.href === "/search" && (
                <span className="font-semibold tracking-wide hidden lg:inline">{item.label}</span>
              )}
              {item.badge && typeof item.badge === 'string' && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 ${
                    item.comingSoon 
                      ? "bg-amber-500/20 text-amber-500 border-amber-500/30" 
                      : "bg-accent/20 text-accent-foreground border-accent/30"
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
          </>
        );

        const baseClassName = `flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
          isDisabled
            ? "cursor-not-allowed opacity-50 text-muted-foreground"
            : isActivePath(item.href)
              ? "bg-primary/20 text-primary font-semibold shadow-sm border border-primary/20"
              : "text-foreground/80 hover:text-foreground hover:bg-muted/10 hover:scale-105 transform"
        }`;

        if (isDisabled) {
          return (
            <div key={index} className={baseClassName}>
              {content}
            </div>
          );
        }

        return (
          <Link
            key={index}
            to={item.href}
            className={baseClassName}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
};
