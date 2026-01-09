import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, User } from 'lucide-react';
import { getTeamPlayers, parsePlayerProfile } from '@/services/playersService';

interface TeamStaffProps {
  teamId: string;
}

interface Player {
  id: number;
  name: string;
  age: number;
  number: number;
  position: string;
  photo: string;
}

interface Coach {
  name: string;
  photo?: string;
  nationality?: string;
}

export function TeamStaff({ teamId }: TeamStaffProps) {
  const { t } = useTranslation('pages');
  const navigate = useNavigate();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [squad, setSquad] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Map position to translation key
  const getPositionLabel = (position: string): string => {
    const positionMap: Record<string, string> = {
      'Attacker': t('team.staff.attacker'),
      'Midfielder': t('team.staff.midfielder'),
      'Defender': t('team.staff.defender'),
      'Goalkeeper': t('team.staff.goalkeeper'),
    };
    return positionMap[position] || position;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) return;
      
      try {
        setLoading(true);
        const playersData = await getTeamPlayers(teamId);
        
        // Transform players data to match Player interface
        const transformedSquad = playersData.map((player) => {
          const profileData = parsePlayerProfile(player.profile);
          return {
            id: player.id,
            name: player.full_name,
            age: profileData?.age || 0,
            number: profileData?.number || 0,
            position: profileData?.position || t('team.staff.unknown'),
            photo: player.logo || profileData?.photo || '',
          };
        });
        
        setSquad(transformedSquad);
      } catch (error) {
        console.error('Error loading team staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, t]);

  // Group players by position
  const groupedPlayers = squad.reduce((acc, player) => {
    const position = player.position || t('team.staff.unknown');
    if (!acc[position]) acc[position] = [];
    acc[position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  const positionOrder = ['Attacker', 'Midfielder', 'Defender', 'Goalkeeper'];
  const sortedPositions = Object.keys(groupedPlayers).sort((a, b) => {
    const aIndex = positionOrder.indexOf(a);
    const bIndex = positionOrder.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  if (loading) {
    return (
      <div className="w-full">
        {/* Coach skeleton */}
        <div className="px-4 py-3 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted animate-pulse rounded w-32" />
              <div className="h-3 bg-muted animate-pulse rounded w-24" />
            </div>
          </div>
        </div>
        <div className="h-px bg-border" />
        
        {/* Squad skeleton */}
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className="px-4 py-2 bg-muted/30">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
            </div>
            <div>
              {[1, 2, 3].map((j) => (
                <React.Fragment key={j}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted animate-pulse rounded w-40" />
                    </div>
                  </div>
                  {j < 3 && <div className="h-px bg-border/50 mx-4" />}
                </React.Fragment>
              ))}
            </div>
            {i < 3 && <div className="h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Coach Section */}
      {coach && (
        <>
          <div className="px-4 py-3 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                {coach.photo ? (
                  <img 
                    src={coach.photo} 
                    alt={coach.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) nextElement.style.display = 'flex';
                    }}
                  />
                ) : (
                  <Trophy className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{coach.name}</h3>
                <p className="text-primary font-medium text-xs">{t('team.staff.headCoach')}</p>
                <p className="text-xs text-muted-foreground">
                  {coach.nationality}
                </p>
              </div>
            </div>
          </div>
          <div className="h-px bg-border" />
        </>
      )}

      {/* Squad Section */}
      {sortedPositions.length > 0 ? (
        sortedPositions.map((position, posIndex) => (
          <React.Fragment key={position}>
            <div className="px-4 py-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">{getPositionLabel(position)}</h4>
                <span className="text-xs text-muted-foreground">
                  ({groupedPlayers[position].length})
                </span>
              </div>
            </div>
            
            <div>
              {groupedPlayers[position].map((player, index) => (
                <React.Fragment key={index}>
                  <div 
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/player/${player.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/player/${player.id}`)}
                    aria-label={`View ${player.name}'s profile`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {player.photo ? (
                        <img 
                          src={player.photo} 
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) nextElement.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {player.number > 0 && (
                          <span className="text-xs font-bold text-muted-foreground w-6">
                            {player.number}
                          </span>
                        )}
                        <p className="font-medium text-sm truncate">{player.name}</p>
                      </div>
                    </div>
                  </div>
                  {index < groupedPlayers[position].length - 1 && (
                    <div className="h-px bg-border/50 mx-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {posIndex < sortedPositions.length - 1 && (
              <div className="h-px bg-border" />
            )}
          </React.Fragment>
        ))
      ) : (
        <div className="px-4 py-8 text-center">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{t('team.staff.noPlayers')}</p>
        </div>
      )}
    </div>
  );
}
