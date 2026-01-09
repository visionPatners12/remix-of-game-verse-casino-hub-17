import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { tipsterMutations } from '@/services/database';
import { 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Percent,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTipsterDashboard } from '@/features/tipster/hooks';
import { useTipsterRealStats } from '@/features/tipster/hooks/useTipsterRealStats';
import { PremiumTipsFeedController } from '@/features/tipster/components';
import { cn } from '@/lib/utils';

const TipsterDashboard = () => {
  const { t } = useTranslation('tipster');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tipsterProfile, dashboardStats, subscribers, isLoading: profileLoading, error } = useTipsterDashboard();
  const { stats, recentSelections, isLoading: statsLoading } = useTipsterRealStats();
  const [isUpdating, setIsUpdating] = useState(false);
  const isMobile = useIsMobile();

  const isLoading = profileLoading || statsLoading;

  // Redirect if no profile found
  useEffect(() => {
    if (!profileLoading && error) {
      navigate('/tipster/setup');
    }
  }, [profileLoading, error, navigate]);

  const handleToggleStatus = async () => {
    if (!tipsterProfile || !user?.id) return;
    
    setIsUpdating(true);
    try {
      const { error } = await tipsterMutations.toggleTipsterStatus(user.id, !tipsterProfile.is_active);
      if (error) throw error;

      toast({
        title: tipsterProfile.is_active ? t('dashboard.toast.deactivated') : t('dashboard.toast.activated'),
        description: tipsterProfile.is_active 
          ? t('dashboard.toast.notVisiblePublicly')
          : t('dashboard.toast.visiblePublicly')
      });
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: t('dashboard.toast.error'),
        description: t('dashboard.toast.statusError'),
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Parse form string to array
  const formArray = stats?.form?.split('').slice(-10) || [];

  if (isLoading) {
    return (
      <Layout hideNavigation={isMobile}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!tipsterProfile) {
    return null;
  }

  return (
    <Layout hideNavigation={isMobile}>
      <div className="min-h-screen bg-background">
        <div 
          className="max-w-2xl mx-auto px-4 py-4 space-y-4"
          style={{ paddingTop: isMobile ? 'calc(1rem + env(safe-area-inset-top, 0px))' : '1rem' }}
        >
          
          {/* Soft Header - Mobile Optimized */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="shrink-0 rounded-full hover:bg-muted/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.user_metadata?.username?.charAt(0)?.toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-foreground truncate">
                  {user?.user_metadata?.username || 'Tipster'}
                </h1>
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs shrink-0",
                    tipsterProfile.is_active 
                      ? "border-green-500/50 text-green-600 bg-green-500/10" 
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {tipsterProfile.is_active ? t('dashboard.status.active') : t('dashboard.status.inactive')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{tipsterProfile.monthly_price} {t('dashboard.perMonth')}</p>
            </div>

            <Switch
              checked={tipsterProfile.is_active || false}
              onCheckedChange={handleToggleStatus}
              disabled={isUpdating}
              className="shrink-0"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-muted/50 rounded-xl p-1">
              <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-background">
                <BarChart3 className="w-4 h-4 mr-2" />
                {t('dashboard.tabs.stats')}
              </TabsTrigger>
              <TabsTrigger value="tips" className="rounded-lg data-[state=active]:bg-background">
                <Target className="w-4 h-4 mr-2" />
                {t('dashboard.tabs.fanzone')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-4 space-y-4">
              
              {/* Main Stats Grid - Soft Design */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-green-500/20">
                        <Percent className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-xs text-muted-foreground">{t('dashboard.stats.winRate')}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.winRate?.toFixed(1) || '0'}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.wins || 0}/{stats?.tips || 0} {t('dashboard.stats.won')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/20">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs text-muted-foreground">{t('dashboard.stats.yield')}</span>
                    </div>
                    <p className={cn(
                      "text-2xl font-bold",
                      (stats?.yield || 0) >= 0 ? "text-green-600" : "text-red-500"
                    )}>
                      {(stats?.yield || 0) >= 0 ? '+' : ''}{stats?.yield?.toFixed(1) || '0'}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('dashboard.stats.profit')}: {stats?.profit?.toFixed(2) || '0'}u
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/5 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/20">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-xs text-muted-foreground">{t('dashboard.stats.subscribers')}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {dashboardStats?.subscriberCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dashboardStats?.monthlyRevenue || 0} {t('dashboard.perMonth')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-orange-500/20">
                        <Target className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-xs text-muted-foreground">{t('dashboard.stats.avgOdds')}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.avgOdds?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.tipsOpen || 0} {t('dashboard.stats.tipsInProgress')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Form Streak */}
              {formArray.length > 0 && (
                <Card className="border-0 bg-muted/30 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">{t('dashboard.form.title')}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formArray.filter(f => f === 'W').length}/{formArray.length}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {formArray.map((result, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                            result === 'W' 
                              ? "bg-green-500/20 text-green-600" 
                              : "bg-red-500/20 text-red-500"
                          )}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Predictions */}
              <Card className="border-0 bg-muted/30 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">{t('dashboard.predictions.title')}</span>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                      {t('dashboard.predictions.viewAll')} <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {recentSelections.length > 0 ? (
                      recentSelections.slice(0, 5).map((selection) => (
                        <div 
                          key={selection.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            selection.isWon === true 
                              ? "bg-green-500/20" 
                              : selection.isWon === false 
                                ? "bg-red-500/20" 
                                : "bg-muted"
                          )}>
                            {selection.isWon === true ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : selection.isWon === false ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {selection.homeTeamName} vs {selection.awayTeamName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {selection.pick} • {selection.marketType}
                            </p>
                          </div>
                          
                          <Badge 
                            variant="outline" 
                            className="shrink-0 bg-background"
                          >
                            @{selection.odds.toFixed(2)}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t('dashboard.predictions.none')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Subscribers List */}
              {subscribers.length > 0 && (
                <Card className="border-0 bg-muted/30 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">{t('dashboard.subscribers.title')}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {subscribers.length} {t('dashboard.subscribers.active')}{subscribers.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {subscribers.slice(0, 5).map((subscriber) => (
                        <div 
                          key={subscriber.id}
                          className="flex items-center gap-3 p-2 rounded-xl bg-background/50"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={subscriber.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {subscriber.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {subscriber.name || subscriber.username || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('dashboard.subscribers.since')} {new Date(subscriber.subscriptionDate).toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </p>
                          </div>
                          
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs shrink-0",
                              subscriber.status === 'active' 
                                ? "border-green-500/50 text-green-600 bg-green-500/10" 
                                : "border-muted text-muted-foreground"
                            )}
                          >
                            {subscriber.status === 'active' ? t('dashboard.status.active') : subscriber.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </TabsContent>

            <TabsContent value="tips" className="mt-0">
              <PremiumTipsFeedController />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TipsterDashboard;
