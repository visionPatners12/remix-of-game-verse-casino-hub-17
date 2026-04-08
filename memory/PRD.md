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

### Key Findings
1. ENTRY_INDEX.Y bug (Yellow enters safe corridor immediately)
2. SAFE_LEN inconsistency (5 vs 6 between old/new functions)
3. Duplicate conflicting edge functions
4. Missing `ludo_increment_pot` RPC function
5. roll-dice changes turn before move

## Prioritized Backlog

### P0 (Critical)
- [ ] Fix ENTRY_INDEX.Y from 28 to 26 (in ludo-game + frontend)
- [ ] Disable/remove old `ludo` and `roll-dice` edge functions
- [ ] Create `ludo_increment_pot` RPC function

### P1 (High)
- [ ] Add timeout for stuck pending deposits
- [ ] Fix current_players counter
- [ ] Clean up inconsistent game data

### P2 (Medium)
- [ ] Add monitoring/alerts for game state anomalies
- [ ] Improve winner determination UX
- [ ] Add integration tests for game flow

## Next Tasks
- User to decide which fixes to prioritize
- Implementation of fixes based on priority
