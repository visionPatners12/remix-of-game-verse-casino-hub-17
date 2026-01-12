import Games from '@/pages/Games';
import Profile from '@/pages/Profile';
import ProfileEdit from '@/pages/ProfileEdit';
import Settings from '@/pages/Settings';
import SimpleMobileMenuPage from '@/pages/SimpleMobileMenuPage';
import MobileDepositPage from '@/pages/MobileDepositPage';
import CoinbaseDepositPage from '@/pages/CoinbaseDepositPage';
import TransactionsPage from '@/pages/TransactionsPage';
import { NotificationsPage } from '@/features/notifications';
import SearchPage from '@/pages/SearchPage';
import UserProfile from '@/pages/UserProfile';
import SmsVerification from '@/pages/SmsVerificationPage';
import SettingsSmsVerificationPage from '@/pages/SettingsSmsVerificationPage';
import { PinSettingsPage } from '@/features/security';
import UnifiedDepositPage from '@/pages/UnifiedDepositPage';
import UnifiedWithdrawPage from '@/pages/UnifiedWithdrawPage';
import Wallet from '@/pages/Wallet';
import { LudoGamesPage } from '@/features/ludo';
import MessagesPage from '@/pages/MessagesPage';
import { PryzenCardPage } from '@/features/nft';

export interface ProtectedRoute {
  path: string;
  component: React.ComponentType;
}

export const protectedRoutes: ProtectedRoute[] = [
  // Games - Ludo focused
  { path: '/games', component: Games },
  { path: '/games/ludo', component: LudoGamesPage },
  
  // User profile
  { path: '/user/:username', component: UserProfile },
  { path: '/profile', component: Profile },
  { path: '/profile/edit', component: ProfileEdit },
  
  // Settings
  { path: '/settings', component: Settings },
  { path: '/settings/pin', component: PinSettingsPage },
  { path: '/settings/sms-verification', component: SettingsSmsVerificationPage },
  { path: '/sms-verification', component: SmsVerification },
  
  // Notifications & Messages
  { path: '/notifications', component: NotificationsPage },
  { path: '/messages', component: MessagesPage },
  
  // Mobile & Navigation
  { path: '/mobile-menu', component: SimpleMobileMenuPage },
  
  // Wallet & Finances
  { path: '/wallet', component: Wallet },
  { path: '/deposit', component: UnifiedDepositPage },
  { path: '/mobile-deposit', component: MobileDepositPage },
  { path: '/deposit/coinbase', component: CoinbaseDepositPage },
  { path: '/withdrawal', component: UnifiedWithdrawPage },
  { path: '/transactions', component: TransactionsPage },
  
  // Search
  { path: '/search', component: SearchPage },
  
  // NFT
  { path: '/pryzen-card', component: PryzenCardPage },
];
