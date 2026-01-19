
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Calendar, Award, Newspaper } from "lucide-react";

export default function Press() {
  const pressReleases = [
    {
      title: "PRYZEN raises $5M to revolutionize peer-to-peer gaming",
      date: "January 8, 2025",
      summary: "The French startup announces a Series A funding round to accelerate its international expansion.",
      category: "Funding"
    },
    {
      title: "50,000 active players in 6 months: PRYZEN is a hit",
      date: "December 15, 2024",
      summary: "The gaming platform reaches a new record with over 2 million games played.",
      category: "Growth"
    },
    {
      title: "Strategic partnership with major game publishers",
      date: "November 22, 2024",
      summary: "PRYZEN partners with gaming leaders to expand its game catalog.",
      category: "Partnership"
    }
  ];

  const awards = [
    {
      title: "Gaming Startup of the Year 2024",
      organization: "French Tech Awards",
      date: "December 2024"
    },
    {
      title: "Innovation Prize - Blockchain Gaming",
      organization: "GameTech Summit",
      date: "October 2024"
    },
    {
      title: "Best User Experience - Gaming Platform",
      organization: "UX Design Awards",
      date: "September 2024"
    }
  ];

  const mediaKit = [
    { name: "PRYZEN Logo (PNG)", size: "2.3 MB" },
    { name: "PRYZEN Logo (SVG)", size: "145 KB" },
    { name: "App Screenshots", size: "8.7 MB" },
    { name: "Team Photos", size: "12.4 MB" },
    { name: "Fact Sheet", size: "1.2 MB" }
  ];

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Press & Media
          </h1>
          <p className="text-sm text-muted-foreground">
            Resources and news for journalists
          </p>
        </div>

        {/* Quick facts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">PRYZEN in Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary">50K+</div>
                <div className="text-xs text-muted-foreground">Active Players</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">2M+</div>
                <div className="text-xs text-muted-foreground">Games Played</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">180+</div>
                <div className="text-xs text-muted-foreground">Countries</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">$5M</div>
                <div className="text-xs text-muted-foreground">Funding Raised</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Press releases */}
        <div>
          <h2 className="text-xl font-bold mb-4">Press Releases</h2>
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
                        Read
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
            Awards
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
              Media Kit
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
              Download Full Kit
            </Button>
          </CardContent>
        </Card>

        {/* Press contact */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Press Contact</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Emma Rousseau</strong><br />Communications Manager</p>
                <p>📧 press@pryzen.com<br />📱 +33 6 12 34 56 78</p>
              </div>
              <Button className="mt-4" asChild>
                <a href="mailto:press@pryzen.com">Contact Press</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
