import { useCallback } from 'react';
import { useBaseBetslip } from '@azuro-org/sdk';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import type { TicketSelectionInput } from '@/types/selection';
import type { TicketMatchData } from '@/types/match';

interface PostData {
  selection?: TicketSelectionInput;
  match?: TicketMatchData;
  marketType?: string;
  pick?: string;
}

export const useAddToTicket = () => {
  const baseBetslip = useBaseBetslip();
  const { toast } = useToast();
  const { items = [], addItem } = baseBetslip || {};

  // Check if a selection is already in the ticket
  const isSelectionInTicket = useCallback((selection: TicketSelectionInput) => {
    if (!selection?.conditionId || !selection?.outcomeId) return false;
    
    return items.some(item => 
      item.conditionId === selection.conditionId && 
      item.outcomeId === selection.outcomeId
    );
  }, [items]);

  // Add selection to ticket
  const addToTicket = useCallback(async (postData: PostData) => {
    if (!postData.selection) {
      toast({
        title: "Error",
        description: "Selection data is missing",
        variant: "destructive"
      });
      return false;
    }

    const { selection, match } = postData;

    // Check if already in ticket
    if (isSelectionInTicket(selection)) {
      toast({
        title: "Already in ticket",
        description: "This selection is already in your ticket",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Build complete selection data with all display fields (following Azuro SDK pattern)
      const selectionData = {
        // Azuro required fields
        conditionId: selection.conditionId,
        outcomeId: selection.outcomeId,
        gameId: match?.id || match?.gameId || '',
        isExpressForbidden: false,
        
        // Display fields (required for SimpleSelectionCard)
        eventName: match?.eventName || match?.matchName || 
                   `${match?.homeName || ''} vs ${match?.awayName || ''}`.trim() || 'Match',
        marketType: postData.marketType || selection.marketType || '',
        pick: postData.pick || selection.pick || '',
        
        // Optional enrichment fields
        participantImages: match?.participantImages || 
                           match?.participants?.map(p => p.image).filter(Boolean) || [],
        participants: match?.participants || [],
        sport: typeof match?.sport === 'string' 
          ? { name: match.sport, slug: match.sport }
          : match?.sport,
        league: typeof match?.league === 'string' 
          ? { name: match.league, slug: '' }
          : match?.league,
        startsAt: match?.startsAt || match?.date,
      };

      logger.debug('Adding selection to ticket:', selectionData);
      
      if (addItem) {
        addItem(selectionData);
        
        toast({
          title: "Added to ticket",
          description: "Selection successfully added to your ticket",
        });
        
        return true;
      } else {
        throw new Error('addItem function not available');
      }
    } catch (error) {
      logger.error('Error adding to ticket:', error);
      toast({
        title: "Error",
        description: "Failed to add selection to ticket",
        variant: "destructive"
      });
      return false;
    }
  }, [addItem, isSelectionInTicket, toast]);

  // Get button state for a selection
  const getButtonState = useCallback((selection?: TicketSelectionInput) => {
    if (!selection?.conditionId || !selection?.outcomeId) {
      return {
        text: "Add to Ticket",
        disabled: true,
        variant: "outline" as "outline" | "secondary"
      };
    }

    const inTicket = isSelectionInTicket(selection);
    
    return {
      text: inTicket ? "Added ✓" : "Add to Ticket",
      disabled: inTicket,
      variant: (inTicket ? "secondary" : "outline") as "outline" | "secondary"
    };
  }, [isSelectionInTicket]);

  return {
    addToTicket,
    isSelectionInTicket,
    getButtonState,
    ticketItemsCount: items.length
  };
};