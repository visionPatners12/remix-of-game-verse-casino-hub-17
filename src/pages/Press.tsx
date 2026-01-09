
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Calendar, Award, Newspaper } from "lucide-react";

export default function Press() {
  const pressReleases = [
    {
      title: "PRYZEN lève 5M€ pour révolutionner le gaming peer-to-peer",
      date: "8 janvier 2025",
      summary: "La startup française annonce une levée de fonds de série A pour accélérer son développement international.",
      category: "Financement"
    },
    {
      title: "50 000 joueurs actifs en 6 mois : PRYZEN cartonne",
      date: "15 décembre 2024",
      summary: "La plateforme de gaming atteint un nouveau record avec plus de 2 millions de parties jouées.",
      category: "Croissance"
    },
    {
      title: "Partenariat stratégique avec les plus grands éditeurs de jeux",
      date: "22 novembre 2024",
      summary: "PRYZEN s'associe avec des leaders du gaming pour enrichir son catalogue de jeux.",
      category: "Partenariat"
    }
  ];

  const awards = [
    {
      title: "Startup Gaming de l'Année 2024",
      organization: "French Tech Awards",
      date: "Décembre 2024"
    },
    {
      title: "Innovation Prize - Blockchain Gaming",
      organization: "GameTech Summit",
      date: "Octobre 2024"
    },
    {
      title: "Best User Experience - Gaming Platform",
      organization: "UX Design Awards",
      date: "Septembre 2024"
    }
  ];

  const mediaKit = [
    { name: "Logo PRYZEN (PNG)", size: "2.3 MB" },
    { name: "Logo PRYZEN (SVG)", size: "145 KB" },
    { name: "Screenshots App", size: "8.7 MB" },
    { name: "Photos Équipe", size: "12.4 MB" },
    { name: "Fact Sheet", size: "1.2 MB" }
  ];

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Presse & Médias
          </h1>
          <p className="text-sm text-muted-foreground">
            Ressources et actualités pour les journalistes
          </p>
        </div>

        {/* Quick facts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">PRYZEN en Chiffres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary">50K+</div>
                <div className="text-xs text-muted-foreground">Joueurs Actifs</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">2M+</div>
                <div className="text-xs text-muted-foreground">Parties Jouées</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">180+</div>
                <div className="text-xs text-muted-foreground">Pays</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">5M€</div>
                <div className="text-xs text-muted-foreground">Levée de Fonds</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Press releases */}
        <div>
          <h2 className="text-xl font-bold mb-4">Communiqués de Presse</h2>
          <div className="space-y-3">
            {pressReleases.map((release, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{release.title}</h3>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {release.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {release.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {release.date}
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Lire
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Récompenses
          </h2>
          <div className="space-y-3">
            {awards.map((award, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{award.title}</h3>
                      <p className="text-xs text-muted-foreground">{award.organization}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{award.date}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Media kit */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Kit Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mediaKit.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.size}</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le Kit Complet
            </Button>
          </CardContent>
        </Card>

        {/* Contact presse */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Contact Presse</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Emma Rousseau</strong><br />Responsable Communication</p>
                <p>📧 presse@pryzen.com<br />📱 +33 6 12 34 56 78</p>
              </div>
              <Button className="mt-4" asChild>
                <a href="mailto:presse@pryzen.com">Contacter la Presse</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
