import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { DownloadButtons } from "../components/shared/DownloadButtons";
import { PhoneMockup } from "../components/shared/PhoneMockup";
import { useStandaloneMode } from "@/hooks/useStandaloneMode";
import { FloatingUSDCIcons } from "@/features/onboarding/components/FloatingUSDCIcons";
import landingLudoGame from "@/assets/landing-ludo-game.png";
import landingWallet from "@/assets/landing-wallet.png";
import landingGames from "@/assets/landing-games.png";
import heroBgIllustration from "@/assets/hero-bg-illustration.png";

import howtoBgIllustration from "@/assets/howto-bg-illustration.png";
import roadmapBgIllustration from "@/assets/roadmap-bg-illustration.png";
import ctaBgIllustration from "@/assets/cta-bg-illustration.png";
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


const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Email or crypto wallet in seconds"
  },
  {
    icon: DollarSign,
    title: "Deposit USDC",
    description: "Minimum 5 USDC on Base to start"
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
    description: "Challenge up to 4 players in real-time. Create private games, invite friends, and bet from 1 to 100 USDC. Winner takes all instantly.",
    image: landingLudoGame,
    reverse: false
  },
  {
    icon: Wallet,
    title: "Crypto Wallet",
    description: "Manage your USDC easily. Fast deposits and instant withdrawals on Base. Your winnings go directly to your wallet—no waiting.",
    image: landingWallet,
    reverse: true
  },
  {
    icon: Dices,
    title: "More Games Coming",
    description: "Crash, Dice, and other classic games are coming. Same USDC betting system, same smooth experience.",
    image: landingGames,
    reverse: false
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
    description: "All transactions are verifiable on Base blockchain"
  },
  {
    icon: Clock,
    title: "Instant Withdrawals",
    description: "Your winnings are immediately available in your wallet"
  },
  {
    icon: DollarSign,
    title: "Minimal Fees",
    description: "Enjoy reduced fees on the Base network"
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
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Illustration - Transparent */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-16">
          <img 
            src={heroBgIllustration} 
            alt=""
            className="w-full max-w-5xl opacity-75 object-contain animate-float-subtle"
          />
        </div>
        
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        
        {/* Floating USDC Icons */}
        <FloatingUSDCIcons />
        
        {/* Content */}
        <div className="container px-4 py-16 md:py-24 lg:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400 gap-1.5 bg-amber-500/10">
              <Zap className="w-3 h-3 text-amber-400" /> Powered by Base
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight">
              Play. Bet.
              <span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Win.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
              Challenge your friends on classic games. 
              Bet in USDC on Base. Instant wins.
            </p>
            
            {/* Download Buttons */}
            <div className="pt-6 inline-block">
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
                <feature.icon className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Phone Mockups */}
      <section className="py-20 border-y border-border/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to win
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              On-chain gaming made simple
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
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </PhoneMockup>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:bg-amber-500/20 transition-colors">
                    <feature.icon className="w-7 h-7 text-amber-400" />
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
      <section className="py-20 relative overflow-hidden">
        {/* Background Illustration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img 
            src={howtoBgIllustration} 
            alt=""
            className="w-full max-w-5xl opacity-50 object-contain animate-float"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        
        <div className="container px-4 relative z-10">
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
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 backdrop-blur-sm flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-sm font-bold flex items-center justify-center shadow-lg shadow-amber-500/30">
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
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background Illustration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img 
            src={roadmapBgIllustration} 
            alt=""
            className="w-full max-w-6xl opacity-60 object-contain animate-pulse-slow"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        
        <div className="container px-4 relative z-10">
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
                className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                  phase.status === 'current' 
                    ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 shadow-lg shadow-amber-500/10' 
                    : 'border-border/50 bg-card/80 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {phase.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : phase.status === 'current' ? (
                    <Zap className="w-5 h-5 text-amber-400" />
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
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background Illustration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img 
            src={ctaBgIllustration} 
            alt=""
            className="w-full max-w-4xl opacity-70 object-contain animate-float"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
        
        {/* Floating USDC Icons */}
        <FloatingUSDCIcons />
        
        <div className="container px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">play</span>?
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
