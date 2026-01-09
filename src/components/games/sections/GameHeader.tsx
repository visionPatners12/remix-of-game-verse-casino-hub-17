import { Button } from "@/ui";
import { useNavigate } from "react-router-dom";
import { UserPlus, Gamepad2 } from "lucide-react";

interface GameHeaderProps {
  onOpenJoinDialog?: () => void;
}

export const GameHeader = ({ onOpenJoinDialog }: GameHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10" />
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-secondary/15 to-transparent rounded-full blur-2xl" />
      
      {/* Content */}
      <div className="relative z-10 backdrop-blur-sm bg-card/20 border border-border rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 animate-pulse" />
              <div className="relative bg-gradient-to-r from-primary to-secondary p-3 rounded-full">
                <Gamepad2 className="w-6 h-6 text-primary-foreground font-bold" />
              </div>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Games Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Play, compete and win
              </p>
            </div>
          </div>
          
          {/* Join Button */}
          {onOpenJoinDialog && (
            <div className="flex justify-center lg:justify-end">
              <Button 
                onClick={onOpenJoinDialog}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-6 py-3 rounded-xl border border-emerald-400/20 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Join</span>
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
