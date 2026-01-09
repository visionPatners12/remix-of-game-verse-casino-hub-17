import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { SectionHeader } from "../components/shared/SectionHeader";
import { ScreenshotPlaceholder } from "../components/shared/ScreenshotPlaceholder";
import { 
  ArrowLeft, 
  TrendingUp,
  Vote,
  Bitcoin,
  DollarSign,
  Sparkles,
  Globe,
  BarChart3,
  Wallet
} from "lucide-react";

const categories = [
  { icon: Vote, title: "Politics", description: "Elections & policy", color: "from-blue-500/20 to-blue-600/20" },
  { icon: Bitcoin, title: "Crypto", description: "Markets & events", color: "from-orange-500/20 to-yellow-500/20" },
  { icon: DollarSign, title: "Finance", description: "Economy & stocks", color: "from-green-500/20 to-emerald-500/20" },
  { icon: Sparkles, title: "Culture", description: "Entertainment & more", color: "from-purple-500/20 to-pink-500/20" },
];

const howItWorks = [
  {
    step: "1",
    title: "Choose a Market",
    description: "Browse events to predict: elections, crypto prices, sports outcomes, and more.",
  },
  {
    step: "2",
    title: "Place Your Prediction",
    description: "Buy shares in the outcome you believe will happen. Prices reflect market probability.",
  },
];

const features = [
  { icon: Globe, title: "Global Events", description: "Predict outcomes of events worldwide" },
  { icon: BarChart3, title: "Prediction Markets", description: "Real-time probability tracking" },
  { icon: Wallet, title: "Crypto Payments", description: "Trade with USDC and other tokens" },
];

export function DiscoverPolymarket() {
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
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div>
                <Badge variant="outline" className="mb-1 border-yellow-500/50 text-yellow-500">COMING SOON</Badge>
                <h1 className="text-3xl md:text-4xl font-bold">Polymarket</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Prediction markets for real-world events. Trade on the outcomes of politics, 
              crypto, sports, and more. Powered by blockchain for transparency and trust.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Market Categories */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <SectionHeader
            title="Market Categories"
            description="Trade on events across multiple categories"
            className="mb-12"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {categories.map((category) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${category.color} border border-border/30 text-center`}
              >
                <category.icon className="w-10 h-10 text-foreground mx-auto mb-3" />
                <h3 className="font-bold mb-1">{category.title}</h3>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <SectionHeader
            title="How Prediction Markets Work"
            className="mb-12"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <ScreenshotPlaceholder label={`Step ${step.step}`} className="flex-1 min-h-[200px]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 text-center"
          >
            <Badge variant="outline" className="mb-4 border-yellow-500/50 text-yellow-500">IN DEVELOPMENT</Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Polymarket Integration</h2>
            <p className="text-muted-foreground mb-6">
              We're working on bringing Polymarket's prediction markets directly into PRYZEN. 
              Trade on global events without leaving the app.
            </p>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">Q2 2025</div>
                <div className="text-sm text-muted-foreground">Expected Launch</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4">
          <SectionHeader
            title="Features Preview"
            className="mb-12"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-card border border-border/30 text-center">
                <feature.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4 text-center">
          <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get notified when we launch</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sign up to be the first to know when Polymarket integration goes live.
          </p>
          <Link to="/auth">
            <Button size="lg" className="px-8">
              Sign Up
            </Button>
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
