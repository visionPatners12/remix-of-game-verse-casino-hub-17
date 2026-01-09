import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { SectionHeader } from "../components/shared/SectionHeader";
import { FeatureCard } from "../components/shared/FeatureCard";
import { ScreenshotPlaceholder } from "../components/shared/ScreenshotPlaceholder";
import { 
  ArrowLeft, 
  Rss, 
  MessageCircle, 
  Video, 
  Users,
  FileText,
  Target,
  MessageSquare,
  Ticket,
  Play,
  Radio,
  Sparkles
} from "lucide-react";

const bestOfBothWorlds = [
  {
    icon: <MessageCircle className="w-6 h-6 text-primary" />,
    title: "Social Content",
    description: "Posts, predictions, reactions from the community"
  },
  {
    icon: <Video className="w-6 h-6 text-primary" />,
    title: "Live Highlights",
    description: "Best moments from matches in real-time"
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: "Community Predictions",
    description: "What the community predicts, aggregated insights"
  }
];

const postTypes = [
  { icon: FileText, title: "Simple Post", description: "Share thoughts about sports", badge: null },
  { icon: Target, title: "Prediction", description: "Predict results with confidence", badge: null },
  { icon: MessageSquare, title: "Opinion", description: "Debate matches and players", badge: null },
  { icon: Ticket, title: "Bet", description: "Share on-chain bets", badge: "WEB3" },
  { icon: Play, title: "Highlight", description: "React to best moments", badge: null },
  { icon: Radio, title: "Live Event", description: "Comment in real-time", badge: "LIVE" },
];

export function DiscoverFeed() {
  return (
    <LandingLayout>
      {/* Header */}
      <section className="py-12 md:py-20 border-b border-border/40">
        <div className="container px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Rss className="w-7 h-7 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">SOCIAL</Badge>
                <h1 className="text-3xl md:text-4xl font-bold">Social Feed + Sport</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              A unique feed that combines social content with sports. Follow tipsters, share predictions, 
              react to live events, and build your sports community all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Best of Both Worlds */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <SectionHeader
            badge="UNIQUE"
            title="The Best of Both Worlds"
            description="Social media meets sports betting in a revolutionary way"
            className="mb-12"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {bestOfBothWorlds.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6 Post Types */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <SectionHeader
            badge="CONTENT"
            title="6 Post Types"
            description="Express yourself in multiple ways"
            className="mb-12"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {postTypes.map((type) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-6 rounded-2xl bg-card border border-border/30 hover:border-primary/30 transition-all"
              >
                {type.badge && (
                  <Badge variant="outline" className="absolute top-4 right-4 text-xs">
                    {type.badge}
                  </Badge>
                )}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <SectionHeader
            title="See it in action"
            className="mb-12"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <ScreenshotPlaceholder label="Prediction Post" />
            <ScreenshotPlaceholder label="Bet Post" />
            <ScreenshotPlaceholder label="Highlight Post" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-primary/5">
        <div className="container px-4 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to join the feed?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create your account and start sharing your sports predictions today.
          </p>
          <Link to="/auth">
            <Button size="lg" className="px-8">
              Join the Feed
            </Button>
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
