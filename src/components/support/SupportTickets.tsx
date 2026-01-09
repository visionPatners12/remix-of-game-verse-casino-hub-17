import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketMessages } from "./TicketMessages";
import { useTickets } from "@/hooks/useTickets";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Wrench, 
  CreditCard, 
  AlertTriangle, 
  HelpCircle, 
  ArrowDown, 
  ArrowRight, 
  ArrowUp, 
  Flame,
  ChevronDown,
  Calendar,
  Tag,
  X
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'in_progress':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'closed':
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'technical':
      return <Wrench className="h-3.5 w-3.5" />;
    case 'billing':
      return <CreditCard className="h-3.5 w-3.5" />;
    case 'behavior':
      return <AlertTriangle className="h-3.5 w-3.5" />;
    default:
      return <HelpCircle className="h-3.5 w-3.5" />;
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'low':
      return { icon: ArrowDown, label: "Low", className: "text-muted-foreground bg-muted/50" };
    case 'medium':
      return { icon: ArrowRight, label: "Medium", className: "text-blue-600 bg-blue-500/10" };
    case 'high':
      return { icon: ArrowUp, label: "High", className: "text-orange-600 bg-orange-500/10" };
    case 'urgent':
      return { icon: Flame, label: "Urgent", className: "text-destructive bg-destructive/10" };
    default:
      return { icon: ArrowRight, label: "Medium", className: "text-muted-foreground bg-muted/50" };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'open':
      return { label: "Open", className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" };
    case 'in_progress':
      return { label: "In Progress", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" };
    case 'resolved':
      return { label: "Resolved", className: "bg-green-500/15 text-green-600 border-green-500/30" };
    case 'closed':
      return { label: "Closed", className: "bg-muted text-muted-foreground border-border" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-border" };
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'technical': return 'Technical';
    case 'billing': return 'Billing';
    case 'behavior': return 'Behavior';
    default: return 'Other';
  }
};

const filterTabs = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

export const SupportTickets = () => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { tickets, isLoading } = useTickets();

  const filteredTickets = tickets?.filter(ticket => {
    if (statusFilter === 'all') return true;
    return ticket.status === statusFilter;
  }) || [];

  const ticketCounts = {
    all: tickets?.length || 0,
    open: tickets?.filter(t => t.status === 'open').length || 0,
    in_progress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
    closed: tickets?.filter(t => t.status === 'closed').length || 0,
  };

  const selectedTicket = tickets?.find(t => t.id === selectedTicketId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile-first scrollable filter tabs */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {filterTabs.map((tab) => {
            const count = ticketCounts[tab.value];
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.label}
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                  isActive ? "bg-primary-foreground/20" : "bg-background/60"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12"
        >
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-1">
                  {statusFilter === 'all' ? 'No support tickets' : `No ${statusFilter.replace('_', ' ')} tickets`}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  {statusFilter === 'all' 
                    ? "Create a new ticket to get help from our support team."
                    : "You don't have any tickets with this status."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filteredTickets.map((ticket, index) => {
              const statusConfig = getStatusConfig(ticket.status);
              const priorityConfig = getPriorityConfig(ticket.priority);
              const PriorityIcon = priorityConfig.icon;
              
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card 
                    className="cursor-pointer hover:bg-muted/30 active:scale-[0.99] transition-all border-border/60"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <CardContent className="p-3.5">
                      {/* Mobile-optimized layout */}
                      <div className="flex items-start gap-3">
                        {/* Status icon */}
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                          ticket.status === 'open' && "bg-yellow-500/10",
                          ticket.status === 'in_progress' && "bg-blue-500/10",
                          ticket.status === 'resolved' && "bg-green-500/10",
                          ticket.status === 'closed' && "bg-muted"
                        )}>
                          {getStatusIcon(ticket.status)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                              {ticket.subject}
                            </h3>
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 -rotate-90" />
                          </div>

                          {/* Meta row - mobile optimized */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(ticket.category)}
                              {getCategoryLabel(ticket.category)}
                            </span>
                            <span className="text-border">•</span>
                            <span>
                              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                            </span>
                          </div>

                          {/* Badges row */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 gap-1", statusConfig.className)}>
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 gap-1", priorityConfig.className)}>
                              <PriorityIcon className="h-2.5 w-2.5" />
                              {priorityConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile Drawer for ticket details */}
      <Drawer open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="border-b border-border/50 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <DrawerTitle className="text-left text-base font-semibold line-clamp-2">
                  {selectedTicket?.subject}
                </DrawerTitle>
                {selectedTicket && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", getStatusConfig(selectedTicket.status).className)}>
                      {getStatusConfig(selectedTicket.status).label}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 gap-1", getPriorityConfig(selectedTicket.priority).className)}>
                      {getPriorityConfig(selectedTicket.priority).label}
                    </Badge>
                  </div>
                )}
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>

            {/* Ticket metadata */}
            {selectedTicket && (
              <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Category</p>
                    <p className="text-xs font-medium flex items-center gap-1">
                      {getCategoryIcon(selectedTicket.category)}
                      {getCategoryLabel(selectedTicket.category)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Created</p>
                    <p className="text-xs font-medium">
                      {format(new Date(selectedTicket.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DrawerHeader>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            {selectedTicketId && (
              <TicketMessages ticketId={selectedTicketId} />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
