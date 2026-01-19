import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Shield, Zap, Globe, Heart } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

export default function About() {
  const stats = [
    { label: "Players", value: "50K+", icon: Users },
    { label: "Games", value: "2M+", icon: Trophy },
    { label: "Countries", value: "180+", icon: Globe },
    { label: "Satisfaction", value: "99%", icon: Heart }
  ];

  const features = [
    { icon: Shield, title: "Security", description: "Secure platform with end-to-end encryption" },
    { icon: Zap, title: "Performance", description: "Advanced technology for a smooth experience" },
    { icon: Trophy, title: "Fair Play", description: "Anti-cheat system and 24/7 moderation" },
    { icon: Users, title: "Community", description: "Join gamers from around the world" }
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
            About PRYZEN
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            PRYZEN is revolutionizing online gaming with an innovative platform.
          </p>
          <Badge variant="outline" className="text-xs px-3 py-1">
            🚀 Launched in 2024
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
            <CardTitle className="text-xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              To create the best online gaming platform where players can compete, 
              bet responsibly and build a strong community.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg mb-1">🎯</div>
                <h4 className="text-xs font-semibold mb-1">Innovation</h4>
                <p className="text-xs text-muted-foreground">Cutting-edge technology</p>
              </div>
              <div>
                <div className="text-lg mb-1">🤝</div>
                <h4 className="text-xs font-semibold mb-1">Community</h4>
                <p className="text-xs text-muted-foreground">Authentic connections</p>
              </div>
              <div>
                <div className="text-lg mb-1">🛡️</div>
                <h4 className="text-xs font-semibold mb-1">Integrity</h4>
                <p className="text-xs text-muted-foreground">Total fair-play</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div>
          <h2 className="text-xl font-bold text-center mb-4">Why PRYZEN?</h2>
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
              <h2 className="text-xl font-bold mb-3">Our Vision</h2>
              <p className="text-sm text-muted-foreground">
                To become the global reference for responsible social gaming, where every player 
                can express their talent in a safe and fair environment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
