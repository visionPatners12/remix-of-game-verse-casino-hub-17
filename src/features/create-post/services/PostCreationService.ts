import { PostMediaService } from '@/services/postMediaService';
import { createOpinion } from '@/services/getstream/streamService';
import { socialClient, supabase, sportsDataClient } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type { MediaFile } from '../types/creation';
import { buildMatchData, extractMarketData, buildCombinedFilterTags, type FilterTagsInput } from '../utils';
import { DEFAULT_PREDICTION_STATUS, DEFAULT_BET_STATUS, type PredictionStatus, type BetStatus } from '@/types/database/enums';
import { generateMatchHashtags } from '@/utils/hashtagUtils';


export class PostCreationService {
  /**
   * Create and post a simple post
   */
  static async createSimplePost(
    client: any,
    content: string,
    hashtags: string[],
    mediaFiles: MediaFile[],
    user: any,
    profile: any,
    isPremiumTip: boolean = false
  ) {
    try {
      // 1️⃣ Upload des médias dans Supabase Storage
      let uploadedMedia: any[] = [];
      if (mediaFiles.length > 0) {
        uploadedMedia = await PostMediaService.uploadMultipleMedia(
          mediaFiles.map(m => m.file),
          user.id
        );
      }

      // 2️⃣ Insérer le post avec les médias en JSONB (UNE SEULE INSERTION)
      const { data: simplePost, error: postError } = await socialClient
        .from('simple_posts')
        .insert({
          user_id: user.id,
          content,
          hashtags,
          media: uploadedMedia.map((m, index) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            storagePath: m.storagePath,
            fileSizeBytes: m.fileSizeBytes,
            mimeType: m.mimeType,
            position: index
          }))
        })
        .select()
        .single();

      if (postError) throw postError;

      // 3️⃣ Préparer l'activité GetStream avec structure standardisée
      const activity = {
        verb: 'simple_post',
        object: `simple_post:${simplePost.id}`,
        content,
        hashtags: hashtags.map(tag => `#${tag}`).join(' '),
        
        // Structure média standardisée (compatible affichage)
        media: uploadedMedia.map(m => ({
          id: m.id,
          type: m.type,
          url: m.url,
          alt: `${m.type} by ${profile.username}`
        })),
        
        // Métadonnées
        postType: 'simple',
        simplePostId: simplePost.id,
        authorId: profile.id,
        authorUsername: profile.username,
        authorFullName: profile.fullName,
        authorAvatar: profile.avatar || null,
        isPremium: isPremiumTip,
        to: [`timeline:${profile.id}`]
      };

      // 4️⃣ Poster sur GetStream (premium_tips ou user feed)
      const feedType = isPremiumTip ? 'premium_tips' : 'user';
      const streamResponse = await client.feed(feedType, profile.id).addActivity(activity);

      // 5️⃣ Mettre à jour le simple_post avec le stream_activity_id
      await socialClient
        .from('simple_posts')
        .update({ stream_activity_id: streamResponse.id })
        .eq('id', simplePost.id);

      return true;
    } catch (error) {
      console.error('Error creating simple post:', error);
      throw error;
    }
  }

  /**
   * Create and post a prediction
   */
  static async createPrediction(
    client: any,
    selectedPrediction: any,
    content: string,
    confidence: number,
    hashtags: string[],
    isPremiumTip: boolean,
    user: any,
    profile: any
  ) {
    try {
      const predictionId = crypto.randomUUID();
      const dbConfidence = Math.max(1, Math.min(5, Math.ceil(confidence / 20))) as 1 | 2 | 3 | 4 | 5;
      const selections = selectedPrediction.selections || [selectedPrediction];
      
      // We'll fill allHashtags after processing selections
      let allHashtags = [...hashtags];
      
      // 1️⃣ Pour chaque selection: fetch stg_azuro_games + enrichir
      const streamSelections = [];
      const selectionsToInsert: any[] = [];
      
      for (const sel of selections) {
        const marketData = extractMarketData(sel);
        const matchData = buildMatchData(sel);
        
        // Insert basique dans selections
        const selectionData: any = {
          prediction_id: predictionId,
          match_data: matchData,
          market_type: marketData.marketType,
          pick: marketData.pick,
          odds: marketData.odds,
          condition_id: sel.conditionId,
          outcome_id: sel.outcomeId
        };
        
        // Enrichissement optionnel via stg_azuro_games
        let sportId = null, sportName = null;
        let leagueId = null, leagueName = null, leagueLogo = null;
        let homeTeamId = null, homeTeamName = null;
        let awayTeamId = null, awayTeamName = null;
        let stgGame: any = null;
        
        if (sel.gameId) {
          selectionData.azuro_id = sel.gameId;
          
          // Fetch depuis sports_data.stg_azuro_games avec JOINs
          // Note: on utilise league_info pour le JOIN afin de garder la colonne texte 'league'
          const { data: stgGameData, error: stgError } = await sportsDataClient
            .from('stg_azuro_games')
            .select(`
              *,
              sport:sport_id(id, name, slug),
              league_info:league_id(id, name, slug, logo)
            `)
            .eq('azuro_game_id', sel.gameId)
            .maybeSingle();
          
          stgGame = stgGameData;

          if (stgError) {
            console.error(`[ERROR] Failed to lookup stg_azuro_games for gameId ${sel.gameId}:`, stgError);
          }

          if (!stgGame) {
            console.warn(`[WARN] No stg_azuro_games data for gameId ${sel.gameId}`);
            // Fallback sur données Azuro transformées - utiliser sel.league si matchData.league est Unknown
            sportName = matchData.sport !== 'Unknown Sport' ? matchData.sport : (sel.sport || 'Unknown Sport');
            leagueName = matchData.league !== 'Unknown League' 
              ? matchData.league 
              : (sel.league || sel.leagueName || null);
            homeTeamName = matchData.participants?.[0]?.name || matchData.homeTeam || 'Home';
            awayTeamName = matchData.participants?.[1]?.name || matchData.awayTeam || 'Away';
          } else {
            // sport_id est TOUJOURS présent
            sportId = stgGame.sport_id;
            sportName = (stgGame.sport as any)?.name || 'Unknown Sport';

            // Si league_id est présent, utiliser le JOIN (league_info)
            if (stgGame.league_id && stgGame.league_info) {
              leagueId = stgGame.league_id;
              leagueName = stgGame.league_info.name;
              leagueLogo = stgGame.league_info.logo || null;
            } else if (stgGame.league) {
              // league_id NULL mais on a le nom texte original : chercher la league
              const { data: leagueData } = await sportsDataClient
                .from('league')
                .select('id, name, logo')
                .eq('name', stgGame.league)
                .eq('sport_id', sportId)
                .maybeSingle();
              
              if (leagueData) {
                leagueId = leagueData.id;
                leagueName = leagueData.name;
                leagueLogo = leagueData.logo;
              } else {
                leagueName = stgGame.league; // ✅ Garder le texte original
              }
            }

            // Équipes : utiliser IDs si présents, sinon noms texte
            homeTeamId = stgGame.home_team_id || null;
            homeTeamName = stgGame.home || matchData.participants?.[0]?.name || 'Home';
            
            awayTeamId = stgGame.away_team_id || null;
            awayTeamName = stgGame.away || matchData.participants?.[1]?.name || 'Away';
            
            // ✅ Utiliser la vraie date du match depuis stg_azuro_games
            if (stgGame.start_iso) {
              matchData.startsAt = stgGame.start_iso;
            }
          }
        }
        
        // Utiliser l'ID de stg_azuro_games directement (la FK pointe vers cette table)
        const matchId = stgGame?.id || null;
        
        // Enrichir participants avec les logos depuis teams
        let enrichedParticipants = matchData.participants || [];
        if (homeTeamId && awayTeamId) {
          const { data: teamsData } = await sportsDataClient
            .from('teams')
            .select('id, name, logo')
            .in('id', [homeTeamId, awayTeamId]);
          
          if (teamsData && teamsData.length > 0) {
            const homeTeam = teamsData.find(t => t.id === homeTeamId);
            const awayTeam = teamsData.find(t => t.id === awayTeamId);
            
            enrichedParticipants = [
              {
                name: homeTeamName || matchData.homeTeam,
                image: homeTeam?.logo || null
              },
              {
                name: awayTeamName || matchData.awayTeam,
                image: awayTeam?.logo || null
              }
            ];
          }
        }
        
        // Ajouter les UUID dans selectionData
        if (sportId) selectionData.sport_id = sportId;
        if (leagueId) selectionData.league_id = leagueId;
        if (homeTeamId) selectionData.home_team_id = homeTeamId;
        if (awayTeamId) selectionData.away_team_id = awayTeamId;
        if (matchId) selectionData.match_id = matchId;
        if (homeTeamName) selectionData.home_team_name = homeTeamName;
        if (awayTeamName) selectionData.away_team_name = awayTeamName;
        if (leagueName) selectionData.league_name = leagueName;
        if (leagueLogo) selectionData.league_logo = leagueLogo;
        
        // Utiliser stgGame.start_iso en priorité, puis matchData.startsAt
        if (stgGame?.start_iso) {
          selectionData.starts_at = new Date(stgGame.start_iso).toISOString();
        } else if (matchData.startsAt) {
          selectionData.starts_at = typeof matchData.startsAt === 'number' 
            ? new Date(matchData.startsAt).toISOString()
            : matchData.startsAt;
        }
        
        
        // Add team logos from enrichedParticipants
        if (enrichedParticipants[0]?.image) selectionData.home_team_image = enrichedParticipants[0].image;
        if (enrichedParticipants[1]?.image) selectionData.away_team_image = enrichedParticipants[1].image;
        
        // Collecter pour insertion après la prediction (FK constraint)
        selectionsToInsert.push(selectionData);
        
        
        // Préparer pour GetStream
        streamSelections.push({
          marketType: marketData.marketType,
          pick: marketData.pick,
          odds: marketData.odds,
          conditionId: sel.conditionId,
          outcomeId: sel.outcomeId,
          azuroId: sel.gameId,
          matchName: matchData.matchName,
          homeTeam: homeTeamName || matchData.homeTeam,
          awayTeam: awayTeamName || matchData.awayTeam,
          league: leagueName || matchData.league,
          leagueLogo: leagueLogo || null,
          sport: sportName || matchData.sport,
          startsAt: matchData.startsAt,
          participants: enrichedParticipants,
          leagueId,
          sportId,
          homeTeamId,
          awayTeamId
        });
      }
      
      // Generate auto hashtags from first selection
      if (streamSelections.length > 0) {
        const first = streamSelections[0];
        // Use ONLY auto-generated hashtags (league + homeTeam + awayTeam)
        allHashtags = generateMatchHashtags(first.league, first.homeTeam, first.awayTeam);
      }
      
      // 2️⃣ INSERT prediction with auto hashtags
      const { error: predError } = await socialClient
        .schema('social_post')
        .from('predictions')
        .insert({
          id: predictionId,
          user_id: user.id,
          analysis: content,
          confidence: dbConfidence,
          hashtags: allHashtags
        });
      
      if (predError) throw new Error(`Échec prediction: ${predError.message}`);
      
      // Insert all selections now that prediction exists
      for (const selectionData of selectionsToInsert) {
        const { error: selError } = await socialClient
          .schema('social_post')
          .from('selections')
          .insert(selectionData);
        
        if (selError) throw new Error(`Échec sélection: ${selError.message}`);
      }
      
      // 3️⃣ POST to GetStream
      const predictionType = selections.length > 1 ? 'combiné' : 'simple';
      
      // Build filter_tags for GetStream filtering
      const filterTagsInputs: FilterTagsInput[] = streamSelections.map(sel => ({
        azuroGameId: sel.azuroId,
        leagueId: sel.leagueId || undefined,
        homeTeamId: sel.homeTeamId || undefined,
        awayTeamId: sel.awayTeamId || undefined
      }));
      const filter_tags = buildCombinedFilterTags(filterTagsInputs);
      
      const streamActivity = {
        id: predictionId,
        verb: 'predict',
        object: `prediction:${predictionId}`,
        time: new Date().toISOString(),
        selections: streamSelections,
        filter_tags,
        analysis: content,
        confidence: dbConfidence,
        hashtags: allHashtags,
        prediction_type: predictionType,
        totalOdds: selectedPrediction.totalOdds,
        isPremium: isPremiumTip,
        ...(selections.length === 1 && streamSelections[0] && {
          match: {
            id: selections[0].gameId,
            azuroId: selections[0].gameId,
            
            // Add IDs for PredictionData compatibility
            homeId: streamSelections[0].homeTeamId || '',
            homeName: streamSelections[0].homeTeam,
            awayId: streamSelections[0].awayTeamId || '',
            awayName: streamSelections[0].awayTeam,
            
            league: streamSelections[0].league,
            leagueLogo: streamSelections[0].leagueLogo || null,
            leagueId: streamSelections[0].leagueId || '',
            
            sport: streamSelections[0].sport,
            sportId: streamSelections[0].sportId,
            
            date: streamSelections[0].startsAt,
            startsAt: streamSelections[0].startsAt,
          }
        })
      };
      
      const feedType = isPremiumTip ? 'premium_tips' : 'user';
      const feed = client.feed(feedType, user.id);

      const response = await feed.addActivity({
        ...streamActivity,
        to: [`timeline:${user.id}`]
      });
      
      // 4️⃣ UPDATE with stream_activity_id
      await socialClient
        .schema('social_post')
        .from('predictions')
        .update({ stream_activity_id: response.id })
        .eq('id', predictionId);
      
      
      return true;
    } catch (error) {
      logger.error('❌ Error creating prediction', error);
      throw error;
    }
  }

  /**
   * Create and post a bet (same as prediction + amount)
   */
  static async createBet(
    client: any,
    selectedPrediction: any,
    content: string,
    confidence: number,
    hashtags: string[],
    visibility: 'public' | 'private',
    amount: number,
    user: any,
    profile: any,
    isPremiumTip: boolean = false
  ) {
    try {
      const betId = crypto.randomUUID();
      const dbConfidence = Math.max(1, Math.min(5, Math.ceil(confidence / 20))) as 1 | 2 | 3 | 4 | 5;
      const selections = selectedPrediction.selections || [selectedPrediction];
      
      // We'll fill allHashtags after processing selections
      let allHashtags = [...hashtags];
      
      // 1️⃣ Pour chaque selection: fetch stg_azuro_games + enrichir
      const streamSelections = [];
      const selectionsToInsert: any[] = [];
      
      for (const sel of selections) {
        try {

          const marketData = extractMarketData(sel);
          const matchData = buildMatchData(sel);
          
          // Enrichissement optionnel via stg_azuro_games
          let sportId = null, sportName = null;
          let leagueId = null, leagueName = null, leagueLogo = null;
          let homeTeamId = null, homeTeamName = null;
          let awayTeamId = null, awayTeamName = null;
          let matchId = null;
          let stgGame: any = null;
          
          if (sel.gameId) {
            // Fetch depuis sports_data.stg_azuro_games avec JOINs
            // Note: on utilise league_info pour le JOIN afin de garder la colonne texte 'league'
            const { data: stgGameData, error: stgError } = await sportsDataClient
              .from('stg_azuro_games')
              .select(`
                *,
                sport:sport_id(id, name, slug),
                league_info:league_id(id, name, slug, logo)
              `)
              .eq('azuro_game_id', sel.gameId)
              .maybeSingle();
            
            stgGame = stgGameData;

            if (stgError) {
              console.error(`[ERROR] Failed to lookup stg_azuro_games for gameId ${sel.gameId}:`, stgError);
            }

            if (!stgGame) {
              console.warn(`[WARN] No stg_azuro_games data for gameId ${sel.gameId}`);
              // Fallback sur données Azuro transformées - utiliser sel.league si matchData.league est Unknown
              sportName = matchData.sport !== 'Unknown Sport' ? matchData.sport : (sel.sport || 'Unknown Sport');
              leagueName = matchData.league !== 'Unknown League' 
                ? matchData.league 
                : (sel.league || sel.leagueName || null);
              homeTeamName = matchData.participants?.[0]?.name || matchData.homeTeam || 'Home';
              awayTeamName = matchData.participants?.[1]?.name || matchData.awayTeam || 'Away';
            } else {
              // sport_id est TOUJOURS présent
              sportId = stgGame.sport_id;
              sportName = (stgGame.sport as any)?.name || 'Unknown Sport';

              // Si league_id est présent, utiliser le JOIN (league_info)
              if (stgGame.league_id && stgGame.league_info) {
                leagueId = stgGame.league_id;
                leagueName = stgGame.league_info.name;
                leagueLogo = stgGame.league_info.logo || null;
              } else if (stgGame.league) {
                // league_id NULL mais on a le nom texte original : chercher la league
                const { data: leagueData } = await sportsDataClient
                  .from('league')
                  .select('id, name, logo')
                  .eq('name', stgGame.league)
                  .eq('sport_id', sportId)
                  .maybeSingle();
                
                if (leagueData) {
                  leagueId = leagueData.id;
                  leagueName = leagueData.name;
                  leagueLogo = leagueData.logo;
                } else {
                  leagueName = stgGame.league; // ✅ Garder le texte original
                }
              }

              // Équipes : utiliser IDs si présents, sinon noms texte
              homeTeamId = stgGame.home_team_id || null;
              homeTeamName = stgGame.home || matchData.participants?.[0]?.name || 'Home';
              
              awayTeamId = stgGame.away_team_id || null;
              awayTeamName = stgGame.away || matchData.participants?.[1]?.name || 'Away';
              
              // ✅ Utiliser la vraie date du match depuis stg_azuro_games
              if (stgGame.start_iso) {
                matchData.startsAt = stgGame.start_iso;
              }
            }
          }
        
        // Utiliser l'ID de stg_azuro_games directement (la FK pointe vers cette table)
        matchId = stgGame?.id || null;
        
        // Enrichir participants avec les logos depuis teams
        let enrichedParticipants = matchData.participants || [];
        if (homeTeamId && awayTeamId) {
          const { data: teamsData } = await sportsDataClient
            .from('teams')
            .select('id, name, logo')
            .in('id', [homeTeamId, awayTeamId]);
          
          if (teamsData && teamsData.length > 0) {
            const homeTeam = teamsData.find(t => t.id === homeTeamId);
            const awayTeam = teamsData.find(t => t.id === awayTeamId);
            
            enrichedParticipants = [
              {
                name: homeTeamName || matchData.homeTeam,
                image: homeTeam?.logo || null
              },
              {
                name: awayTeamName || matchData.awayTeam,
                image: awayTeam?.logo || null
              }
            ];
          }
        }
        
        // Insert selection dans social_post.selections
        const selectionInsert: any = {
          bet_id: betId,
          match_data: matchData,
          market_type: marketData.marketType,
          pick: marketData.pick,
          odds: marketData.odds,
          condition_id: sel.conditionId,
          outcome_id: sel.outcomeId
        };
        
        if (sel.gameId) selectionInsert.azuro_id = sel.gameId;
        if (sportId) selectionInsert.sport_id = sportId;
        if (leagueId) selectionInsert.league_id = leagueId;
        if (homeTeamId) selectionInsert.home_team_id = homeTeamId;
        if (awayTeamId) selectionInsert.away_team_id = awayTeamId;
        if (matchId) selectionInsert.match_id = matchId;
        if (homeTeamName) selectionInsert.home_team_name = homeTeamName;
        if (awayTeamName) selectionInsert.away_team_name = awayTeamName;
        if (leagueName) selectionInsert.league_name = leagueName;
        if (leagueLogo) selectionInsert.league_logo = leagueLogo;
        
        // Utiliser stgGame.start_iso en priorité, puis matchData.startsAt
        if (stgGame?.start_iso) {
          selectionInsert.starts_at = new Date(stgGame.start_iso).toISOString();
        } else if (matchData.startsAt) {
          selectionInsert.starts_at = typeof matchData.startsAt === 'number' 
            ? new Date(matchData.startsAt).toISOString()
            : matchData.startsAt;
        }
        
        
        // Add team logos from enrichedParticipants
        if (enrichedParticipants[0]?.image) selectionInsert.home_team_image = enrichedParticipants[0].image;
        if (enrichedParticipants[1]?.image) selectionInsert.away_team_image = enrichedParticipants[1].image;
        
        // Collecter pour insertion après le bet (FK constraint)
        selectionsToInsert.push(selectionInsert);
        
        
        // Préparer pour GetStream
        streamSelections.push({
          marketType: marketData.marketType,
          pick: marketData.pick,
          odds: marketData.odds,
          conditionId: sel.conditionId,
          outcomeId: sel.outcomeId,
          azuroId: sel.gameId,
          matchName: matchData.matchName,
          homeTeam: homeTeamName || matchData.homeTeam,
          awayTeam: awayTeamName || matchData.awayTeam,
          league: leagueName || matchData.league,
          leagueLogo: leagueLogo || null,
          sport: sportName || matchData.sport,
          startsAt: matchData.startsAt,
          participants: enrichedParticipants,
          leagueId,
          sportId,
          homeTeamId,
          awayTeamId
        });
        } catch (selError) {
          console.error(`[ERROR] Failed to process selection:`, selError);
          throw new Error(`Échec sélection: ${selError instanceof Error ? selError.message : 'Unknown error'}`);
        }
      }
      
      // Generate auto hashtags from first selection (ONLY auto-generated)
      if (streamSelections.length > 0) {
        const first = streamSelections[0];
        allHashtags = generateMatchHashtags(first.league, first.homeTeam, first.awayTeam);
      }
      
      // 2️⃣ INSERT bet into social_post.bets
      const { error: betError } = await socialClient
        .from('bets')
        .insert({
          id: betId,
          user_id: user.id,
          analysis: content,
          amount: amount,
          potential_win: selectedPrediction.totalOdds ? amount * selectedPrediction.totalOdds : amount,
          total_odds: selectedPrediction.totalOdds || 1,
          bet_type: selections.length > 1 ? 'combo' : 'single',
          hashtags: allHashtags,
          visibility,
          currency: 'USDT'
        });
      
      if (betError) throw new Error(`Échec bet: ${betError.message}`);
      
      // Insert all selections now that bet exists
      for (const selectionInsert of selectionsToInsert) {
        const { error: selError } = await socialClient
          .schema('social_post')
          .from('selections')
          .insert(selectionInsert);
        
        if (selError) throw new Error(`Échec sélection: ${selError.message}`);
      }
      
      // 3️⃣ POST to GetStream
      const betType = selections.length > 1 ? 'combiné' : 'simple';
      
      // Build filter_tags for GetStream filtering
      const filterTagsInputs: FilterTagsInput[] = streamSelections.map(sel => ({
        azuroGameId: sel.azuroId,
        leagueId: sel.leagueId || undefined,
        homeTeamId: sel.homeTeamId || undefined,
        awayTeamId: sel.awayTeamId || undefined
      }));
      const filter_tags = buildCombinedFilterTags(filterTagsInputs);
      
      const streamActivity = {
        id: betId,
        verb: 'bet',
        object: `bet:${betId}`,
        time: new Date().toISOString(),
        selections: streamSelections,
        filter_tags,
        analysis: content,
        confidence: dbConfidence,
        hashtags: allHashtags,
        bet_type: betType,
        betAmount: amount,
        currency: 'USDT',
        totalOdds: selectedPrediction.totalOdds,
        potentialWin: selectedPrediction.totalOdds ? amount * selectedPrediction.totalOdds : amount,
        ...(selections.length === 1 && streamSelections[0] && {
          match: {
            id: selections[0].gameId,
            azuroId: selections[0].gameId,
            
            homeId: streamSelections[0].homeTeamId || '',
            homeName: streamSelections[0].homeTeam,
            awayId: streamSelections[0].awayTeamId || '',
            awayName: streamSelections[0].awayTeam,
            
            league: streamSelections[0].league,
            leagueLogo: streamSelections[0].leagueLogo || null,
            leagueId: streamSelections[0].leagueId || '',
            
            sport: streamSelections[0].sport,
            sportId: streamSelections[0].sportId,
            
            date: streamSelections[0].startsAt,
            startsAt: streamSelections[0].startsAt,
          }
        }),
        isPremium: isPremiumTip,
      };
      
      const feedType = isPremiumTip ? 'premium_tips' : 'user';
      const feed = client.feed(feedType, user.id);
      const response = await feed.addActivity({
        ...streamActivity,
        to: [`timeline:${user.id}`]
      });
      
      // 4️⃣ UPDATE with stream_activity_id
      await socialClient
        .from('bets')
        .update({ stream_activity_id: response.id } as any)
        .eq('id', betId);
      
      
      return true;
    } catch (error) {
      logger.error('❌ Error creating bet', error);
      throw error;
    }
  }

  /**
   * Create and post an opinion
   */
  static async createOpinion(
    client: any,
    selectedMatch: { matchTitle: string; sport: string; league: string; },
    content: string,
    user: any,
    profile: any,
    isPremiumTip: boolean = false
  ) {
    try {
      // Create opinion via API service
      await createOpinion(
        client,
        {
          matchId: selectedMatch.matchTitle,
          content,
          match: {
            id: selectedMatch.matchTitle,
            teamA: selectedMatch.matchTitle.split(' vs ')[0] || 'Team A',
            teamB: selectedMatch.matchTitle.split(' vs ')[1] || 'Team B',
            leagueName: selectedMatch.league,
            date: new Date().toISOString()
          }
        },
        user.id,
        profile,
        isPremiumTip
      );

      return true;
    } catch (error) {
      console.error('Error creating opinion:', error);
      throw error;
    }
  }
}
