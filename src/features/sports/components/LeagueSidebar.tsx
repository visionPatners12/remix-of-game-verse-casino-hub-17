import React from "react";
import { Card, CardContent, Badge } from '@/ui';
import { CountryFlag } from "@/components/ui/country-flag";
import { shortenCountryName } from "@/features/sports/utils/countryNameUtils";
import type { LeagueSidebarProps } from "@/features/sports/types";

export function LeagueSidebar({ leagues, selectedLeagueId, onLeagueSelect, totalMatches }: LeagueSidebarProps) {
  const handleSelectAll = () => onLeagueSelect(null);

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <Card className="h-full border-border/20">
        <CardContent className="p-3 h-full flex flex-col">
          <h3 className="font-semibold mb-3 text-sm">Leagues</h3>
          
          <div 
            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors mb-1 ${
              selectedLeagueId === null ? 'bg-primary/10 border border-primary/20' : ''
            }`}
            onClick={handleSelectAll}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">ALL</span>
            </div>
            <span className="text-xs font-medium flex-1 truncate">All leagues</span>
            <Badge variant="secondary" className="ml-auto text-[10px] px-1 py-0 shrink-0">
              {totalMatches}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {leagues?.map((league) => {
              const shortCountryName = shortenCountryName(league.country_name || '');
              
              return (
                <div
                  key={league.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedLeagueId === league.id ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                  onClick={() => onLeagueSelect(league.id)}
                  title={`${league.country_name || ''} - ${league.name}`}
                >
                  <div className="w-6 h-6">
                    <CountryFlag 
                      countryName={league.country_name || league.name}
                      countrySlug={league.country_slug || league.slug}
                      size={20}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {league.country_name && league.country_name !== league.name ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                          {shortCountryName}
                        </span>
                        <span className="text-xs font-medium truncate leading-tight">
                          {league.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium truncate">
                        {league.name}
                      </span>
                    )}
                  </div>
                  
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 shrink-0">
                    {league.activeGamesCount}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
