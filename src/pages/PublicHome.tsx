import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Gamepad2, TrendingUp, Users } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const LOGO_URL = "/pryzen-logo.png";

export default function PublicHome() {
  const navigate = useNavigate();
  const { isLoading, session } = useAuth();

  if (!isLoading && session) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="flex flex-col h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="text-lg text-muted-foreground mt-4">Loading…</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <PageSEO
        title="PRYZEN - Play with Friends, Win Together"
        description="The social network for sports fans and gamers. Play Ludo, bet on sports, share predictions. Join thousands of players worldwide."
        keywords="PRYZEN, social gaming, sports betting, ludo, multiplayer games, predictions, sports community"
        canonical="/"
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/8 to-transparent pointer-events-none" />
        
        {/* Header */}
        <header 
          className="flex items-center justify-between px-6 py-4 relative z-10"
          style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-3">
            <img 
              src={LOGO_URL}
              alt="PRYZEN"
              className="h-8"
              loading="lazy"
            />
            <span className="text-lg font-bold text-foreground tracking-tight">PRYZEN</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth")}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Button>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6">
              Play with friends.
              <br />
              <span className="text-primary">Win together.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Ludo, sports betting and predictions — all on one platform built for players.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-6 h-12 rounded-lg"
              >
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth")}
                className="border-border text-foreground hover:bg-muted font-medium px-6 h-12 rounded-lg"
              >
                I already have an account
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Features strip at bottom */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-border/50 py-8 px-6 md:px-12 lg:px-24"
        >
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <FeatureItem 
              icon={<Gamepad2 className="h-5 w-5" />}
              title="Multiplayer Games"
              description="Ludo, Checkers, Cards"
            />
            <FeatureItem 
              icon={<TrendingUp className="h-5 w-5" />}
              title="Sports Betting"
              description="Football, Tennis, Basketball"
            />
            <FeatureItem 
              icon={<Users className="h-5 w-5" />}
              title="Community"
              description="Predictions and tips"
            />
          </div>
        </motion.div>
      </section>

      {/* Games preview */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wide">Available Games</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
            Choose your favorite game
          </h2>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 hide-scrollbar">
            <GameCard emoji="🎲" name="Ludo" players="2-4" />
            <GameCard emoji="⚫" name="Checkers" players="2" />
            <GameCard emoji="🃏" name="Cards" players="2-6" />
            <GameCard emoji="❓" name="Coming Soon" players="..." comingSoon />
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to play?
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign up for free and start playing in seconds.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-6 h-12 rounded-lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6 md:px-12 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="PRYZEN" className="h-6" loading="lazy" />
            <span className="font-semibold text-foreground">PRYZEN</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PRYZEN. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function GameCard({ emoji, name, players, comingSoon = false }: { emoji: string; name: string; players: string; comingSoon?: boolean }) {
  return (
    <div className={`flex-shrink-0 w-36 p-5 rounded-xl border transition-colors ${comingSoon ? 'border-dashed border-border bg-transparent' : 'border-border bg-card hover:border-primary/50'}`}>
      <span className="text-3xl block mb-3">{emoji}</span>
      <p className="font-medium text-foreground text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{players} players</p>
    </div>
  );
}
