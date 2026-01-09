
import { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode; // Made optional
  badge?: number | string;
  highlight?: boolean;
  comingSoon?: boolean;
}

export interface UserQuickMenuProps {
  user: {
    name: string;
    avatar: string;
    balance?: {
      real: number;
      bonus: number;
    };
  };
  onLogout: () => void;
  isInGameRoom?: boolean;
  onClose?: () => void;
}
