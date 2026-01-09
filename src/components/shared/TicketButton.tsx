import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { useBaseBetslip } from '@azuro-org/sdk';

export function TicketButton() {
  const { items: selections } = useBaseBetslip();
  
  return (
    <Link 
      to="/ticket-slip" 
      className="relative p-2.5 hover:bg-muted/20 transition-all duration-200 rounded-lg"
    >
      <Ticket className="h-5 w-5 text-foreground" />
      {selections.length > 0 && (
        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg border border-accent/30">
          {selections.length}
        </div>
      )}
    </Link>
  );
}
