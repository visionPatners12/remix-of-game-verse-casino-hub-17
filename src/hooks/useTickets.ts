import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';

interface Ticket {
  id: string;
  subject: string;
  category: 'technical' | 'billing' | 'behavior' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user_id?: string;
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  content: string;
  created_at: string;
  is_from_support: boolean;
}

export function useTickets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!user?.id,
  });

  const createTicket = useMutation({
    mutationFn: async ({ category, subject, content, priority = 'medium' }: { 
      category: Ticket['category']; 
      subject: string; 
      content: string;
      priority?: Ticket['priority'];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject,
          category,
          status: 'open',
          priority,
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Add initial message
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: user.id,
          content,
          is_from_support: false,
        });

      if (messageError) throw messageError;

      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error) => {
      console.error('Create ticket error:', error);
      toast.error('Failed to create ticket');
    }
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { 
      ticketId: string; 
      status: Ticket['status'] 
    }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Ticket status updated');
    },
    onError: () => {
      toast.error('Failed to update ticket status');
    }
  });

  return {
    tickets,
    isLoading,
    createTicket,
    updateTicketStatus
  };
}

export function useTicketMessages(ticketId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!ticketId
  });

  const addMessage = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          content,
          is_from_support: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
      toast.success('Message sent');
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  return {
    messages,
    isLoading,
    addMessage
  };
}
