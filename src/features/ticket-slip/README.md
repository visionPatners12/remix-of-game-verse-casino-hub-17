# Ticket Slip Feature

## Overview
The Ticket Slip feature handles betting slip functionality with integration to Azuro SDK. It provides both desktop (floating widget) and mobile (dedicated page) interfaces.

## Structure

```
src/features/ticket-slip/
├── components/
│   ├── cards/           # Selection cards and financial summaries
│   ├── forms/           # Input forms and mode selectors
│   ├── actions/         # CTA buttons and sharing
│   ├── layout/          # Layout components like quote row
│   └── index.ts         # Barrel exports
├── pages/
│   └── MobileTicketSlipPage.tsx  # Mobile-specific page
├── hooks/
│   ├── useTicketSlip.ts          # Main ticket slip hook
│   ├── useFinancialCalculations.ts  # Financial calculations
│   └── index.ts                  # Hook exports
├── constants/
│   ├── betslip-messages.ts       # Error/disable messages
│   └── index.ts                  # Constants exports
├── types.ts             # TypeScript definitions
├── TicketSlipContainer.tsx  # Main desktop container
├── index.ts             # Public API
└── README.md           # This file
```

## Components

### Cards
- **SelectionCard**: Individual bet selection with odds and controls
- **FinancialSummary**: Displays potential payouts and commissions
- **OddsModifier**: Allows custom odds in AGAINST_PLAYER mode

### Forms
- **StakeInputRow**: Stake input with currency display
- **ModeSelector**: Switch between REGULAR and AGAINST_PLAYER modes
- **QuickStakeButtons**: Currently disabled per user request

### Actions
- **PrimaryCTA**: Main bet placement buttons
- **ShareButton**: Social sharing functionality

### Layout
- **TotalQuoteRow**: Shows total odds with clear all option

## Hooks

### useTicketSlip
Main hook that integrates with Azuro SDK and provides:
- Ticket state management
- Financial calculations
- Azuro betslip data (items, odds, bet amounts)

### useFinancialCalculations
Calculates financial metrics based on stake, odds, and betting mode:
- Potential payout
- Commission calculations (for AGAINST_PLAYER mode)
- XP earned

## Types

### BetMode
- `REGULAR`: Standard betting mode
- `AGAINST_PLAYER`: Peer-to-peer betting with house commission

### Selection
Extended selection type with additional UI data:
- Event information
- Participant images
- Custom odds for P2P mode
- Navigation data (gameId)

### TicketSlipState
Current state of the betting slip:
- Selected mode
- Stake amount
- Currency
- Social sharing preferences

## Integration Points

### Azuro SDK
- `useBaseBetslip`: Basic betslip operations
- `useDetailedBetslip`: Detailed calculations and validations
- `useBet`: Bet submission
- `useSelectionOdds`: Real-time odds updates

### GetStream
- Bet publishing for social features
- Activity creation and sharing

### Supabase
- Bet prediction storage
- User authentication

## Usage

### Desktop (Widget)
```tsx
import { TicketSlipContainer } from '@/features/ticket-slip';

function App() {
  return (
    <div>
      {/* Your app content */}
      <TicketSlipContainer />
    </div>
  );
}
```

### Mobile (Page)
```tsx
import { MobileTicketSlipPage } from '@/features/ticket-slip';

function TicketSlipPage() {
  const [ticketState, setTicketState] = useState(/* initial state */);
  const calculations = useFinancialCalculations(/* params */);
  
  return (
    <MobileTicketSlipPage
      ticketState={ticketState}
      setTicketState={setTicketState}
      calculations={calculations}
    />
  );
}
```

## Migration Notes

This feature was migrated from `src/components/ticket-slip/` to follow the features architecture pattern. The migration preserves all existing functionality while improving organization and maintainability.

### Key Changes
- Organized components into logical categories (cards, forms, actions, layout)
- Created dedicated hooks for state management and calculations
- Improved TypeScript definitions and imports
- Added comprehensive barrel exports for clean API

### Backward Compatibility
The old `src/components/ticket-slip/` structure remains available for gradual migration. New implementations should use the features-based structure.