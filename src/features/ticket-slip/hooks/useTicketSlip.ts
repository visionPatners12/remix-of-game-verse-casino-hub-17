import { useBaseBetslip, useDetailedBetslip } from '@azuro-org/sdk';

export function useTicketSlip() {
  const baseBetslip = useBaseBetslip();
  const detailedBetslip = useDetailedBetslip();
  
  return {
    ...baseBetslip,
    ...detailedBetslip
  };
}