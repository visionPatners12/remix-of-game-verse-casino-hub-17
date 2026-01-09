import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  MLMStatsCard,
  MLMReferralCodeCard,
  MLMNetworkCard,
  MLMCommissionRates,
} from "@/features/mlm";

const Refer = () => {
  const { session } = useAuth();

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Programme MLM</h1>
          <p className="text-sm text-muted-foreground">
            Parrainez jusqu'à 3 niveaux et gagnez des commissions !
          </p>
        </div>

        {session ? (
          <>
            {/* MLM Stats */}
            <MLMStatsCard />

            {/* Referral Code */}
            <MLMReferralCodeCard />

            {/* Network Tree */}
            <MLMNetworkCard />

            {/* Commission Rates */}
            <MLMCommissionRates />
          </>
        ) : (
          /* Login Required */
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connexion Requise</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connectez-vous pour accéder au programme MLM
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
                  <h4 className="font-semibold text-sm mb-1">Partagez</h4>
                  <p className="text-xs text-muted-foreground">
                    Envoyez votre code de parrainage unique
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">3 Niveaux</h4>
                  <p className="text-xs text-muted-foreground">
                    Gagnez sur vos filleuls directs ET leurs filleuls (3 niveaux)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Commissions Mensuelles</h4>
                  <p className="text-xs text-muted-foreground">
                    Recevez un % de la marge nette de votre réseau chaque mois
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Commissions calculées sur la marge nette mensuelle</li>
              <li>• Minimum $10 de marge par niveau pour commission</li>
              <li>• Commissions créditées le 1er de chaque mois</li>
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
