import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateTournamentRequest {
  name: string;
  description?: string;
  tournamentSize: 16 | 64;
  entryFee: number;
  commissionRate: number;
  registrationStart: string;
  registrationEnd: string;
  tournamentStart: string | null;
  startWhenFull: boolean;
  prizeDistributionType: string;
  prizeDistribution: { position: number; percentage: number }[];
}

interface JoinTournamentRequest {
  tournamentId: string;
}

interface StartTournamentRequest {
  tournamentId: string;
}

interface GetTournamentRequest {
  tournamentId: string;
}

interface ListTournamentsRequest {
  status?: string;
  limit?: number;
  offset?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientType = any;

// Helper functions for responses
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Get authenticated user from request
async function getUser(supabase: SupabaseClientType, req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

// ACTION: CREATE - Create a new tournament
async function handleCreate(supabase: SupabaseClientType, req: Request, data: CreateTournamentRequest) {
  console.log('[tournament-api] CREATE action started');
  
  const user = await getUser(supabase, req);
  if (!user) {
    console.log('[tournament-api] Unauthorized - no user');
    return errorResponse('Unauthorized', 401);
  }

  const { 
    name, 
    description,
    tournamentSize,
    entryFee,
    commissionRate,
    registrationStart,
    registrationEnd,
    tournamentStart,
    startWhenFull,
    prizeDistributionType,
    prizeDistribution
  } = data;

  // Validate tournament size
  if (![16, 64].includes(tournamentSize)) {
    console.log('[tournament-api] Invalid tournament size:', tournamentSize);
    return errorResponse('Tournament size must be 16 or 64');
  }

  // Validate name
  if (!name || name.trim().length === 0) {
    return errorResponse('Tournament name is required');
  }

  // Calculate prize pool and total rounds
  const prizePool = entryFee * tournamentSize * (1 - commissionRate / 100);
  const totalRounds = tournamentSize === 16 ? 2 : 3;

  console.log('[tournament-api] Creating tournament:', { 
    name, 
    tournamentSize, 
    entryFee, 
    prizePool, 
    totalRounds 
  });

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      game_type: 'ludo',
      tournament_format: 'ludo_4p',
      bracket_size: tournamentSize,
      players_per_match: 4,
      entry_fee: entryFee,
      prize_pool: prizePool,
      commission_rate: commissionRate,
      prize_distribution: prizeDistribution,
      prize_distribution_type: prizeDistributionType,
      total_rounds: totalRounds,
      current_round: 1,
      registration_start: registrationStart,
      registration_end: registrationEnd,
      tournament_start: tournamentStart,
      start_when_full: startWhenFull,
      status: 'registration',
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('[tournament-api] Create error:', error);
    return errorResponse(error.message, 500);
  }

  console.log('[tournament-api] Tournament created:', tournament.id);
  return jsonResponse({ success: true, tournament }, 201);
}

// ACTION: JOIN - Join an existing tournament
async function handleJoin(supabase: SupabaseClientType, req: Request, data: JoinTournamentRequest) {
  console.log('[tournament-api] JOIN action started');
  
  const user = await getUser(supabase, req);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  const { tournamentId } = data;

  // Get tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*, tournament_participants(count)')
    .eq('id', tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return errorResponse('Tournament not found', 404);
  }

  // Check status
  if (tournament.status !== 'registration') {
    return errorResponse('Tournament is not accepting registrations');
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from('tournament_participants')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return errorResponse('Already registered for this tournament');
  }

  // Check if tournament is full
  const participantCount = tournament.tournament_participants?.[0]?.count || 0;
  if (participantCount >= tournament.bracket_size) {
    return errorResponse('Tournament is full');
  }

  // TODO: Handle wallet debit for entry_fee when payment is implemented

  // Add participant
  const { data: participant, error: joinError } = await supabase
    .from('tournament_participants')
    .insert({
      tournament_id: tournamentId,
      user_id: user.id,
      status: 'registered'
    })
    .select()
    .single();

  if (joinError) {
    console.error('[tournament-api] Join error:', joinError);
    return errorResponse(joinError.message, 500);
  }

  // Check if tournament should auto-start
  const newCount = participantCount + 1;
  if (tournament.start_when_full && newCount >= tournament.bracket_size) {
    console.log('[tournament-api] Tournament full, triggering auto-start');
    // Could trigger start logic here or via a separate call
  }

  console.log('[tournament-api] User joined tournament:', participant.id);
  return jsonResponse({ success: true, participant });
}

// ACTION: START - Start a tournament (generate matches)
async function handleStart(supabase: SupabaseClientType, req: Request, data: StartTournamentRequest) {
  console.log('[tournament-api] START action started');
  
  const user = await getUser(supabase, req);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  const { tournamentId } = data;

  // Get tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return errorResponse('Tournament not found', 404);
  }

  // Verify ownership
  if (tournament.created_by !== user.id) {
    return errorResponse('Only the tournament creator can start it', 403);
  }

  // Check status
  if (tournament.status !== 'registration') {
    return errorResponse('Tournament cannot be started');
  }

  // Get participants
  const { data: participants } = await supabase
    .from('tournament_participants')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (!participants || participants.length < tournament.bracket_size) {
    return errorResponse(`Need ${tournament.bracket_size} participants to start`);
  }

  // Shuffle participants for random seeding
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  // Create Round 1 matches (4 players per match)
  const matchesRound1 = tournament.bracket_size / 4;
  const matches: unknown[] = [];

  for (let i = 0; i < matchesRound1; i++) {
    const matchPlayers = shuffled.slice(i * 4, (i + 1) * 4);
    
    // Create the match
    const { data: match, error: matchError } = await supabase
      .from('tournament_matches')
      .insert({
        tournament_id: tournamentId,
        round_number: 1,
        match_number: i + 1,
        status: 'pending'
      })
      .select()
      .single();

    if (matchError) {
      console.error('[tournament-api] Match creation error:', matchError);
      continue;
    }

    // Add players to match
    for (let j = 0; j < matchPlayers.length; j++) {
      await supabase
        .from('tournament_match_players')
        .insert({
          match_id: match.id,
          user_id: matchPlayers[j].user_id,
          seed_position: j + 1
        });
    }

    matches.push(match);
  }

  // Update tournament status
  await supabase
    .from('tournaments')
    .update({ status: 'in_progress' })
    .eq('id', tournamentId);

  console.log('[tournament-api] Tournament started with', matches.length, 'matches');
  return jsonResponse({ success: true, matches });
}

// ACTION: GET - Get tournament details
async function handleGet(supabase: SupabaseClientType, data: GetTournamentRequest) {
  console.log('[tournament-api] GET action started');
  
  const { tournamentId } = data;

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_participants(
        id,
        user_id,
        status,
        final_position,
        registered_at
      ),
      tournament_matches(
        id,
        round_number,
        match_number,
        status,
        winner_user_id,
        ludo_game_id
      )
    `)
    .eq('id', tournamentId)
    .single();

  if (error) {
    console.error('[tournament-api] Get error:', error);
    return errorResponse('Tournament not found', 404);
  }

  return jsonResponse({ tournament });
}

// ACTION: LIST - List tournaments
async function handleList(supabase: SupabaseClientType, data: ListTournamentsRequest) {
  console.log('[tournament-api] LIST action started');
  
  const { status, limit = 20, offset = 0 } = data;

  let query = supabase
    .from('tournaments')
    .select(`
      *,
      tournament_participants(count)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: tournaments, error, count } = await query;

  if (error) {
    console.error('[tournament-api] List error:', error);
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ tournaments, total: count });
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { action, ...data } = body;

    console.log('[tournament-api] Action:', action);

    switch (action) {
      case 'create':
        return handleCreate(supabase, req, data as CreateTournamentRequest);
      case 'join':
        return handleJoin(supabase, req, data as JoinTournamentRequest);
      case 'start':
        return handleStart(supabase, req, data as StartTournamentRequest);
      case 'get':
        return handleGet(supabase, data as GetTournamentRequest);
      case 'list':
        return handleList(supabase, data as ListTournamentsRequest);
      default:
        return errorResponse('Invalid action. Valid actions: create, join, start, get, list');
    }
  } catch (error) {
    console.error('[tournament-api] Unexpected error:', error);
    return errorResponse('Internal server error', 500);
  }
});
