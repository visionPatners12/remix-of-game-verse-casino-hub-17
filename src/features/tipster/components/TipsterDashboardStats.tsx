import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';
import { TipsterDashboardStats as StatsType } from '../types';

interface TipsterDashboardStatsProps {
  stats: StatsType;
  monthlyGoal?: number;
}

export function TipsterDashboardStats({ stats, monthlyGoal = 1000 }: TipsterDashboardStatsProps) {
  const goalProgress = (stats.monthlyRevenue / monthlyGoal) * 100;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-r from-card to-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Main Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-colors duration-200 group">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <p className="text-lg font-bold text-foreground">€{stats.monthlyRevenue}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-colors duration-200 group">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.subscriberCount}</p>
            <p className="text-xs text-muted-foreground">Subscribers</p>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10 hover:from-purple-500/20 hover:to-violet-500/20 transition-colors duration-200 group">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 transition-colors duration-200 group">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.activeTips}</p>
            <p className="text-xs text-muted-foreground">Active Tips</p>
          </div>
        </div>
        
        {/* Progress bar for monthly goal */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Monthly goal: €{monthlyGoal}</span>
            <span className="font-medium">{Math.round(goalProgress)}%</span>
          </div>
          <Progress value={goalProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}