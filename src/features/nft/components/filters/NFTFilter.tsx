import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NFTFilterProps {
  filterBy: string;
  onFilterChange: (filter: string) => void;
}

export function NFTFilter({ filterBy, onFilterChange }: NFTFilterProps) {
  const filters = [
    { value: 'all', label: 'All NFTs' },
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
    { value: 'auction', label: 'On Auction' },
    { value: 'legendary', label: 'Legendary' },
    { value: 'epic', label: 'Epic' },
    { value: 'rare', label: 'Rare' },
    { value: 'common', label: 'Common' },
  ];

  const currentFilter = filters.find(f => f.value === filterBy);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          {currentFilter?.label || 'Filter'}
          {filterBy !== 'all' && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
              1
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {filters.map((filter) => (
          <DropdownMenuItem
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`cursor-pointer ${
              filterBy === filter.value ? 'bg-muted' : ''
            }`}
          >
            {filter.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}