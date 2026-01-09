import { BetslipDisableReason } from '@azuro-org/sdk';

// Mapping table for betslip disable reason descriptions
export const BETSLIP_DISABLE_REASONS = {
  [BetslipDisableReason.ConditionState]: {
    title: "Selection unavailable",
    description: "One or more outcomes have been removed or suspended",
    severity: "error" as const
  },
  [BetslipDisableReason.BetAmountGreaterThanMaxBet]: {
    title: "Stake too high",
    description: "Bet amount exceeds maximum allowed",
    severity: "warning" as const
  },
  [BetslipDisableReason.BetAmountLowerThanMinBet]: {
    title: "Stake too low",
    description: "Bet amount is lower than minimum required",
    severity: "warning" as const
  },
  [BetslipDisableReason.ComboWithForbiddenItem]: {
    title: "Combo not allowed",
    description: "One or more conditions can't be used in combo",
    severity: "error" as const
  },
  [BetslipDisableReason.ComboWithSameGame]: {
    title: "Same game selections",
    description: "Outcomes from same game can't be used in combo",
    severity: "error" as const
  },
  [BetslipDisableReason.PrematchConditionInStartedGame]: {
    title: "Game already started",
    description: "Pre-match item in started game",
    severity: "error" as const
  }
} as const;

// Helper function to get disable reason info
export const getDisableReasonInfo = (reason: BetslipDisableReason | undefined) => {
  if (!reason) return null;
  return BETSLIP_DISABLE_REASONS[reason];
};