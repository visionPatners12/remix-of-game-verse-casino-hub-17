import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamStaff } from '@/features/profile/team/components/TeamStaff';
import { getTeamIdFromSlug } from '@/services/teamService';

export function TeamStaffPage() {
  const { t } = useTranslation('pages');
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const navigate = useNavigate();
  const [teamId, setTeamId] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (teamSlug) {
      getTeamIdFromSlug(teamSlug)
        .then(id => {
          if (id) {
            setTeamId(id);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [teamSlug]);

  if (!teamSlug) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="bg-background px-4 py-3 border-b flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/team/${teamSlug}`, { state: { from: 'staff' } })}
          className="h-8 w-8 p-0"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-semibold text-foreground">{t('team.staff.title')}</h1>
      </div>

      {/* Staff content */}
      {teamId && <TeamStaff teamId={teamId} />}
    </div>
  );
}
