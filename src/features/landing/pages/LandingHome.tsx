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
    description: "Le jeu de société classique revisité. Misez en USDT et affrontez jusqu'à 4 joueurs en temps réel."
  },
  {
    icon: Wallet,
    title: "Wallet Intégré",
    description: "Déposez et retirez en USDT sur Polygon. Transactions rapides et frais minimes."
  },
  {
    icon: Users,
    title: "Parties Privées",
    description: "Créez des parties privées et invitez vos amis. Choisissez le montant de la mise."
  },
  {
    icon: Zap,
    title: "Gains Instantanés",
    description: "Victoire = gains directs dans votre wallet. Pas d'attente, pas d'intermédiaire."
  }
];

const steps = [
  {
    icon: UserPlus,
    title: "Connectez-vous",
    description: "Email ou wallet crypto en quelques secondes"
  },
  {
    icon: DollarSign,
    title: "Déposez des USDT",
    description: "Minimum 5 USDT sur Polygon pour commencer"
  },
  {
    icon: Trophy,
    title: "Jouez et gagnez",
    description: "Rejoignez une partie ou créez la vôtre"
  }
];

const features = [
  {
    icon: Gamepad2,
    title: "Ludo Multiplayer",
    description: "Affrontez jusqu'à 4 joueurs en temps réel. Mises flexibles de 1 à 100 USDT. Le gagnant remporte la mise totale.",
    mockupLabel: "Ludo Game",
    reverse: false
  },
  {
    icon: Wallet,
    title: "Wallet Crypto",
    description: "Gérez vos USDT facilement. Dépôts et retraits rapides sur Polygon. Historique complet de vos transactions.",
    mockupLabel: "Wallet",
    reverse: true
  },
  {
    icon: Trophy,
    title: "Historique & Stats",
    description: "Suivez toutes vos parties, vos victoires et vos gains. Statistiques détaillées de votre progression.",
    mockupLabel: "Stats",
    reverse: false
  },
  {
    icon: Dices,
    title: "Plus de jeux bientôt",
    description: "Crash, Dice, et d'autres jeux classiques arrivent. Même système de mise USDT, même expérience fluide.",
    mockupLabel: "Coming Soon",
    reverse: true
  }
];

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Lancement",
    status: "current",
    items: ["Ludo multiplayer", "Wallet USDT", "Profils joueurs"]
  },
  {
    phase: "Phase 2",
    title: "Social",
    status: "upcoming",
    items: ["Tournois", "Leaderboards", "Invitations amis"]
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
    description: "Toutes les transactions sont vérifiables sur la blockchain Polygon"
  },
  {
    icon: Clock,
    title: "Retraits Instantanés",
    description: "Vos gains sont disponibles immédiatement dans votre wallet"
  },
  {
    icon: DollarSign,
    title: "Frais Minimes",
    description: "Profitez des frais réduits du réseau Polygon"
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
              Jouez. Misez.
              <span className="block text-primary">Gagnez.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Affrontez vos amis sur des jeux classiques. 
              Mises en USDT sur Polygon. Gains instantanés.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto px-8 gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Commencer à jouer
                </Button>
              </Link>
              <Link to="/games">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 gap-2">
                  Voir les jeux <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Download Buttons */}
            <div className="pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-4">Téléchargez l'app</p>
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
              Le gaming on-chain simplifié
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Tout ce qu'il faut pour jouer et gagner en crypto
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
              Découvrez l'expérience
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Une app conçue pour le gaming mobile
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
              Comment ça marche
            </h2>
            <p className="text-muted-foreground">
              Commencez à jouer en 3 étapes
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
              Notre Roadmap
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              L'évolution de la plateforme gaming
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
                Voir la roadmap complète <ArrowRight className="w-4 h-4" />
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
              Prêt à jouer ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Téléchargez l'app et commencez à gagner dès aujourd'hui.
            </p>
            <DownloadButtons size="lg" className="justify-center" />
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
