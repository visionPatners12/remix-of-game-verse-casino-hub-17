
-- Migration: Database restructuring by functional domains (avoiding Supabase conflicts)
-- Step 1: Schema creation with app_ prefix to avoid conflicts

-- Schema for user management (avoiding conflict with auth schema)
CREATE SCHEMA IF NOT EXISTS app_users;

-- Schema for betting and markets
CREATE SCHEMA IF NOT EXISTS app_bets;

-- Schema for social features
CREATE SCHEMA IF NOT EXISTS app_social;

-- Schema for games and game sessions
CREATE SCHEMA IF NOT EXISTS app_games;

-- Schema for payments and wallets
CREATE SCHEMA IF NOT EXISTS app_payments;

-- Schema for communication (chat, messages)
CREATE SCHEMA IF NOT EXISTS app_communication;

-- Schema for store and items
CREATE SCHEMA IF NOT EXISTS app_store;

-- Schema for tournaments
CREATE SCHEMA IF NOT EXISTS app_tournaments;

-- Schema for news
CREATE SCHEMA IF NOT EXISTS app_news;

-- Schema for logs and audit
CREATE SCHEMA IF NOT EXISTS app_logging;

-- Step 2: Table migration to new schemas
-- Check if tables exist in public schema before moving

-- USER MANAGEMENT: User related tables (avoiding auth conflict)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users SET SCHEMA app_users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kyc_requests') THEN
    ALTER TABLE public.kyc_requests SET SCHEMA app_users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    ALTER TABLE public.documents SET SCHEMA app_users;
  END IF;
END $$;

-- BETS: Betting related tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'p2p_bets') THEN
    ALTER TABLE public.p2p_bets SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'p2p_orders') THEN
    ALTER TABLE public.p2p_orders SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bet_transactions') THEN
    ALTER TABLE public.bet_transactions SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_types') THEN
    ALTER TABLE public.market_types SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_odds_snapshot') THEN
    ALTER TABLE public.market_odds_snapshot SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_pool_relations') THEN
    ALTER TABLE public.market_pool_relations SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_pools') THEN
    ALTER TABLE public.market_pools SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_odds') THEN
    ALTER TABLE public.match_odds SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sport_matches') THEN
    ALTER TABLE public.sport_matches SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sport_leagues') THEN
    ALTER TABLE public.sport_leagues SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lineups') THEN
    ALTER TABLE public.lineups SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'featured_matches') THEN
    ALTER TABLE public.featured_matches SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forecasts') THEN
    ALTER TABLE public.forecasts SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forecast_posts') THEN
    ALTER TABLE public.forecast_posts SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forecast_earnings') THEN
    ALTER TABLE public.forecast_earnings SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bettor_stats') THEN
    ALTER TABLE public.bettor_stats SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'duo_bets') THEN
    ALTER TABLE public.duo_bets SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hashtags') THEN
    ALTER TABLE public.hashtags SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_opinions') THEN
    ALTER TABLE public.match_opinions SET SCHEMA app_bets;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'top_goalscorers') THEN
    ALTER TABLE public.top_goalscorers SET SCHEMA app_bets;
  END IF;
END $$;

-- SOCIAL: Social interaction tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_posts') THEN
    ALTER TABLE public.social_posts SET SCHEMA app_social;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_follows') THEN
    ALTER TABLE public.user_follows SET SCHEMA app_social;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'follow_requests') THEN
    ALTER TABLE public.follow_requests SET SCHEMA app_social;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'friendship_requests') THEN
    ALTER TABLE public.friendship_requests SET SCHEMA app_social;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'friendships') THEN
    ALTER TABLE public.friendships SET SCHEMA app_social;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'live_streams') THEN
    ALTER TABLE public.live_streams SET SCHEMA app_social;
  END IF;
END $$;

-- GAMES: Game related tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_sessions') THEN
    ALTER TABLE public.game_sessions SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_players') THEN
    ALTER TABLE public.game_players SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_types') THEN
    ALTER TABLE public.game_types SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'arena_game_sessions') THEN
    ALTER TABLE public.arena_game_sessions SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'arena_players') THEN
    ALTER TABLE public.arena_players SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ludo_players') THEN
    ALTER TABLE public.ludo_players SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'checkers_players') THEN
    ALTER TABLE public.checkers_players SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'checkgame_players') THEN
    ALTER TABLE public.checkgame_players SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards') THEN
    ALTER TABLE public.cards SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fut_players') THEN
    ALTER TABLE public.fut_players SET SCHEMA app_games;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'featured_games') THEN
    ALTER TABLE public.featured_games SET SCHEMA app_games;
  END IF;
END $$;

-- PAYMENTS: Payment related tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallets') THEN
    ALTER TABLE public.wallets SET SCHEMA app_payments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
    ALTER TABLE public.transactions SET SCHEMA app_payments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crypto_payments') THEN
    ALTER TABLE public.crypto_payments SET SCHEMA app_payments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mobile_money_transactions') THEN
    ALTER TABLE public.mobile_money_transactions SET SCHEMA app_payments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'currency_rates') THEN
    ALTER TABLE public.currency_rates SET SCHEMA app_payments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'casino_settings') THEN
    ALTER TABLE public.casino_settings SET SCHEMA app_payments;
  END IF;
END $$;

-- COMMUNICATION: Communication related tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
    ALTER TABLE public.chat_messages SET SCHEMA app_communication;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'direct_messages') THEN
    ALTER TABLE public.direct_messages SET SCHEMA app_communication;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE public.notifications SET SCHEMA app_communication;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_gifs') THEN
    ALTER TABLE public.chat_gifs SET SCHEMA app_communication;
  END IF;
END $$;

-- STORE: Store and items tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'items') THEN
    ALTER TABLE public.items SET SCHEMA app_store;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_items') THEN
    ALTER TABLE public.user_items SET SCHEMA app_store;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'avatars') THEN
    ALTER TABLE public.avatars SET SCHEMA app_store;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_words') THEN
    ALTER TABLE public.chat_words SET SCHEMA app_store;
  END IF;
END $$;

-- TOURNAMENTS: Tournament related tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournaments') THEN
    ALTER TABLE public.tournaments SET SCHEMA app_tournaments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_participants') THEN
    ALTER TABLE public.tournament_participants SET SCHEMA app_tournaments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_matches') THEN
    ALTER TABLE public.tournament_matches SET SCHEMA app_tournaments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_prizes') THEN
    ALTER TABLE public.tournament_prizes SET SCHEMA app_tournaments;
  END IF;
END $$;

-- NEWS: News related tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_articles') THEN
    ALTER TABLE public.news_articles SET SCHEMA app_news;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_categories') THEN
    ALTER TABLE public.news_categories SET SCHEMA app_news;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_tags') THEN
    ALTER TABLE public.news_tags SET SCHEMA app_news;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_article_tags') THEN
    ALTER TABLE public.news_article_tags SET SCHEMA app_news;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_article_likes') THEN
    ALTER TABLE public.news_article_likes SET SCHEMA app_news;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_article_views') THEN
    ALTER TABLE public.news_article_views SET SCHEMA app_news;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_comments') THEN
    ALTER TABLE public.news_comments SET SCHEMA app_news;
  END IF;
END $$;

-- LOGGING: Logs and audit tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    ALTER TABLE public.audit_logs SET SCHEMA app_logging;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_activity_logs') THEN
    ALTER TABLE public.admin_activity_logs SET SCHEMA app_logging;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_activity_logs') THEN
    ALTER TABLE public.game_activity_logs SET SCHEMA app_logging;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_session_logs') THEN
    ALTER TABLE public.user_session_logs SET SCHEMA app_logging;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_activity_logs') THEN
    ALTER TABLE public.financial_activity_logs SET SCHEMA app_logging;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_performance_logs') THEN
    ALTER TABLE public.system_performance_logs SET SCHEMA app_logging;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_geo_data') THEN
    ALTER TABLE public.user_geo_data SET SCHEMA app_logging;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'latest_user_geo') THEN
    ALTER TABLE public.latest_user_geo SET SCHEMA app_logging;
  END IF;
END $$;

-- Schema documentation
COMMENT ON SCHEMA app_users IS 'User management and profile tables';
COMMENT ON SCHEMA app_bets IS 'Betting, markets and forecasting tables';
COMMENT ON SCHEMA app_social IS 'Social interaction tables';
COMMENT ON SCHEMA app_games IS 'Games and game session tables';
COMMENT ON SCHEMA app_payments IS 'Payment and wallet tables';
COMMENT ON SCHEMA app_communication IS 'Communication tables';
COMMENT ON SCHEMA app_store IS 'Store and item tables';
COMMENT ON SCHEMA app_tournaments IS 'Tournament tables';
COMMENT ON SCHEMA app_news IS 'News tables';
COMMENT ON SCHEMA app_logging IS 'Logging and audit tables';
