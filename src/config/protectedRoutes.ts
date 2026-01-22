import Games from '@/pages/Games';
import Profile from '@/pages/Profile';
import ProfileEdit from '@/pages/ProfileEdit';
import Settings from '@/pages/Settings';
import SimpleMobileMenuPage from '@/pages/SimpleMobileMenuPage';
import CoinbaseDepositPage from '@/pages/CoinbaseDepositPage';
import CoinbaseCashOutPage from '@/pages/CoinbaseCashOutPage';
import CoinbaseOnrampCallbackPage from '@/pages/CoinbaseOnrampCallbackPage';
import CoinbaseOfframpCallbackPage from '@/pages/CoinbaseOfframpCallbackPage';
import TransactionsPage from '@/pages/TransactionsPage';
import { NotificationsPage } from '@/features/notifications';
import SearchPage from '@/pages/SearchPage';
import UserProfile from '@/pages/UserProfile';
import SmsVerification from '@/pages/SmsVerificationPage';
import SettingsSmsVerificationPage from '@/pages/SettingsSmsVerificationPage';
import { PinSettingsPage, PinChallengePage, PinEntryPage } from '@/features/security';
import UnifiedDepositPage from '@/pages/UnifiedDepositPage';
import UnifiedWithdrawPage from '@/pages/UnifiedWithdrawPage';
import ReceivePage from '@/pages/ReceivePage';
import Wallet from '@/pages/Wallet';
import { LudoGamesPage } from '@/features/ludo';
import MessagesPage from '@/pages/MessagesPage';
import { PryzenCardPage } from '@/features/nft';
import MyGamesPage from '@/pages/MyGamesPage';
import { TournamentCreatePage } from '@/features/tournaments';

export interface ProtectedRoute {
  path: string;
  component: React.ComponentType;
}

export const protectedRoutes: ProtectedRoute[] = [
  // Games - Ludo focused
  { path: '/games', component: Games },
  { path: '/games/ludo', component: LudoGamesPage },
  { path: '/my-games', component: MyGamesPage },
  
  // User profile
  { path: '/user/:username', component: UserProfile },
  { path: '/profile', component: Profile },
  { path: '/profile/edit', component: ProfileEdit },
  
  // Settings
  { path: '/settings', component: Settings },
  { path: '/settings/pin', component: PinSettingsPage },
  { path: '/security/verify', component: PinChallengePage },
  { path: '/security/pin-entry', component: PinEntryPage },
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
  { path: '/deposit/coinbase', component: CoinbaseDepositPage },
  { path: '/deposit/coinbase/callback', component: CoinbaseOnrampCallbackPage },
  { path: '/withdrawal', component: UnifiedWithdrawPage },
  { path: '/withdrawal/coinbase-cashout', component: CoinbaseCashOutPage },
  { path: '/withdrawal/coinbase/callback', component: CoinbaseOfframpCallbackPage },
  { path: '/receive', component: ReceivePage },
  { path: '/transactions', component: TransactionsPage },
  
  // Search
  { path: '/search', component: SearchPage },
  
  // NFT
  { path: '/pryzen-card', component: PryzenCardPage },
  
  // Tournaments
  { path: '/tournaments/create', component: TournamentCreatePage },
];
