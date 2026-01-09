import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { SectionHeader } from "../components/shared/SectionHeader";
import { 
  ArrowLeft, 
  Coins,
  Trophy,
  Sparkles,
  Zap,
  Crown,
  TrendingUp,
  Shield,
  Users,
  Gift,
  Lock,
  Eye,
  Award,
  Target,
  Flame,
  DollarSign
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const highlights = [
  { icon: Gift, text: "Rewards on activity" },
  { icon: Trophy, text: "Winning bets → NFTs" },
  { icon: Crown, text: "Premium perks" },
];

const nftMilestones = [
  { icon: Users, title: "Early Adopter", description: "First 1000 registrations", color: "text-blue-500" },
  { icon: Target, title: "Active Bettor", description: "100 bets placed", color: "text-green-500" },
  { icon: Trophy, title: "Winner", description: "50 winning bets", color: "text-yellow-500" },
  { icon: Flame, title: "High Roller", description: "$1000 in winnings", color: "text-orange-500" },
];

const przSteps = [
  { step: "1", title: "You Play", description: "Place bets via Azuro/partners" },
  { step: "2", title: "You Earn PRZ Rewards", description: "Based on activity, regularity, engagement" },
  { step: "3", title: "You Use PRZ", description: "Subscribe to tipsters, boost posts, unlock features" },
];

const useCases = [
  { icon: Crown, title: "Tipster Subscriptions", description: "Subscribe to premium tipsters with PRZ" },
  { icon: TrendingUp, title: "Content Boost", description: "Boost your posts visibility" },
  { icon: Sparkles, title: "Premium Access", description: "Unlock advanced statistics" },
  { icon: Gift, title: "Perks & Benefits", description: "Exclusive rewards and benefits" },
];

const antiAbuse = [
  { icon: Shield, text: "Daily/weekly caps" },
  { icon: Award, text: "Quality score (anti-spam)" },
  { icon: Lock, text: "Anti-sybil/anti-bot controls" },
  { icon: Zap, text: "Progressive unlock" },
];

const transparency = [
  { icon: Eye, text: "Public distribution rules" },
  { icon: TrendingUp, text: "Reward tracking in account" },
  { icon: Shield, text: "Adjustments if abuse detected" },
];

const faqs = [
  { q: "How do I earn PRZ tokens?", a: "You earn PRZ through betting activity, engagement on the platform, and special events. The more active you are, the more you earn." },
  { q: "When will PRZ be tradeable?", a: "PRZ token trading will be enabled after the initial distribution phase. Stay tuned for announcements." },
  { q: "How are NFTs generated?", a: "Every winning bet automatically generates a unique NFT with details about your bet, including the match, odds, and winnings." },
  { q: "Can I sell my NFTs?", a: "Yes! Once our NFT marketplace launches, you'll be able to trade your betting NFTs with other users." },
  { q: "Are there limits on earning PRZ?", a: "Yes, we have daily and weekly caps to ensure fair distribution and prevent abuse of the reward system." },
  { q: "What wallet do I need?", a: "PRYZEN works with most popular wallets. You can connect with MetaMask, WalletConnect, or create an embedded wallet." },
];

export function DiscoverWeb3() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-purple-500/5 to-transparent" />
        <div className="container px-4 relative">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="outline" className="border-primary/50 text-primary">PRZ TOKEN</Badge>
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">NFT REWARDS</Badge>
              <Badge variant="outline" className="border-muted-foreground/50">COMING SOON</Badge>
            </div>
            
            <Coins className="w-16 h-16 text-primary mx-auto mb-6" />
            
            <h1 className="text-4xl md:text-5xl font-black mb-6">Web3 Rewards Ecosystem</h1>
            
            <div className="flex flex-wrap justify-center gap-4">
              {highlights.map((item) => (
                <div key={item.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/30">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* NFT Rewards */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">AVAILABLE NOW</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Every Winning Bet = An NFT
            </h2>
            <p className="text-muted-foreground mb-8">
              Each victory generates a unique NFT automatically. Unique design based on your bet. 
              Marketplace coming soon.
            </p>
            
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Victory NFT</h3>
              <p className="text-sm text-muted-foreground">Auto-generated with each winning bet</p>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Milestones */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <SectionHeader
            title="NFT Milestones"
            description="Unlock special NFTs by reaching milestones"
            className="mb-12"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {nftMilestones.map((milestone) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-card border border-border/30 text-center"
              >
                <milestone.icon className={`w-10 h-10 ${milestone.color} mx-auto mb-3`} />
                <h3 className="font-bold mb-1">{milestone.title}</h3>
                <p className="text-xs text-muted-foreground">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRZ Token */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <SectionHeader
            badge="PRZ TOKEN"
            title="How PRZ Works"
            className="mb-12"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {przSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-2xl bg-card border border-border/30 text-center"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  {step.step}
                </div>
                <h3 className="font-bold mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Use Cases */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="p-4 rounded-xl bg-card border border-border/30 text-center">
                <useCase.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">{useCase.title}</h4>
                <p className="text-xs text-muted-foreground">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anti-Abuse & Transparency */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Anti-Abuse */}
            <div className="p-6 rounded-2xl bg-card border border-border/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Anti-Abuse Features
              </h3>
              <div className="space-y-3">
                {antiAbuse.map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Transparency */}
            <div className="p-6 rounded-2xl bg-card border border-border/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Transparency
              </h3>
              <div className="space-y-3">
                {transparency.map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <SectionHeader title="FAQ" className="mb-12" />
          
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border/30 rounded-lg px-4 bg-card">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-primary/5">
        <div className="container px-4 text-center">
          <Coins className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start earning rewards</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join PRYZEN and start earning PRZ tokens and NFTs today.
          </p>
          <Link to="/auth">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
