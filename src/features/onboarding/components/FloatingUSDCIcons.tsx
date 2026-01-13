import React from 'react';
import { motion } from 'framer-motion';
import { TokenUSDC } from '@web3icons/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const floatingIcons = [
  { delay: 0, x: 8, y: 15, size: 28, duration: 4.5, opacity: 0.15 },
  { delay: 1.2, x: 85, y: 22, size: 24, duration: 5, opacity: 0.12 },
  { delay: 0.5, x: 75, y: 55, size: 32, duration: 4, opacity: 0.18 },
  { delay: 2, x: 12, y: 65, size: 20, duration: 3.8, opacity: 0.1 },
  { delay: 1.5, x: 50, y: 10, size: 26, duration: 4.2, opacity: 0.14 },
  { delay: 0.8, x: 92, y: 75, size: 22, duration: 5.2, opacity: 0.12 },
  { delay: 1.8, x: 25, y: 80, size: 18, duration: 3.5, opacity: 0.08 },
];

export function FloatingUSDCIcons() {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Don't render floating animations if user prefers reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.slice(0, 3).map((icon, i) => (
          <div
            key={i}
            className="absolute"
            style={{ 
              left: `${icon.x}%`, 
              top: `${icon.y}%`,
              opacity: icon.opacity,
            }}
          >
            <TokenUSDC variant="branded" size={icon.size} />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ 
            left: `${icon.x}%`, 
            top: `${icon.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: icon.opacity,
            scale: 1,
            y: [-15, 15, -15],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            opacity: { delay: icon.delay, duration: 0.5 },
            scale: { delay: icon.delay, duration: 0.5, type: "spring" },
            y: { duration: icon.duration, repeat: Infinity, ease: "easeInOut", delay: icon.delay },
            rotate: { duration: icon.duration * 1.2, repeat: Infinity, ease: "easeInOut", delay: icon.delay },
          }}
        >
          <TokenUSDC variant="branded" size={icon.size} />
        </motion.div>
      ))}
    </div>
  );
}
