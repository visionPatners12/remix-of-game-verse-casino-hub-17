import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { LandingLayout } from "../components/LandingLayout";
import { 
  ArrowLeft, 
  Map,
  CheckCircle,
  Clock,
  Circle,
  Rocket,
  Users,
  Coins,
  Gamepad2,
  Crown,
  TrendingUp,
  Globe
} from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "completed",
    quarter: "Q3 2024",
    items: [
      { text: "Core platform launch", completed: true },
      { text: "Social feed & predictions", completed: true },
      { text: "Azuro integration", completed: true },
      { text: "User authentication", completed: true },
      { text: "Basic sports pages", completed: true },
    ],
    icon: Rocket
  },
  {
    phase: "Phase 2",
    title: "Expansion",
    status: "in-progress",
    quarter: "Q4 2024",
    items: [
      { text: "Ludo on-chain gaming", completed: true },
      { text: "NFT rewards system", completed: true },
      { text: "Enhanced sports data", completed: false },
      { text: "Mobile PWA optimization", completed: false },
      { text: "Multi-language support", completed: false },
    ],
    icon: Users
  },
  {
    phase: "Phase 3",
    title: "Web3 & Rewards",
    status: "upcoming",
    quarter: "Q1 2025",
    items: [
      { text: "PRZ token launch", completed: false },
      { text: "ForFan premium tipsters", completed: false },
      { text: "NFT marketplace", completed: false },
      { text: "Staking rewards", completed: false },
      { text: "Creator monetization", completed: false },
    ],
    icon: Coins
  },
  {
    phase: "Phase 4",
    title: "Gaming Hub",
    status: "upcoming",
    quarter: "Q2 2025",
    items: [
      { text: "Checkers & card games", completed: false },
      { text: "Sports quiz", completed: false },
      { text: "Tournament system", completed: false },
      { text: "Leaderboards & rankings", completed: false },
      { text: "Cross-game rewards", completed: false },
    ],
    icon: Gamepad2
  },
  {
    phase: "Phase 5",
    title: "Premium Features",
    status: "upcoming",
    quarter: "Q3 2025",
    items: [
      { text: "Video content support", completed: false },
      { text: "Live streaming", completed: false },
      { text: "VIP groups", completed: false },
      { text: "Advanced analytics", completed: false },
      { text: "AI predictions", completed: false },
    ],
    icon: Crown
  },
  {
    phase: "Phase 6",
    title: "Ecosystem",
    status: "upcoming",
    quarter: "Q4 2025",
    items: [
      { text: "Polymarket integration", completed: false },
      { text: "Multi-chain support", completed: false },
      { text: "API for developers", completed: false },
      { text: "Partner integrations", completed: false },
      { text: "DAO governance", completed: false },
    ],
    icon: Globe
  },
];

export function RoadmapPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-primary animate-pulse">In Progress</Badge>;
      default:
        return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  const getStatusIcon = (completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  };

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
                <Map className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Roadmap</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Our journey to build the ultimate social sports betting platform. 
              See what we've accomplished and what's coming next.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-0 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />
              
              {phases.map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row gap-8 mb-12 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />
                  
                  {/* Content */}
                  <div className={`flex-1 ml-8 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className={`p-6 rounded-2xl bg-card border border-border/30 ${
                      phase.status === 'in-progress' ? 'border-primary/50' : ''
                    }`}>
                      <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          phase.status === 'completed' ? 'bg-green-500/10' :
                          phase.status === 'in-progress' ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <phase.icon className={`w-5 h-5 ${
                            phase.status === 'completed' ? 'text-green-500' :
                            phase.status === 'in-progress' ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className={index % 2 === 0 ? 'md:text-right' : ''}>
                          <div className="text-sm text-muted-foreground">{phase.phase} • {phase.quarter}</div>
                          <h3 className="text-xl font-bold">{phase.title}</h3>
                        </div>
                      </div>
                      
                      <div className={`mb-4 ${index % 2 === 0 ? 'md:flex md:justify-end' : ''}`}>
                        {getStatusBadge(phase.status)}
                      </div>
                      
                      <ul className={`space-y-2 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                        {phase.items.map((item) => (
                          <li 
                            key={item.text} 
                            className={`flex items-center gap-2 text-sm ${
                              index % 2 === 0 ? 'md:flex-row-reverse' : ''
                            } ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {getStatusIcon(item.completed)}
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Vision</h2>
            <p className="text-lg text-muted-foreground">
              PRYZEN aims to become the leading social sports betting platform, 
              combining the best of social media, sports data, and Web3 technology 
              to create an unparalleled experience for sports fans worldwide.
            </p>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
