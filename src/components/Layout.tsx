import { PropsWithChildren } from "react";
import { useHideNavigation } from "@/hooks/useHideNavigation";

interface LayoutProps extends PropsWithChildren {
  hideNavigation?: boolean;
  hideFooter?: boolean;
  disableNavigation?: boolean;
}

/**
 * Layout simplifié - la navigation est maintenant gérée par AppShell
 * Ce composant communique avec AppShell via le contexte NavigationVisibility
 */
export const Layout = ({
  children,
  hideNavigation = false,
}: LayoutProps) => {
  useHideNavigation(hideNavigation);
  return <>{children}</>;
};
