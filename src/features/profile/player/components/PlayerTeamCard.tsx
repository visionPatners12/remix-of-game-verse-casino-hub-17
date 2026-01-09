import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlayerTeam } from '../types/player';
import { ChevronRight } from 'lucide-react';

interface PlayerTeamCardProps {
  team: PlayerTeam | null | undefined;
}

export function PlayerTeamCard({ team }: PlayerTeamCardProps) {
  const navigate = useNavigate();
  
  if (!team) return null;
  
  return (
    <Card className="group hover:bg-muted/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 rounded-lg">
            <AvatarImage src={team.logo || undefined} alt={team.name} className="object-contain p-1" />
            <AvatarFallback className="rounded-lg text-lg font-bold bg-primary/10 text-primary">
              {team.abbreviation || team.name.substring(0, 3).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {team.displayName || team.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {team.league}
              </Badge>
              {team.abbreviation && (
                <span className="text-xs text-muted-foreground">{team.abbreviation}</span>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
