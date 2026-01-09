import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, PenTool } from 'lucide-react';
import { useBaseBetslip } from '@azuro-org/sdk';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function FloatingActionStack() {
  const navigate = useNavigate();
  const location = useLocation();
  const baseBetslip = useBaseBetslip();
  const { items: selections = [] } = baseBetslip || {};
  const isMobile = useIsMobile();

  // Cacher sur certaines pages (auth, onboarding, ticket-slip, create-post)
  const hiddenRoutes = ['/ticket-slip', '/create-post', '/auth', '/onboarding'];
  if (hiddenRoutes.some(route => location.pathname.startsWith(route))) return null;

  return (
    <div className={cn(
      "fixed z-50 flex flex-col gap-3",
      isMobile ? "right-4 bottom-28" : "right-6 bottom-8"
    )}>
      {/* Bouton Ticket */}
      <Link 
        to="/ticket-slip" 
        className={cn(
          "relative p-3 rounded-full",
          "bg-primary/90 backdrop-blur-sm",
          "shadow-lg shadow-primary/25",
          "transition-all duration-300",
          "hover:scale-110 hover:shadow-xl hover:shadow-primary/40",
          "active:scale-95",
          selections.length > 0 && "ring-2 ring-primary/50"
        )}
      >
        <Ticket className="h-5 w-5 text-primary-foreground" />
        {selections.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-background">
            {selections.length}
          </div>
        )}
      </Link>
      
      {/* Bouton Créer Post (Plume) */}
      <button
        onClick={() => navigate('/create-post')}
        className={cn(
          "p-3 rounded-full",
          "bg-yellow-500/90 backdrop-blur-sm",
          "shadow-lg shadow-yellow-500/25",
          "transition-all duration-300",
          "hover:scale-110 hover:shadow-xl hover:shadow-yellow-500/40",
          "active:scale-95"
        )}
        aria-label="Créer un post"
      >
        <PenTool className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}
