import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TipsterStats, LeaderboardFilters, SortField, SortDirection } from '../types';
import { useLeaderboardData, TimeFrame } from './useLeaderboardData';
import { logger } from '@/utils/logger';

export function useTipsterLeaderboard(timeframe: TimeFrame = 'all') {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<LeaderboardFilters>({
    searchTerm: '',
    sortBy: 'yield',
    sortDirection: 'desc',
    selectedSport: 'all'
  });

  // Pass selectedSport for server-side filtering
  const { data: tipsters = [], isLoading, error } = useLeaderboardData(timeframe, filters.selectedSport);

  const handleSort = (field: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleSearch = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const handleSportChange = (sportId: string) => {
    setFilters(prev => ({ ...prev, selectedSport: sportId }));
    logger.debug('Sport sélectionné:', sportId);
  };

  const filteredAndSortedTipsters = useMemo(() => {
    return tipsters
      .filter(tipster =>
        tipster.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'yield':
            comparison = b.yield - a.yield;
            break;
          case 'tips':
            comparison = b.wins - a.wins;
            break;
          case 'avgOdds':
            comparison = b.avgOdds - a.avgOdds;
            break;
          case 'form':
            const aWins = a.form.filter(f => f === 'W').length;
            const bWins = b.form.filter(f => f === 'W').length;
            comparison = bWins - aWins;
            break;
          case 'openTips':
            comparison = b.openTips - a.openTips;
            break;
          case 'winRate':
            comparison = b.winRate - a.winRate;
            break;
          default:
            comparison = a.rank - b.rank;
        }
        return filters.sortDirection === 'desc' ? comparison : -comparison;
      });
  }, [tipsters, filters]);

  const handleTipsterClick = (tipster: TipsterStats) => {
    navigate(`/user/${tipster.username}`);
  };

  return {
    filters,
    filteredAndSortedTipsters,
    handleSort,
    handleSearch,
    handleSportChange,
    handleTipsterClick,
    isLoading,
    error
  };
}