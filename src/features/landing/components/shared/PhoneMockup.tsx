import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className }: PhoneMockupProps) {
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* Gold ring glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-b from-amber-400/20 via-yellow-500/10 to-amber-400/20 rounded-[3.5rem] blur-sm" />
      {/* Phone frame */}
      <div className="relative w-[280px] h-[560px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] p-3 shadow-2xl shadow-amber-500/20 ring-1 ring-amber-500/30">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div className="relative w-full h-full bg-background rounded-[2.5rem] overflow-hidden">
          {/* Status bar */}
          <div className="absolute top-0 inset-x-0 h-8 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-between px-6 pt-2">
            <span className="text-xs text-muted-foreground">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-muted-foreground rounded-sm">
                <div className="w-3/4 h-full bg-muted-foreground rounded-sm" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="w-full h-full pt-8 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
