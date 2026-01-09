import React, { useState, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Search } from 'lucide-react';
import type { IGif } from '@giphy/js-types';
import { cn } from '@/lib/utils';

// GIPHY API key
const GIPHY_API_KEY = 'fLXE1K06xR1uQcKXx7YlGUCPYbP4sLJs';
const gf = new GiphyFetch(GIPHY_API_KEY);

export interface GifData {
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  alt?: string;
}

interface GifPickerProps {
  onSelect: (gif: GifData) => void;
  disabled?: boolean;
  className?: string;
}

export function GifPicker({ onSelect, disabled, className }: GifPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchKey, setSearchKey] = useState('');

  // Fetch GIFs - trending or search
  const fetchGifs = useCallback(
    (offset: number) => {
      if (searchKey.trim()) {
        return gf.search(searchKey, { offset, limit: 10 });
      }
      return gf.trending({ offset, limit: 10 });
    },
    [searchKey]
  );

  // Handle search on Enter key
  const handleSearch = useCallback(() => {
    setSearchKey(search);
  }, [search]);

  // Handle GIF selection
  const handleGifClick = (gif: IGif, e: React.SyntheticEvent) => {
    e.preventDefault();
    const gifData: GifData = {
      url: gif.images.original.url,
      previewUrl: gif.images.fixed_width_small?.url || gif.images.preview_gif?.url || gif.images.original.url,
      width: gif.images.original.width,
      height: gif.images.original.height,
      alt: gif.title || 'GIF',
    };
    onSelect(gifData);
    setOpen(false);
    setSearch('');
    setSearchKey('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled}
          className={cn(
            "h-7 w-7 text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <span className="text-xs font-bold">GIF</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 z-[99999]" 
        align="end"
        side="top"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={16}
      >
        {/* Search bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search GIFs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8 h-9"
              autoFocus
            />
          </div>
        </div>

        {/* GIPHY Grid with built-in infinite scroll */}
        <div className="h-64 overflow-y-auto">
          <Grid
            key={searchKey}
            width={304}
            columns={2}
            fetchGifs={fetchGifs}
            onGifClick={handleGifClick}
            noLink={true}
            hideAttribution={true}
          />
        </div>

        {/* GIPHY attribution (required by guidelines) */}
        <div className="p-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            Powered by GIPHY
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
