import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { SectionHeader } from "../components/shared/SectionHeader";
import { 
  ArrowLeft, 
  Crown, 
  Search, 
  CreditCard, 
  Unlock, 
  BarChart3,
  FileText,
  Video,
  Bell,
  Sparkles,
  Users,
  Wallet,
  TrendingUp,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronDown
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const stats = [
  { value: "500+", label: "Creators" },
  { value: "2.5K+", label: "Pre-registrations" },
  { value: "15+", label: "Sports" },
  { value: "Q1 2025", label: "Launch" },
];

const howItWorks = [
  { icon: Search, title: "Explore Creators", description: "Browse profiles, analyze performance" },
  { icon: CreditCard, title: "Choose Subscription", description: "Pay monthly in USDT" },
  { icon: Unlock, title: "Access Exclusive Content", description: "Premium predictions" },
  { icon: BarChart3, title: "Track Performance", description: "On-chain verified stats" },
];

const contentTypes = [
  { icon: FileText, title: "Premium Predictions", soon: false },
  { icon: Video, title: "Video Analysis", soon: true },
  { icon: FileText, title: "Exclusive Posts", soon: false },
  { icon: Bell, title: "Live Insights", soon: true },
  { icon: Sparkles, title: "Premium Stories", soon: true },
  { icon: Users, title: "VIP Groups", soon: true },
];

const creatorBenefits = [
  { icon: DollarSign, text: "Monetize your expertise" },
  { icon: Wallet, text: "Crypto payments (USDT)" },
  { icon: Users, text: "Build your community" },
  { icon: BarChart3, text: "Analytics dashboard" },
  { icon: TrendingUp, text: "Passive income" },
];

const subscriberBenefits = [
  { icon: Crown, text: "Access best tipsters" },
  { icon: Sparkles, text: "Exclusive content" },
  { icon: Bell, text: "Instant notifications" },
  { icon: Shield, text: "Verified history" },
  { icon: Clock, text: "Cancel anytime" },
];

const roadmapPhases = [
  { phase: "Beta Launch", status: "in-progress", items: ["Core features", "First creators"] },
  { phase: "Expansion", status: "upcoming", items: ["Video support", "More sports"] },
  { phase: "Community", status: "upcoming", items: ["VIP groups", "Live streams"] },
  { phase: "Ecosystem", status: "upcoming", items: ["PRZ integration", "NFT rewards"] },
];

const faqs = [
  { q: "How do I pay for subscriptions?", a: "All subscriptions are paid monthly in USDT via your connected wallet. Payments are processed on-chain for full transparency." },
  { q: "Can I cancel anytime?", a: "Yes! You can cancel your subscription at any time. You'll keep access until the end of your billing period." },
  { q: "How do I become a creator?", a: "Apply through our creator program. We verify your track record and betting history before approval." },
  { q: "How are tipster stats verified?", a: "All predictions and results are recorded on-chain, making it impossible to fake or modify historical performance." },
  { q: "What content can creators post?", a: "Creators can share predictions, analyses, exclusive posts, and soon video content and live insights." },
  { q: "Are there platform fees?", a: "PRYZEN takes a small percentage of subscription revenue. Creators keep the majority of their earnings." },
];

export function DiscoverForFan() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent" />
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
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-yellow-500/50 text-yellow-500">
              COMING SOON
            </Badge>
            
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            
            <h1 className="text-4xl md:text-6xl font-black mb-4">ForFan</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              The OnlyFans of Sports Betting
            </p>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
              Subscribe to your favorite tipsters. Access premium predictions, exclusive analyses, 
              and verified performance stats. All powered by crypto.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <SectionHeader title="How It Works" className="mb-12" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center p-6"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <SectionHeader
            title="Content Types"
            description="What creators can offer"
            className="mb-12"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {contentTypes.map((type) => (
              <div
                key={type.title}
                className="relative p-4 rounded-xl bg-card border border-border/30 text-center"
              >
                {type.soon && (
                  <Badge variant="secondary" className="absolute top-2 right-2 text-xs">SOON</Badge>
                )}
                <type.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">{type.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <SectionHeader title="Benefits" className="mb-12" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Creators */}
            <div className="p-6 rounded-2xl bg-card border border-border/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                For Creators
              </h3>
              <div className="space-y-3">
                {creatorBenefits.map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-3">
                    <benefit.icon className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Subscribers */}
            <div className="p-6 rounded-2xl bg-card border border-border/30">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                For Subscribers
              </h3>
              <div className="space-y-3">
                {subscriberBenefits.map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-3">
                    <benefit.icon className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <SectionHeader title="Roadmap" className="mb-12" />
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {roadmapPhases.map((phase, index) => (
              <div
                key={phase.phase}
                className={`p-4 rounded-xl border ${
                  phase.status === "in-progress" 
                    ? "border-primary bg-primary/5" 
                    : "border-border/30 bg-card"
                } min-w-[200px]`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {phase.status === "in-progress" ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted" />
                  )}
                  <span className="font-semibold text-sm">Phase {index + 1}</span>
                </div>
                <h4 className="font-bold mb-2">{phase.phase}</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {phase.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-accent/30">
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
      <section className="py-16 md:py-24">
        <div className="container px-4 text-center">
          <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Be the first to know</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join the waitlist and get early access when ForFan launches.
          </p>
          <Link to="/auth">
            <Button size="lg" className="px-8">
              Join Waitlist
            </Button>
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
