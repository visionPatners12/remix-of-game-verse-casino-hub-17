import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { DownloadButtons } from "../components/shared/DownloadButtons";
import { PhoneMockup } from "../components/shared/PhoneMockup";
import { ScreenshotPlaceholder } from "../components/shared/ScreenshotPlaceholder";
import { useStandaloneMode } from "@/hooks/useStandaloneMode";
import { 
  Gamepad2,
  UserPlus,
  Trophy,
  ArrowRight,
  Wallet,
  Users,
  Zap,
  CheckCircle2,
  Circle,
  DollarSign,
  Shield,
  Clock,
  Dices
} from "lucide-react";

const highlights = [
  {
    icon: Gamepad2,
    title: "Ludo On-Chain",
    description: "The classic board game reimagined. Bet in USDT and challenge up to 4 players in real-time."
  },
  {
    icon: Wallet,
    title: "Integrated Wallet",
    description: "Deposit and withdraw in USDT on Polygon. Fast transactions and minimal fees."
  },
  {
    icon: Users,
    title: "Private Games",
    description: "Create private games and invite your friends. Choose your own bet amount."
  },
  {
    icon: Zap,
    title: "Instant Wins",
    description: "Victory = direct gains to your wallet. No waiting, no middleman."
  }
];

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Email or crypto wallet in seconds"
  },
  {
    icon: DollarSign,
    title: "Deposit USDT",
    description: "Minimum 5 USDT on Polygon to start"
  },
  {
    icon: Trophy,
    title: "Play & Win",
    description: "Join a game or create your own"
  }
];

const features = [
  {
    icon: Gamepad2,
    title: "Ludo Multiplayer",
    description: "Challenge up to 4 players in real-time. Flexible bets from 1 to 100 USDT. Winner takes all.",
    mockupLabel: "Ludo Game",
    reverse: false
  },
  {
    icon: Wallet,
    title: "Crypto Wallet",
    description: "Manage your USDT easily. Fast deposits and withdrawals on Polygon. Complete transaction history.",
    mockupLabel: "Wallet",
    reverse: true
  },
  {
    icon: Trophy,
    title: "History & Stats",
    description: "Track all your games, victories, and winnings. Detailed statistics of your progress.",
    mockupLabel: "Stats",
    reverse: false
  },
  {
    icon: Dices,
    title: "More Games Coming",
    description: "Crash, Dice, and other classic games are coming. Same USDT betting system, same smooth experience.",
    mockupLabel: "Coming Soon",
    reverse: true
  }
];

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Launch",
    status: "current",
    items: ["Ludo multiplayer", "USDT Wallet", "Player profiles"]
  },
  {
    phase: "Phase 2",
    title: "Social",
    status: "upcoming",
    items: ["Tournaments", "Leaderboards", "Friend invites"]
  },
  {
    phase: "Phase 3",
    title: "Expansion",
    status: "upcoming",
    items: ["Crash game", "Dice game", "Card games"]
  },
  {
    phase: "Phase 4",
    title: "Rewards",
    status: "upcoming",
    items: ["Token rewards", "NFT achievements", "VIP program"]
  }
];

const trustFeatures = [
  {
    icon: Shield,
    title: "100% On-Chain",
    description: "All transactions are verifiable on Polygon blockchain"
  },
  {
    icon: Clock,
    title: "Instant Withdrawals",
    description: "Your winnings are immediately available in your wallet"
  },
  {
    icon: DollarSign,
    title: "Minimal Fees",
    description: "Enjoy reduced fees on the Polygon network"
  }
];

export function LandingHome() {
  const navigate = useNavigate();
  const { isStandalone } = useStandaloneMode();

  useEffect(() => {
    if (isStandalone) {
      navigate('/auth', { replace: true });
    }
  }, [isStandalone, navigate]);
  
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container px-4 py-24 md:py-40 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary gap-1.5">
              <Zap className="w-3 h-3" /> Powered by Polygon
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Play. Bet.
              <span className="block text-primary">Win.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Challenge your friends on classic games. 
              Bet in USDT on Polygon. Instant wins.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto px-8 gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Start Playing
                </Button>
              </Link>
              <Link to="/games">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 gap-2">
                  View Games <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Download Buttons */}
            <div className="pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-4">Download the app</p>
              <DownloadButtons size="lg" className="justify-center" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-border/20 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <feature.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              On-chain gaming made simple
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to play and win in crypto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Phone Mockups */}
      <section className="py-20 border-y border-border/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover the experience
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              An app designed for mobile gaming
            </p>
          </div>

          <div className="space-y-24">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20`}
              >
                <div className="flex-1">
                  <PhoneMockup>
                    <ScreenshotPlaceholder label={feature.mockupLabel} />
                  </PhoneMockup>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground">
              Start playing in 3 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-flex mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Preview Section */}
      <section className="py-20 md:py-28 bg-accent/20">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Roadmap
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              The evolution of the gaming platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {roadmapPhases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  phase.status === 'current' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border/50 bg-card/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {phase.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : phase.status === 'current' ? (
                    <Zap className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {phase.phase}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3">{phase.title}</h3>
                <ul className="space-y-1.5">
                  {phase.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/roadmap">
              <Button variant="outline" size="lg" className="gap-2">
                View full roadmap <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 border-t border-border/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to play?
            </h2>
            <p className="text-muted-foreground mb-8">
              Download the app and start winning today.
            </p>
            <DownloadButtons size="lg" className="justify-center" />
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
