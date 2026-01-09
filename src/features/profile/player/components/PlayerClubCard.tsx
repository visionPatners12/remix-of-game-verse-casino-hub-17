import { FootballClub } from '../types/player';
import { Calendar, FileText } from 'lucide-react';

interface PlayerClubCardProps {
  club: FootballClub;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Handle DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  
  return dateStr;
}

export function PlayerClubCard({ club }: PlayerClubCardProps) {
  if (!club || !club.current) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-foreground">{club.current}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 text-sm">
        {club.joinedAt && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Joined {formatDate(club.joinedAt)}</span>
          </div>
        )}
        
        {club.contractExpiry && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>Until {formatDate(club.contractExpiry)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
