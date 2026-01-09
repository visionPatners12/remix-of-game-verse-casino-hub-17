import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback, Button, Progress, Badge } from '@/ui';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/ui';
import { 
  Copy, 
  ChevronDown,
  ChevronRight,
  Bell, 
  MessageSquare, 
  User,
  BarChart3,
  Globe,
  LogOut,
  Headphones,
  HelpCircle,
  Scale,
  History,
  Ticket,
  Wallet,
  ArrowLeftRight,
  Settings,
  Images
} from 'lucide-react';
import { TokenIcon } from '@web3icons/react/dynamic';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { useUnifiedWallet } from '@/features/wallet';
import { useWalletTokensThirdWeb } from '@/features/wallet/hooks/tokens/useWalletTokensThirdWeb';
import { useUserProfile } from '@/features/profile';

import { SoonOverlay } from '@/ui';

interface WebProfileMenuProps {
  user: {
    user_metadata?: {
      username?: string;
      avatar_url?: string;
    };
    email?: string;
    balance: {
      real: number;
      bonus: number;
    };
  } | null;
  onLogout: () => void;
}

export const WebProfileMenu = ({ user, onLogout }: WebProfileMenuProps) => {
  const navigate = useNavigate();
  const { receivedRequests } = useFollowRequests();
  const { handleNavigation } = useMobileMenu();
  const { address } = useUnifiedWallet();
  const { totalValue: usdtBalance = 0, isLoading: isBalanceLoading } = useWalletTokensThirdWeb();
  const { profile } = useUserProfile();

  // Mock data
  const notificationCount = receivedRequests.length;
  const messageCount = 3;

  // Use USDT balance as total balance (optimized for cache)
  const totalBalance = usdtBalance;
  const balance = totalBalance > 0 ? `$${totalBalance.toFixed(2)}` : '$0.00';

  const handleNavigationAndClose = (path: string) => {
    if (path === 'logout') {
      onLogout();
    } else {
      handleNavigation(path);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-3 p-2 rounded-xl bg-card/50 border border-border/50 hover:bg-card/80 hover:border-border transition-all duration-200 backdrop-blur-sm">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url} alt={`${profile?.first_name} ${profile?.last_name}` || 'Avatar'} />
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground">
                {profile?.first_name?.slice(0, 1).toUpperCase()}{profile?.last_name?.slice(0, 1).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-semibold text-sm text-foreground">{profile?.first_name} {profile?.last_name}</div>
            <div className="text-xs text-muted-foreground">@{profile?.username}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-1" align="end" sideOffset={8}>
        {/* User Header - Compact */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile?.avatar_url} alt={`${profile?.first_name} ${profile?.last_name}` || 'Avatar'} />
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground">
                  {profile?.first_name?.slice(0, 1).toUpperCase()}{profile?.last_name?.slice(0, 1).toUpperCase() || 'US'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground truncate">{profile?.first_name} {profile?.last_name}</div>
              <div className="text-xs text-muted-foreground truncate">@{profile?.username}</div>
            </div>
            <Badge variant="outline" className="text-xs px-2 py-1 bg-primary/10 border-primary/20 text-primary font-medium">
              VIP 0
            </Badge>
          </div>
        </div>

        {/* Balance Display - Enhanced with Web3 Icon */}
        <div className="p-3 border-b border-border">
          <button 
            onClick={() => handleNavigationAndClose('/wallet')}
            className="w-full flex items-center justify-between mb-3 group hover:bg-muted/20 -m-1 p-2 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <span className="text-xs font-medium text-muted-foreground">Total Balance</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {isBalanceLoading ? (
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  balance
                )}
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 h-7 text-xs" 
              onClick={() => handleNavigationAndClose('/deposit')}
            >
              Deposit
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-7 text-xs" 
              onClick={() => handleNavigationAndClose('/withdrawal')}
            >
              Withdraw
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="py-1">
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/wallet')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <Wallet className="w-4 h-4 mr-3 text-primary" />
            <span className="font-medium">Wallet</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/transactions')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 mr-3 text-secondary" />
            <span className="font-medium">Transactions</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/my-bets')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <History className="w-4 h-4 mr-3 text-accent" />
            <span className="font-medium">My Bets</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/pryzen-card')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <Images className="w-4 h-4 mr-3 text-purple-500" />
            <span className="font-medium">My Pryze</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Profile & Dashboard */}
        <div className="py-1">
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/profile')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <User className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-medium">My Profile</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Communication */}
        <div className="py-1">
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/notifications')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <Bell className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-medium">Notifications</span>
            {notificationCount > 0 && (
              <div className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold leading-none">
                {notificationCount}
              </div>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/messages')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-medium">Messages</span>
            {messageCount > 0 && (
              <div className="ml-auto bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold leading-none">
                {messageCount}
              </div>
            )}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Settings */}
        <div className="py-1">
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/settings')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-medium">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center px-3 py-2">
            <Globe className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-medium">Language</span>
            <span className="ml-auto text-xs text-muted-foreground">EN</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigationAndClose('/support')}
            className="flex items-center px-3 py-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="font-medium">Support</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="p-2">
          <Button 
            onClick={onLogout} 
            variant="destructive" 
            size="sm"
            className="w-full h-8 text-xs font-medium"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};