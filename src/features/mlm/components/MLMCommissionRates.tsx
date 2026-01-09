import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COMMISSION_RATES = [
  {
    level: 1,
    rate: '5%',
    description: 'Filleuls directs',
    color: 'bg-green-500',
  },
  {
    level: 2,
    rate: '3%',
    description: 'Filleuls de niveau 2',
    color: 'bg-blue-500',
  },
  {
    level: 3,
    rate: '1%',
    description: 'Filleuls de niveau 3',
    color: 'bg-purple-500',
  },
];

export function MLMCommissionRates() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Taux de Commission</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Gagnez un pourcentage de la marge nette générée par votre réseau chaque mois.
        </p>
        <div className="space-y-3">
          {COMMISSION_RATES.map((rate) => (
            <div
              key={rate.level}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <div
                className={`w-8 h-8 rounded-full ${rate.color} flex items-center justify-center text-white font-bold text-sm`}
              >
                N{rate.level}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{rate.description}</p>
                <p className="text-xs text-muted-foreground">
                  {rate.rate} de la marge nette
                </p>
              </div>
              <span className="text-lg font-bold text-primary">{rate.rate}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
