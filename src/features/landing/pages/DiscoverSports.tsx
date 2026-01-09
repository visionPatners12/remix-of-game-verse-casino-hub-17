import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { SectionHeader } from "../components/shared/SectionHeader";
import { ScreenshotPlaceholder } from "../components/shared/ScreenshotPlaceholder";
import { 
  ArrowLeft, 
  Trophy,
  Users,
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  Clock,
  History,
  DollarSign,
  Activity
} from "lucide-react";

const pageTypes = [
  {
    title: "League Page",
    description: "Complete league overview with standings, schedules, and statistics.",
    icon: Trophy,
    features: [
      { icon: TrendingUp, text: "Real-time standings" },
      { icon: Calendar, text: "Match schedule" },
      { icon: BarChart3, text: "League statistics" },
      { icon: User, text: "Top scorers" },
    ]
  },
  {
    title: "Team Page",
    description: "Everything about your favorite team in one place.",
    icon: Users,
    features: [
      { icon: Users, text: "Full squad" },
      { icon: BarChart3, text: "Team stats" },
      { icon: Calendar, text: "Upcoming matches" },
      { icon: History, text: "Results history" },
    ]
  },
  {
    title: "Match Page",
    description: "Live match center with all the data you need.",
    icon: Activity,
    features: [
      { icon: Activity, text: "Live score and events" },
      { icon: DollarSign, text: "Updated odds" },
      { icon: BarChart3, text: "Match statistics" },
      { icon: TrendingUp, text: "Available bets" },
    ]
  },
  {
    title: "Player Page",
    description: "Detailed player profiles and performance data.",
    icon: User,
    features: [
      { icon: User, text: "Bio and career" },
      { icon: BarChart3, text: "Detailed statistics" },
      { icon: DollarSign, text: "Market value" },
      { icon: History, text: "Transfer history" },
    ]
  },
];

const sports = [
  { emoji: "⚽", name: "Football" },
  { emoji: "🏀", name: "Basketball" },
  { emoji: "🎾", name: "Tennis" },
  { emoji: "🏈", name: "NFL" },
  { emoji: "⚾", name: "Baseball" },
  { emoji: "🏒", name: "Hockey" },
];

export function DiscoverSports() {
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
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">COMPLETE</Badge>
                <h1 className="text-3xl md:text-4xl font-bold">Sports Pages</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Dedicated pages for leagues, teams, matches, and players. All the sports data you need, 
              beautifully organized and always up-to-date.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Page Types */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="space-y-16 md:space-y-24">
            {pageTypes.map((page, index) => (
              <motion.div
                key={page.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <page.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{page.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">{page.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {page.features.map((feature) => (
                      <div key={feature.text} className="flex items-center gap-2 text-sm">
                        <feature.icon className="w-4 h-4 text-primary" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Screenshot */}
                <div className="flex-1 w-full max-w-md">
                  <ScreenshotPlaceholder label={`${page.title} Screenshot`} className="aspect-[9/16]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Sports */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <SectionHeader
            title="Supported Sports"
            description="All major sports covered"
            className="mb-12"
          />
          
          <div className="flex flex-wrap justify-center gap-4">
            {sports.map((sport) => (
              <Badge
                key={sport.name}
                variant="secondary"
                className="px-6 py-3 text-lg gap-2"
              >
                <span>{sport.emoji}</span>
                <span>{sport.name}</span>
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4 text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Sports</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create your account and start exploring leagues, teams, and players.
          </p>
          <Link to="/auth">
            <Button size="lg" className="px-8">
              Explore Sports
            </Button>
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
