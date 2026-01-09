import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingLayout } from "@/features/landing/components/LandingLayout";
import { 
  ArrowLeft,
  Shield,
  Clock,
  AlertTriangle,
  Phone,
  ExternalLink,
  Heart,
  Eye,
  Headphones,
  Ban,
  Bell,
  History,
  Timer,
  HelpCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageSEO } from "@/components/seo/PageSEO";

const protectionTools = [
  { icon: Clock, title: "Time Limits", description: "Set daily and weekly session limits to manage your playing time" },
  { icon: Ban, title: "Deposit Limits", description: "Control your spending with daily, weekly, or monthly deposit caps" },
  { icon: Timer, title: "Self-Exclusion", description: "Take a break from 24 hours up to permanent account closure" },
  { icon: Bell, title: "Reality Checks", description: "Receive periodic reminders about time and money spent" },
  { icon: History, title: "Activity History", description: "Full transparency with detailed transaction and betting history" },
  { icon: Shield, title: "Cool-Off Period", description: "Temporary pause from 24 hours to 7 days" }
];

const commitments = [
  { icon: Shield, title: "Safety First", description: "Built-in protection tools available to all users" },
  { icon: Eye, title: "Transparency", description: "Clear information about risks and responsible play" },
  { icon: Headphones, title: "24/7 Support", description: "Help available anytime you need it" }
];

const warningSigns = [
  "Spending more time or money than intended",
  "Chasing losses by placing bigger bets",
  "Neglecting work, studies, or relationships",
  "Borrowing money or selling possessions to gamble",
  "Feeling anxious or irritable when not playing",
  "Lying to others about gambling habits"
];

const helpResources = [
  { name: "BeGambleAware", phone: "0808 8020 133", url: "https://www.begambleaware.org", region: "UK" },
  { name: "GamCare", phone: "0808 8020 133", url: "https://www.gamcare.org.uk", region: "UK" },
  { name: "National Council on Problem Gambling", phone: "1-800-522-4700", url: "https://www.ncpgambling.org", region: "US" },
  { name: "Gamblers Anonymous", phone: null, url: "https://www.gamblersanonymous.org", region: "International" }
];

export default function ResponsibleGaming() {
  return (
    <LandingLayout>
      <PageSEO
        title="Responsible Gaming | PRYZEN"
        description="Play responsibly with PRYZEN. Access protection tools, set limits, recognize warning signs, and find help resources for problem gambling."
        keywords="responsible gaming, gambling help, self-exclusion, betting limits, problem gambling support"
        canonical="/responsible-gaming"
      />
      {/* Hero Section */}
      <section className="py-12 md:py-20 border-b border-border/40">
        <div className="container px-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Responsible Gaming</h1>
                <Badge variant="outline" className="mt-2">Your safety matters</Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground mt-6">
              At PRYZEN, we believe gaming should be enjoyable and safe. We provide tools and resources 
              to help you stay in control and make informed decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Commitments Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Commitment to You</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We're dedicated to providing a safe and transparent gaming environment
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {commitments.map((item, index) => (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.1 }} 
                className="p-6 rounded-2xl border border-border/50 bg-card/30 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection Tools Section */}
      <section className="py-16 md:py-20 border-y border-border/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Protection Tools</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Take control with our comprehensive suite of responsible gaming features
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {protectionTools.map((tool, index) => (
              <motion.div 
                key={tool.title} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.05 }} 
                className="p-5 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <tool.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Warning Signs Section */}
      <section className="py-16 md:py-20 bg-destructive/5">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Recognize the Warning Signs</h2>
              <p className="text-muted-foreground">
                If you identify with any of these behaviors, it may be time to seek help
              </p>
            </div>
            <div className="space-y-3">
              {warningSigns.map((sign, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: index * 0.05 }} 
                  className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/30"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-sm">{sign}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Self Assessment Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="max-w-2xl mx-auto"
          >
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Not Sure? Take a Self-Assessment</h2>
            <p className="text-muted-foreground mb-8">
              Answer a few questions to better understand your gaming habits and get personalized recommendations.
            </p>
            <Button size="lg" className="gap-2">
              Start Self-Assessment <CheckCircle className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Help Resources Section */}
      <section className="py-16 md:py-20 bg-accent/20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Help</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              If you or someone you know needs support, these organizations can help
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {helpResources.map((resource, index) => (
              <motion.a 
                key={resource.name} 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.1 }} 
                className="p-5 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {resource.name}
                    </h3>
                    <Badge variant="outline" className="text-xs mb-2">{resource.region}</Badge>
                    {resource.phone && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Phone className="w-4 h-4" />
                        {resource.phone}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Message */}
      <section className="py-12 border-t border-border/30">
        <div className="container px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-sm font-bold">
              18+
            </span>
            <span className="text-muted-foreground">Adults only</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Gambling can be addictive. Play responsibly and within your means.
            If you need help, please reach out to the resources above.
          </p>
        </div>
      </section>
    </LandingLayout>
  );
}
