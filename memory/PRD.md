# PRD - Ludo Game Flow Analysis

## Problem Statement
Analyser le flow du jeu Ludo avec le backend edge function et base de données Supabase et identifier les erreurs dans le flow de jeu.

## Architecture
- **Frontend**: React/TypeScript (Vite) avec Supabase client
- **Backend**: Supabase Edge Functions (Deno/TypeScript)
- **Database**: Supabase PostgreSQL
- **Tables Ludo**: ludo_games, ludo_game_players, ludo_commissions, ludo_refund_queue
- **Edge Functions Ludo**: ludo-game (main), ludo (old), roll-dice (old), check-ludo-deposits

## What's Been Implemented (Analysis - Jan 2026)

### Analysis Report Delivered
- Full code review of 4 Ludo edge functions
- Database schema analysis (4 tables)
- Frontend code review (services, hooks, model)
- Game data validation against actual DB records
- Identified 13 errors across Critical/High/Medium severity
- Report saved at `/app/LUDO_FLOW_ANALYSIS.md`

### Key Findings (28 errors total)
**Part 1 - Backend & DB (13 errors):**
1. ENTRY_INDEX.Y = 28 bug (Yellow enters safe corridor immediately)
2. SAFE_LEN inconsistency (5 vs 6 between old/new functions)
3. Duplicate conflicting edge functions (ludo, ludo-game, roll-dice)
4. Missing `ludo_increment_pot` RPC function
5. roll-dice changes turn before move
6. current_players never synced
7. Stuck pending deposits (tx_hash null)

**Part 2 - Realtime, UX & Game System (15 errors):**
8. Timer autoPlay fires on ALL clients simultaneously
9. beforeunload async doesn't work (player stays "online")
10. No retry on CHANNEL_ERROR/TIMED_OUT
11. Heartbeat 30s too slow for realtime game
12. isAtHome accepts invalid positions (-9, -8, -7)
13. calculatePossibleMoves duplicated and divergent
14. Dice animation fixed 1.5s regardless of network
15. Auto-skip 2s too fast, no cancel option
16. Remote animation misses captures
17. pathGenerator skips for Yellow
18. Auto-start only for 4 players
19. Turn validation retry adds 1s latency
20. RLS allows creator to directly UPDATE game

## Prioritized Backlog

### P0 (Critical - Game Breaking)
- [ ] Fix ENTRY_INDEX.Y from 28 to 26 (in ludo-game + frontend)
- [ ] Disable/remove old `ludo` and `roll-dice` edge functions
- [ ] Create `ludo_increment_pot` RPC function
- [ ] Limit autoPlay to active player only

### P1 (High - Functional)
- [ ] Replace heartbeat with Supabase Presence
- [ ] Add retry on CHANNEL_ERROR
- [ ] Fix isAtHome: use `position <= base && position >= base - 3`
- [ ] Use movement.ts in LudoKonva instead of inline calc
- [ ] Add timeout for stuck pending deposits

### P2 (Medium - UX)
- [ ] Dynamic dice animation
- [ ] Increase auto-skip delay + manual button
- [ ] Animate captures
- [ ] Fix auto-start for 2-3 players
- [ ] Reduce validation retry from 500ms to 200ms

## Next Tasks
- User to decide which fixes to prioritize
- Implementation of fixes based on priority
- Report delivered at /app/LUDO_FLOW_ANALYSIS.md
