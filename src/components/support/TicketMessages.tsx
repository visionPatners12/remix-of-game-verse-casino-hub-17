import { useState, useRef, useEffect } from "react";
import { useTicketMessages } from "@/hooks/useTickets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, User, Headphones, MessageCircle, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TicketMessagesProps {
  ticketId: string;
}

export function TicketMessages({ ticketId }: TicketMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { messages, isLoading, addMessage } = useTicketMessages(ticketId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`ticket-messages-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, queryClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await addMessage.mutateAsync({ content: newMessage });
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-primary absolute -bottom-1 -right-1" />
        </div>
        <p className="text-sm text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 py-4 space-y-4 scrollbar-thin max-h-[450px]"
      >
        {messages?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-primary/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start the conversation with our support team
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages?.map((message, index) => {
              const isSupport = message.is_from_support;
              const isLastUserMessage = !isSupport && index === messages.length - 1;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-2.5",
                    isSupport ? "justify-start" : "justify-end"
                  )}
                >
                  {/* Support Avatar */}
                  {isSupport && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <Headphones className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                      isSupport
                        ? "bg-muted/80 backdrop-blur-sm rounded-tl-md border border-border/50"
                        : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>
                    <div className={cn(
                      "flex items-center gap-1.5 mt-1.5",
                      isSupport ? "justify-start" : "justify-end"
                    )}>
                      <time
                        className={cn(
                          "text-[10px]",
                          isSupport ? "text-muted-foreground" : "text-primary-foreground/70"
                        )}
                      >
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })}
                      </time>
                      {!isSupport && (
                        <CheckCheck className={cn(
                          "h-3 w-3",
                          isLastUserMessage ? "text-primary-foreground/70" : "text-primary-foreground/50"
                        )} />
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {!isSupport && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <User className="h-4 w-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border/50 bg-background/50 backdrop-blur-sm p-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-[120px] resize-none pr-4 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
              rows={1}
            />
            <span className="absolute bottom-1.5 right-2 text-[10px] text-muted-foreground/60">
              Enter to send
            </span>
          </div>
          <Button 
            type="submit" 
            size="icon"
            className={cn(
              "h-11 w-11 shrink-0 rounded-xl transition-all duration-200",
              newMessage.trim() 
                ? "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg" 
                : "bg-muted text-muted-foreground"
            )}
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
