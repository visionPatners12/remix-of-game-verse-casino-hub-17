import Dashboard from '@/pages/Dashboard';
import CreatePostPage from '@/pages/CreatePostPage';
import Games from '@/pages/Games';



import Profile from '@/pages/Profile';
import ProfileEdit from '@/pages/ProfileEdit';
import TipsterSetup from '@/pages/TipsterSetup';
import TipsterDashboard from '@/pages/TipsterDashboard';
import Settings from '@/pages/Settings';

import CreateLivePage from '@/pages/CreateLivePage';

import TicketSlipPage from '@/pages/TicketSlipPage';

import SimpleMobileMenuPage from '@/pages/SimpleMobileMenuPage';
import MobileDepositPage from '@/pages/MobileDepositPage';
import CoinbaseDepositPage from '@/pages/CoinbaseDepositPage';

import TransactionsPage from '@/pages/TransactionsPage';
import BetHistoryPage from '@/pages/BetHistoryPage';
import { NotificationsPage } from '@/features/notifications';
import PostDetail from '@/pages/PostDetail';


import SearchPage from '@/pages/SearchPage';
import UserProfile from '@/pages/UserProfile';
import TeamPage from '@/pages/TeamPage';
import TipsterLeaderboardPage from '@/pages/TipsterLeaderboardPage';
import { LeaguePage } from '@/pages/LeaguePage';
import SmsVerification from '@/pages/SmsVerificationPage';
import SettingsSmsVerificationPage from '@/pages/SettingsSmsVerificationPage';
import { PinSettingsPage } from '@/features/security';
import UnifiedDepositPage from '@/pages/UnifiedDepositPage';
import UnifiedWithdrawPage from '@/pages/UnifiedWithdrawPage';
import Wallet from '@/pages/Wallet';
import { LudoGamesPage } from '@/features/ludo';
import SelectSportPage from '@/features/create-post/pages/SelectSportPage';
import SelectLeaguePage from '@/features/create-post/pages/SelectLeaguePage';
import SelectMatchPage from '@/features/create-post/pages/SelectMatchPage';
import SelectOddsPage from '@/features/create-post/pages/SelectOddsPage';
import MessagesPage from '@/pages/MessagesPage';
import { PryzenCardPage } from '@/features/nft';
import UserDashboard from '@/pages/UserDashboard';

export interface ProtectedRoute {
  path: string;
  component: React.ComponentType;
}

export const protectedRoutes: ProtectedRoute[] = [
  { path: '/dashboard', component: Dashboard },
  { path: '/post/:postId', component: PostDetail },
  { path: '/create-post', component: CreatePostPage },
  { path: '/create-post/select-sport', component: SelectSportPage },
  { path: '/create-post/select-league', component: SelectLeaguePage },
  { path: '/create-post/select-match', component: SelectMatchPage },
  { path: '/create-post/select-odds', component: SelectOddsPage },
  { path: '/games', component: Games },
  { path: '/games/ludo', component: LudoGamesPage },
  
  // Sports and Match routes moved to public for SEO
  
  { path: '/ticket-slip', component: TicketSlipPage },
  
  { path: '/ticket-slip', component: TicketSlipPage },
  
  { path: '/user/:username', component: UserProfile },
  { path: '/profile', component: Profile },
  { path: '/profile/edit', component: ProfileEdit },
  { path: '/tipster/setup', component: TipsterSetup },
  { path: '/tipster/dashboard', component: TipsterDashboard },
  { path: '/settings', component: Settings },
  { path: '/settings/pin', component: PinSettingsPage },
  { path: '/settings/sms-verification', component: SettingsSmsVerificationPage },
  { path: '/sms-verification', component: SmsVerification },
  { path: '/notifications', component: NotificationsPage },
  { path: '/mobile-menu', component: SimpleMobileMenuPage },
  { path: '/wallet', component: Wallet },
  { path: '/deposit', component: UnifiedDepositPage },
  { path: '/mobile-deposit', component: MobileDepositPage },
  { path: '/deposit/coinbase', component: CoinbaseDepositPage },
  { path: '/withdrawal', component: UnifiedWithdrawPage },
  { path: '/transactions', component: TransactionsPage },
  { path: '/my-bets', component: BetHistoryPage },
  
  
  { path: '/progression', component: Dashboard },
  { path: '/live/create', component: CreateLivePage },
  
  { path: '/search', component: SearchPage },
  
  
  { path: '/tipster-leaderboard', component: TipsterLeaderboardPage },
  { path: '/messages', component: MessagesPage },
  { path: '/pryzen-card', component: PryzenCardPage },
  { path: '/user-dashboard', component: UserDashboard },
];
