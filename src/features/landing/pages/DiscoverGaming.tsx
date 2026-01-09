import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { SectionHeader } from "../components/shared/SectionHeader";
import { 
  ArrowLeft, 
  Gamepad2,
  Users,
  Coins,
  Trophy,
  Zap,
  Dices,
  Square,
  Spade,
  HelpCircle
} from "lucide-react";

const ludoFeatures = [
  { icon: Users, text: "2-4 Players" },
  { icon: Coins, text: "On-Chain Bets" },
  { icon: Trophy, text: "Leaderboard" },
  { icon: Zap, text: "Real-Time" },
];

const upcomingGames = [
  { 
    icon: Square, 
    title: "Checkers", 
    description: "Classic strategy game",
    color: "from-red-500/20 to-black/20"
  },
  { 
    icon: Spade, 
    title: "Cards", 
    description: "Poker & more",
    color: "from-blue-500/20 to-purple-500/20"
  },
  { 
    icon: HelpCircle, 
    title: "Sports Quiz", 
    description: "Test your knowledge",
    color: "from-green-500/20 to-teal-500/20"
  },
  { 
    icon: Dices, 
    title: "Dice", 
    description: "Lucky rolls",
    color: "from-yellow-500/20 to-orange-500/20"
  },
];

export function DiscoverGaming() {
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
                <Gamepad2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">ACTIVE</Badge>
                <h1 className="text-3xl md:text-4xl font-bold">On-Chain Gaming</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Play classic games on the blockchain. Fair, transparent, and fun. 
              Stake crypto and compete with players worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ludo Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-red-500/10 via-blue-500/10 to-green-500/10 border border-primary/20 overflow-hidden"
            >
              <Badge variant="default" className="absolute top-4 right-4 bg-green-500">
                ACTIVE
              </Badge>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Ludo Board Preview */}
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-red-500/30 via-blue-500/30 to-green-500/30 flex items-center justify-center">
                  <span className="text-6xl">🎲</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">Ludo</h2>
                  <p className="text-xl text-muted-foreground mb-6">
                    The Classic Board Game, Reinvented
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
                    {ludoFeatures.map((feature) => (
                      <div key={feature.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 text-sm">
                        <feature.icon className="w-4 h-4 text-primary" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/games/ludo/create">
                    <Button size="lg" className="px-8 gap-2">
                      <Gamepad2 className="w-5 h-5" />
                      Play Ludo
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Games */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <SectionHeader
            badge="COMING SOON"
            title="Upcoming Games"
            description="More games are on the way"
            className="mb-12"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {upcomingGames.map((game) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${game.color} border border-border/30 text-center`}
              >
                <Badge variant="outline" className="absolute top-3 right-3 text-xs">SOON</Badge>
                <div className="text-4xl mb-3">
                  {game.title === "Checkers" && "♟️"}
                  {game.title === "Cards" && "🃏"}
                  {game.title === "Sports Quiz" && "❓"}
                  {game.title === "Dice" && "🎲"}
                </div>
                <h3 className="font-bold mb-1">{game.title}</h3>
                <p className="text-xs text-muted-foreground">{game.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4 text-center">
          <Gamepad2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to play?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start playing Ludo now and compete for crypto prizes.
          </p>
          <Link to="/games/ludo/create">
            <Button size="lg" className="px-8">
              Start Playing
            </Button>
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
