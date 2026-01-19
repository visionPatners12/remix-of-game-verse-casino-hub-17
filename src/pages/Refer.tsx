import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  MLMReferralCodeCard,
  MLMNetworkCard,
  LudoReferralPeriodSelector,
  LudoReferralStatsHero,
  LudoReferralLevelBreakdown,
} from "@/features/mlm";

const Refer = () => {
  const { session } = useAuth();
  const [periodDays, setPeriodDays] = useState(30);

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Programme Parrainage Ludo</h1>
          <p className="text-sm text-muted-foreground">
            Gagnez des commissions sur les parties de vos filleuls !
          </p>
        </div>

        {session ? (
          <>
            {/* Period Selector */}
            <LudoReferralPeriodSelector
              selectedPeriod={periodDays}
              onPeriodChange={setPeriodDays}
            />

            {/* Stats Hero */}
            <LudoReferralStatsHero periodDays={periodDays} />

            {/* Referral Code */}
            <MLMReferralCodeCard />

            {/* Level Breakdown */}
            <LudoReferralLevelBreakdown periodDays={periodDays} />

            {/* Network Tree */}
            <MLMNetworkCard />
          </>
        ) : (
          /* Login Required */
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connexion Requise</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connectez-vous pour accéder au programme de parrainage
                </p>
                <Button asChild>
                  <a href="/auth">Se Connecter</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Comment ça marche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Partagez votre code</h4>
                  <p className="text-xs text-muted-foreground">
                    Envoyez votre code de parrainage unique à vos amis
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Vos filleuls jouent au Ludo</h4>
                  <p className="text-xs text-muted-foreground">
                    Gagnez sur chaque partie de vos filleuls N1 (1.5%) et N2 (0.5%)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Commissions automatiques</h4>
                  <p className="text-xs text-muted-foreground">
                    Les commissions sont calculées automatiquement à chaque fin de partie
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Rates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Taux de Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-blue-500/5 rounded-lg border-l-2 border-blue-500">
                <span className="text-sm font-medium">Niveau 1 (Filleul direct)</span>
                <span className="text-sm font-bold text-blue-600">1.5%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-500/5 rounded-lg border-l-2 border-purple-500">
                <span className="text-sm font-medium">Niveau 2 (Filleul de filleul)</span>
                <span className="text-sm font-bold text-purple-600">0.5%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Commission calculée sur le montant misé par joueur
            </p>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Commissions calculées sur chaque partie terminée</li>
              <li>• Statut : En attente → Crédité → Payé</li>
              <li>• Auto-parrainage interdit</li>
              <li>• PRYZEN se réserve le droit de modifier ce programme</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Refer;
