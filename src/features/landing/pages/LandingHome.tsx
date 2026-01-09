import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { SportsTicker } from "../components/shared/SportsTicker";
import { DownloadButtons } from "../components/shared/DownloadButtons";
import { PhoneMockup } from "../components/shared/PhoneMockup";
import { ScreenshotPlaceholder } from "../components/shared/ScreenshotPlaceholder";
import { useStandaloneMode } from "@/hooks/useStandaloneMode";
import { 
  Newspaper, 
  Users, 
  Radio, 
  Gamepad2,
  UserPlus,
  Heart,
  Trophy,
  ArrowRight,
  Coins,
  Image,
  Lock,
  Rocket,
  CheckCircle2,
  Circle,
  Zap
} from "lucide-react";

const highlights = [
  {
    icon: Newspaper,
    title: "Your Sports Feed",
    description: "Follow the teams and players that matter to you. Comments, analyses, real-time debates."
  },
  {
    icon: Users,
    title: "Top Tipsters",
    description: "Discover tipsters with the best track records. Copy their analyses or create your own."
  },
  {
    icon: Radio,
    title: "Every Match Live",
    description: "Live stats, lineups, real-time odds. Everything you need to follow the action."
  },
  {
    icon: Gamepad2,
    title: "Play with Friends",
    description: "Challenge your friends on Ludo and other games. Crypto stakes, instant results."
  }
];

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up in 30 seconds with email or wallet"
  },
  {
    icon: Heart,
    title: "Follow your favorites",
    description: "Teams, players, tipsters - build your personalized feed"
  },
  {
    icon: Trophy,
    title: "Share and win",
    description: "Post your analyses, climb the leaderboards"
  }
];

const web3Features = [
  {
    icon: Coins,
    title: "PRZ Token",
    description: "Earn tokens for activity, tips, and engagement"
  },
  {
    icon: Image,
    title: "NFT Rewards",
    description: "Every winning bet generates a unique collectible NFT"
  },
  {
    icon: Lock,
    title: "Staking",
    description: "Stake PRZ to unlock premium features and rewards"
  }
];

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "completed",
    items: ["Social feed", "Tipster profiles", "Live scores"]
  },
  {
    phase: "Phase 2",
    title: "Expansion",
    status: "current",
    items: ["Mobile app", "Ludo games", "Premium tipsters"]
  },
  {
    phase: "Phase 3",
    title: "Web3 & Rewards",
    status: "upcoming",
    items: ["PRZ Token", "NFT rewards", "Staking"]
  },
  {
    phase: "Phase 4",
    title: "Gaming Hub",
    status: "upcoming",
    items: ["More games", "Tournaments", "Leaderboards"]
  }
];

const features = [
  {
    icon: Newspaper,
    title: "Your Sports Feed",
    description: "Follow the teams and players that matter to you. Get real-time updates, comments, and expert analyses all in one place.",
    mockupLabel: "Sports Feed",
    reverse: false
  },
  {
    icon: Users,
    title: "Top Tipsters",
    description: "Discover tipsters with verified track records. Follow their predictions, learn from the best, or become one yourself.",
    mockupLabel: "Tipsters",
    reverse: true
  },
  {
    icon: Radio,
    title: "Every Match Live",
    description: "Live stats, lineups, real-time odds and score updates. Never miss a moment of the action.",
    mockupLabel: "Live Matches",
    reverse: false
  },
  {
    icon: Gamepad2,
    title: "Play with Friends",
    description: "Challenge your friends on Ludo and other games. Stake crypto, compete for prizes, instant results.",
    mockupLabel: "Games",
    reverse: true
  }
];

export function LandingHome() {
  const navigate = useNavigate();
  const { isStandalone } = useStandaloneMode();

  useEffect(() => {
    // PWA mode: redirect to auth (PublicRoute will handle if already logged in)
    if (isStandalone) {
      navigate('/auth', { replace: true });
    }
  }, [isStandalone, navigate]);

  // Note: Authenticated user redirect is handled by PublicRoute wrapper in routes.tsx
  
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="container px-4 py-24 md:py-40 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
              The social network for sports fans
            </p>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Share your passion.
              <span className="block text-primary">Join the community.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Follow the best tipsters, debate with your community, 
              and experience every match intensely.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/discover">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 gap-2">
                  Discover <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Prominent Download Buttons */}
            <div className="pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-4">Download the app</p>
              <DownloadButtons size="lg" className="justify-center" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sports Ticker */}
      <SportsTicker />

      {/* Highlights Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything to experience sports differently
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A platform built for true fans
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
              See it in action
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Designed for the best mobile experience
            </p>
          </div>

          <div className="space-y-24">
            {features.map((feature, index) => (
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
              Join the community in 3 steps
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

      {/* Web3 Rewards Section */}
      <section className="py-20 md:py-28 bg-accent/20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              COMING SOON
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Web3 Rewards Ecosystem
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Earn PRZ tokens for your activity. Every winning bet generates a unique NFT collectible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {web3Features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-border/50 bg-card/50 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/discover/web3">
              <Button variant="outline" size="lg" className="gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap Preview Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Roadmap
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Building the future of sports social networking
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
                View Full Roadmap <ArrowRight className="w-4 h-4" />
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
              Ready to join the community?
            </h2>
            <p className="text-muted-foreground mb-8">
              Download the app and start sharing your analyses today.
            </p>
            <DownloadButtons size="lg" className="justify-center" />
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
