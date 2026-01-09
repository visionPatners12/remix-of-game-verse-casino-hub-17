import { motion } from "framer-motion";

const sports = [
  { name: "Football", icon: "⚽" },
  { name: "Basketball", icon: "🏀" },
  { name: "Tennis", icon: "🎾" },
  { name: "NFL", icon: "🏈" },
  { name: "Baseball", icon: "⚾" },
  { name: "Hockey", icon: "🏒" },
  { name: "MMA", icon: "🥊" },
  { name: "F1", icon: "🏎️" },
  { name: "Rugby", icon: "🏉" },
  { name: "Golf", icon: "⛳" },
  { name: "Cricket", icon: "🏏" },
  { name: "Volleyball", icon: "🏐" }
];

export function SportsTicker() {
  const duplicatedSports = [...sports, ...sports, ...sports];

  return (
    <div className="w-full overflow-hidden py-5 border-y border-border/20 bg-muted/30">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -1200] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedSports.map((sport, index) => (
          <span
            key={index}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
          >
            <span className="text-lg">{sport.icon}</span>
            <span>{sport.name}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
