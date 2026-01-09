import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { tipsterQueries, subscriptionQueries } from '@/services/database';
import { TipsterProfile, TipsterDashboardStats, TipsterSubscriber } from '../types';

// Mock performance data - will be replaced with real data later
const recentPerformance = [
  { period: 'Aujourd\'hui', tips: 3, won: 2, rate: 67 },
  { period: 'Cette semaine', tips: 12, won: 9, rate: 75 },
  { period: 'Ce mois', tips: 48, won: 34, rate: 71 },
  { period: 'Total', tips: 127, won: 89, rate: 70 }
];

// Helper function to calculate last activity
function calculateLastActivity(updatedAt: string): string {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}j`;
}

// Helper function to calculate total revenue
function calculateTotalRevenue(subscriptions: any[], monthlyPrice: number): number {
  // For each active subscription, calculate number of full months since subscription_start
  const totalMonths = subscriptions.reduce((acc, sub) => {
    const start = new Date(sub.subscription_start);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + 
                       (now.getMonth() - start.getMonth());
    return acc + Math.max(1, monthsDiff); // At least 1 month
  }, 0);

  return totalMonths * monthlyPrice;
}

export function useTipsterDashboard() {
  const { user } = useAuth();
  const [tipsterProfile, setTipsterProfile] = useState<TipsterProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<TipsterDashboardStats | null>(null);
  const [subscribers, setSubscribers] = useState<TipsterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        // 1. Load tipster profile
        const { data: profile, error: profileError } = await tipsterQueries.getTipsterProfile(user.id);
        
        if (profileError || !profile) {
          setError('Profil tipster non trouvé');
          return;
        }

        setTipsterProfile(profile);

        // 2. Fetch real subscribers with user data
        const { data: subscriptionsData, error: subsError } = 
          await subscriptionQueries.getTipsterSubscribersWithUserData(profile.id);

        if (subsError) {
          console.error('Erreur lors du chargement des abonnés:', subsError);
        }

        // 3. Transform data for UI
        const transformedSubscribers: TipsterSubscriber[] = subscriptionsData?.map(sub => {
          const userData = sub.subscriber;
          
          return {
            id: sub.id,
            name: userData?.first_name && userData?.last_name 
              ? `${userData.first_name} ${userData.last_name}`
              : userData?.username || 'Utilisateur',
            username: userData?.username || '',
            avatar: userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.subscriber_id}`,
            subscriptionDate: sub.subscription_start,
            status: sub.status as 'active' | 'inactive' | 'expired',
            lastActivity: calculateLastActivity(sub.updated_at),
            totalBets: 0, // Mock temporarily
            wonBets: 0    // Mock temporarily
          };
        }) || [];

        // 4. Calculate real revenues
        const monthlyRevenue = profile.monthly_price * transformedSubscribers.length;
        const totalRevenue = calculateTotalRevenue(subscriptionsData || [], profile.monthly_price);

        // 5. Calculate dashboard stats
        const winRate = profile.tips_total ? 
          ((profile.tips_won || 0) / profile.tips_total * 100) : 0;
        
        const stats: TipsterDashboardStats = {
          totalRevenue,
          monthlyRevenue,
          subscriberCount: transformedSubscribers.length,
          winRate: parseFloat(winRate.toFixed(1)),
          totalTips: profile.tips_total || 0,
          activeTips: 5, // Mock temporarily
          recentPerformance // Mock temporarily
        };

        setDashboardStats(stats);
        setSubscribers(transformedSubscribers);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  return {
    tipsterProfile,
    dashboardStats,
    subscribers,
    isLoading,
    error,
    setTipsterProfile
  };
}