import React from 'react';
import { Button, Badge } from '@/ui';
import { Filter, X, Users, FileText, Newspaper, Calendar, MapPin, TrendingUp } from 'lucide-react';
import type { SearchFilters as SearchFiltersType, ActiveFilter, FilterOption } from '../types';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const TYPE_OPTIONS: FilterOption[] = [
  { label: 'All', value: 'all', icon: 'Filter' },
  { label: 'Users', value: 'user', icon: 'Users' },
  { label: 'Posts', value: 'post', icon: 'FileText' },
  { label: 'News', value: 'news', icon: 'Newspaper' }
];

const DATE_OPTIONS: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'day' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'This year', value: 'year' }
];

const SORT_OPTIONS: FilterOption[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Most recent', value: 'recent' },
  { label: 'Popular', value: 'popular' },
  { label: 'Followers', value: 'followers' }
];

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  className,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const getActiveFilters = (): ActiveFilter[] => {
    const active: ActiveFilter[] = [];
    
    if (filters.type && filters.type !== 'all') {
      const option = TYPE_OPTIONS.find(opt => opt.value === filters.type);
      if (option) {
        active.push({ key: 'type', value: filters.type, label: option.label });
      }
    }
    
    if (filters.dateRange && filters.dateRange !== 'all') {
      const option = DATE_OPTIONS.find(opt => opt.value === filters.dateRange);
      if (option) {
        active.push({ key: 'dateRange', value: filters.dateRange, label: option.label });
      }
    }
    
    if (filters.verified) {
      active.push({ key: 'verified', value: true, label: 'Verified' });
    }
    
    if (filters.hasImage) {
      active.push({ key: 'hasImage', value: true, label: 'With image' });
    }
    
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      const option = SORT_OPTIONS.find(opt => opt.value === filters.sortBy);
      if (option) {
        active.push({ key: 'sortBy', value: filters.sortBy, label: option.label });
      }
    }
    
    return active;
  };

  const updateFilter = <K extends keyof SearchFiltersType>(
    key: K, 
    value: SearchFiltersType[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (filterKey: keyof SearchFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={cn("bg-card/30 rounded-xl border border-border/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filtres</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {activeFilters.length}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-1"
            >
              <Filter className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          )}
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="p-4 border-b border-border/30">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge
                key={`${filter.key}-${index}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.key)}
                  className="hover:bg-muted/50 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter options */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Type filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Content type
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.type === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('type', option.value as any)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date range filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Period
            </label>
            <div className="flex flex-wrap gap-2">
              {DATE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.dateRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('dateRange', option.value as any)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort by */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Sort by
            </label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('sortBy', option.value as any)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional options */}
          <div className="space-y-2">
            <Button
              variant={filters.verified ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('verified', !filters.verified)}
              className="text-xs w-full justify-start"
            >
              Verified users only
            </Button>
            
            <Button
              variant={filters.hasImage ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('hasImage', !filters.hasImage)}
              className="text-xs w-full justify-start"
            >
              Content with images
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFiltersComponent;