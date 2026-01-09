import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Shield, Zap, Globe, Heart } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

export default function About() {
  const stats = [
    { label: "Joueurs", value: "50K+", icon: Users },
    { label: "Parties", value: "2M+", icon: Trophy },
    { label: "Pays", value: "180+", icon: Globe },
    { label: "Satisfaction", value: "99%", icon: Heart }
  ];

  const features = [
    { icon: Shield, title: "Sécurité", description: "Plateforme sécurisée avec chiffrement de bout en bout" },
    { icon: Zap, title: "Performance", description: "Technologie avancée pour une expérience fluide" },
    { icon: Trophy, title: "Fair Play", description: "Système anti-triche et modération 24h/24" },
    { icon: Users, title: "Communauté", description: "Rejoignez des gamers du monde entier" }
  ];

  return (
    <Layout>
      <PageSEO
        title="About PRYZEN | Social Sports Network"
        description="Discover PRYZEN: the innovative social network for sports fans. 50K+ players, 2M+ games, 180+ countries. Join our community."
        keywords="about PRYZEN, sports social network, gaming platform, community, sports fans"
        canonical="/about"
      />
      <div className="px-4 py-6 space-y-6">
        {/* Hero mobile optimized */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            À Propos de PRYZEN
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            PRYZEN révolutionne l'univers du gaming en ligne avec une plateforme innovante.
          </p>
          <Badge variant="outline" className="text-xs px-3 py-1">
            🚀 Lancé en 2024
          </Badge>
        </div>

        {/* Stats - Mobile grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center py-4">
              <CardContent className="pt-0">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission - Compact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Notre Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Créer la meilleure plateforme de jeux en ligne où les joueurs peuvent s'affronter, 
              parier de manière responsable et construire une communauté forte.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg mb-1">🎯</div>
                <h4 className="text-xs font-semibold mb-1">Innovation</h4>
                <p className="text-xs text-muted-foreground">Technologies de pointe</p>
              </div>
              <div>
                <div className="text-lg mb-1">🤝</div>
                <h4 className="text-xs font-semibold mb-1">Communauté</h4>
                <p className="text-xs text-muted-foreground">Liens authentiques</p>
              </div>
              <div>
                <div className="text-lg mb-1">🛡️</div>
                <h4 className="text-xs font-semibold mb-1">Intégrité</h4>
                <p className="text-xs text-muted-foreground">Fair-play total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div>
          <h2 className="text-xl font-bold text-center mb-4">Pourquoi PRYZEN ?</h2>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <feature.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Vision */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-3">Notre Vision</h2>
              <p className="text-sm text-muted-foreground">
                Devenir la référence mondiale du gaming social responsable, où chaque joueur 
                peut exprimer son talent dans un environnement sûr et équitable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
