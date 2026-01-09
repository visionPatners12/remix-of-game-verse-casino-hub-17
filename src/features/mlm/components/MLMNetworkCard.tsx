import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp, Percent } from 'lucide-react';
import { useMLMNetwork, type NetworkLevel } from '../hooks';
import { Skeleton } from '@/components/ui/skeleton';

const LEVEL_COLORS = {
  1: 'bg-green-500/10 text-green-500 border-green-500/20',
  2: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  3: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const LEVEL_LABELS = {
  1: 'Niveau 1 (5%)',
  2: 'Niveau 2 (3%)',
  3: 'Niveau 3 (1%)',
};

function NetworkLevelCard({ level }: { level: NetworkLevel }) {
  const commission = level.net_margin * level.commission_rate;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={LEVEL_COLORS[level.level as 1 | 2 | 3]}
        >
          {LEVEL_LABELS[level.level as 1 | 2 | 3]}
        </Badge>
        <span className="text-sm font-medium">
          {level.referrals_count} filleul{level.referrals_count > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-muted/30 rounded-lg p-2">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Marge</p>
          <p className="text-sm font-semibold">${level.net_margin.toFixed(0)}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-2">
          <Percent className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Taux</p>
          <p className="text-sm font-semibold">
            {(level.commission_rate * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-primary/10 rounded-lg p-2">
          <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Gain</p>
          <p className="text-sm font-semibold text-primary">
            ${commission.toFixed(2)}
          </p>
        </div>
      </div>

      {level.referrals.length > 0 && (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {level.referrals.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 text-sm bg-muted/20 rounded-lg p-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {member.username?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{member.username}</span>
              <span className="text-xs text-muted-foreground">
                ${member.staked.toFixed(0)}
              </span>
            </div>
          ))}
          {level.referrals.length > 3 && (
            <p className="text-xs text-center text-muted-foreground">
              +{level.referrals.length - 3} autres
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function MLMNetworkCard() {
  const { data: network, isLoading } = useMLMNetwork();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Votre Réseau</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!network || network.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Votre Réseau</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun filleul pour le moment.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Partagez votre code pour commencer à gagner !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Votre Réseau</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {network.map((level) => (
          <NetworkLevelCard key={level.level} level={level} />
        ))}
      </CardContent>
    </Card>
  );
}
