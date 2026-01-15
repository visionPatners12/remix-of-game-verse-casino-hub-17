export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cdp_buy_options: {
        Row: {
          country_code: string
          created_at: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          subdivision_code: string | null
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          subdivision_code?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          subdivision_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cdp_buy_options_cache: {
        Row: {
          country_code: string
          created_at: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          payment_currencies: Json
          purchase_currencies: Json
          raw: Json | null
          subdivision_code: string | null
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          payment_currencies?: Json
          purchase_currencies?: Json
          raw?: Json | null
          subdivision_code?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          payment_currencies?: Json
          purchase_currencies?: Json
          raw?: Json | null
          subdivision_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cdp_supported_countries: {
        Row: {
          country_code: string
          country_name: string
          created_at: string | null
          fiat_currencies: Json
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          payment_methods: Json
          purchase_limits: Json | null
          subdivisions: Json | null
          updated_at: string | null
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string | null
          fiat_currencies?: Json
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          payment_methods?: Json
          purchase_limits?: Json | null
          subdivisions?: Json | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string | null
          fiat_currencies?: Json
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          payment_methods?: Json
          purchase_limits?: Json | null
          subdivisions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          admin_address: string | null
          chain_id: number
          contract_address: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          slug: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          admin_address?: string | null
          chain_id?: number
          contract_address: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          slug: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          admin_address?: string | null
          chain_id?: number
          contract_address?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          slug?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string | null
          device_info: string | null
          id: string
          is_active: boolean | null
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          is_active?: boolean | null
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          is_active?: boolean | null
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fcm_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fcm_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fixture_status_ref: {
        Row: {
          description: string | null
          grp: Database["public"]["Enums"]["fixture_status_group"]
          long: string
          short: string
        }
        Insert: {
          description?: string | null
          grp: Database["public"]["Enums"]["fixture_status_group"]
          long: string
          short: string
        }
        Update: {
          description?: string | null
          grp?: Database["public"]["Enums"]["fixture_status_group"]
          long?: string
          short?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string
          description: string | null
          hashtags: string[] | null
          id: string
          match_id: string | null
          status: Database["public"]["Enums"]["stream_status_enum"]
          title: string
          updated_at: string
          user_id: string
          viewers_count: number
          visibility: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          hashtags?: string[] | null
          id?: string
          match_id?: string | null
          status?: Database["public"]["Enums"]["stream_status_enum"]
          title: string
          updated_at?: string
          user_id: string
          viewers_count?: number
          visibility?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          hashtags?: string[] | null
          id?: string
          match_id?: string | null
          status?: Database["public"]["Enums"]["stream_status_enum"]
          title?: string
          updated_at?: string
          user_id?: string
          viewers_count?: number
          visibility?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_live_streams_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_live_streams_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ludo_game_players: {
        Row: {
          color: Database["public"]["Enums"]["ludo_color_enum"]
          deposit_status: string | null
          game_id: string | null
          has_exited: boolean | null
          id: string
          is_connected: boolean | null
          is_ready: boolean | null
          joined_at: string | null
          last_seen_at: string | null
          position: number | null
          turn_order: number | null
          tx_hash: string | null
          user_id: string | null
        }
        Insert: {
          color: Database["public"]["Enums"]["ludo_color_enum"]
          deposit_status?: string | null
          game_id?: string | null
          has_exited?: boolean | null
          id?: string
          is_connected?: boolean | null
          is_ready?: boolean | null
          joined_at?: string | null
          last_seen_at?: string | null
          position?: number | null
          turn_order?: number | null
          tx_hash?: string | null
          user_id?: string | null
        }
        Update: {
          color?: Database["public"]["Enums"]["ludo_color_enum"]
          deposit_status?: string | null
          game_id?: string | null
          has_exited?: boolean | null
          id?: string
          is_connected?: boolean | null
          is_ready?: boolean | null
          joined_at?: string | null
          last_seen_at?: string | null
          position?: number | null
          turn_order?: number | null
          tx_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ludo_game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "ludo_games"
            referencedColumns: ["id"]
          },
        ]
      }
      ludo_games: {
        Row: {
          bet_amount: number | null
          claim_status: Database["public"]["Enums"]["tx_status_enum"] | null
          claim_tx_hash: string | null
          created_at: string | null
          created_by: string | null
          current_players: number | null
          dice: number | null
          extra_turn_on_six: boolean | null
          finished_at: string | null
          game_name: string | null
          id: string
          is_public: boolean | null
          last_activity_at: string | null
          max_players: number | null
          positions: Json
          pot: number | null
          rev: number
          room_code: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["game_status_enum"]
          turn: Database["public"]["Enums"]["ludo_color_enum"]
          turn_started_at: string | null
          updated_at: string | null
          winner: Database["public"]["Enums"]["ludo_color_enum"] | null
          winner_user_id: string | null
        }
        Insert: {
          bet_amount?: number | null
          claim_status?: Database["public"]["Enums"]["tx_status_enum"] | null
          claim_tx_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          current_players?: number | null
          dice?: number | null
          extra_turn_on_six?: boolean | null
          finished_at?: string | null
          game_name?: string | null
          id?: string
          is_public?: boolean | null
          last_activity_at?: string | null
          max_players?: number | null
          positions?: Json
          pot?: number | null
          rev?: number
          room_code?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["game_status_enum"]
          turn?: Database["public"]["Enums"]["ludo_color_enum"]
          turn_started_at?: string | null
          updated_at?: string | null
          winner?: Database["public"]["Enums"]["ludo_color_enum"] | null
          winner_user_id?: string | null
        }
        Update: {
          bet_amount?: number | null
          claim_status?: Database["public"]["Enums"]["tx_status_enum"] | null
          claim_tx_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          current_players?: number | null
          dice?: number | null
          extra_turn_on_six?: boolean | null
          finished_at?: string | null
          game_name?: string | null
          id?: string
          is_public?: boolean | null
          last_activity_at?: string | null
          max_players?: number | null
          positions?: Json
          pot?: number | null
          rev?: number
          room_code?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["game_status_enum"]
          turn?: Database["public"]["Enums"]["ludo_color_enum"]
          turn_started_at?: string | null
          updated_at?: string | null
          winner?: Database["public"]["Enums"]["ludo_color_enum"] | null
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ludo_games_winner_user_fk"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ludo_games_winner_user_fk"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          full_name: string
          id: number
          logo: string | null
          market_value: Json | null
          name: string | null
          per_club: Json | null
          per_competition: Json | null
          per_season: Json | null
          profile: Json | null
          related_news: Json | null
          rumours: Json | null
          sport: string | null
          transfers: Json | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id: number
          logo?: string | null
          market_value?: Json | null
          name?: string | null
          per_club?: Json | null
          per_competition?: Json | null
          per_season?: Json | null
          profile?: Json | null
          related_news?: Json | null
          rumours?: Json | null
          sport?: string | null
          transfers?: Json | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: number
          logo?: string | null
          market_value?: Json | null
          name?: string | null
          per_club?: Json | null
          per_competition?: Json | null
          per_season?: Json | null
          profile?: Json | null
          related_news?: Json | null
          rumours?: Json | null
          sport?: string | null
          transfers?: Json | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      privy_transactions: {
        Row: {
          asset: string
          caip2: string | null
          chain: string
          created_at: string
          display_value: string | null
          id: string
          privy_created_at: number | null
          privy_transaction_id: string | null
          raw_value: string | null
          raw_value_decimals: number | null
          recipient: string | null
          sender: string | null
          status: string
          transaction_hash: string
          type: string | null
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          asset: string
          caip2?: string | null
          chain: string
          created_at?: string
          display_value?: string | null
          id?: string
          privy_created_at?: number | null
          privy_transaction_id?: string | null
          raw_value?: string | null
          raw_value_decimals?: number | null
          recipient?: string | null
          sender?: string | null
          status?: string
          transaction_hash: string
          type?: string | null
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          asset?: string
          caip2?: string | null
          chain?: string
          created_at?: string
          display_value?: string | null
          id?: string
          privy_created_at?: number | null
          privy_transaction_id?: string | null
          raw_value?: string | null
          raw_value_decimals?: number | null
          recipient?: string | null
          sender?: string | null
          status?: string
          transaction_hash?: string
          type?: string | null
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "privy_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privy_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          n1_id: string | null
          n2_id: string | null
          n3_id: string | null
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          n1_id?: string | null
          n2_id?: string | null
          n3_id?: string | null
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          n1_id?: string | null
          n2_id?: string | null
          n3_id?: string | null
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_n1_id_fkey"
            columns: ["n1_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_n1_id_fkey"
            columns: ["n1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_n2_id_fkey"
            columns: ["n2_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_n2_id_fkey"
            columns: ["n2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_n3_id_fkey"
            columns: ["n3_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_n3_id_fkey"
            columns: ["n3_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_from_support: boolean
          sender_id: string | null
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_from_support?: boolean
          sender_id?: string | null
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_from_support?: boolean
          sender_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: Database["public"]["Enums"]["ticket_category_enum"]
          closed_at: string | null
          created_at: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority_enum"]
          status: Database["public"]["Enums"]["ticket_status_enum"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["ticket_category_enum"]
          closed_at?: string | null
          created_at?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority_enum"]
          status?: Database["public"]["Enums"]["ticket_status_enum"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["ticket_category_enum"]
          closed_at?: string | null
          created_at?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority_enum"]
          status?: Database["public"]["Enums"]["ticket_status_enum"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tipster_profiles: {
        Row: {
          avg_odds: number | null
          created_at: string | null
          description: string
          experience: string | null
          id: string
          is_active: boolean | null
          monthly_price: number
          split_contract_address: string | null
          split_queue_id: string | null
          sport_1_id: string | null
          sport_2_id: string | null
          sport_3_id: string | null
          tips_total: number | null
          tips_won: number | null
          updated_at: string | null
          user_id: string
          yield_pct: number | null
        }
        Insert: {
          avg_odds?: number | null
          created_at?: string | null
          description: string
          experience?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price: number
          split_contract_address?: string | null
          split_queue_id?: string | null
          sport_1_id?: string | null
          sport_2_id?: string | null
          sport_3_id?: string | null
          tips_total?: number | null
          tips_won?: number | null
          updated_at?: string | null
          user_id?: string
          yield_pct?: number | null
        }
        Update: {
          avg_odds?: number | null
          created_at?: string | null
          description?: string
          experience?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price?: number
          split_contract_address?: string | null
          split_queue_id?: string | null
          sport_1_id?: string | null
          sport_2_id?: string | null
          sport_3_id?: string | null
          tips_total?: number | null
          tips_won?: number | null
          updated_at?: string | null
          user_id?: string
          yield_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tipster_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipster_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tipster_subscriptions: {
        Row: {
          amount: number | null
          created_at: string | null
          from_address: string | null
          id: string
          status: string
          subscriber_id: string
          subscription_end: string | null
          subscription_start: string | null
          tipster_profile_id: string
          tx_hash: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          from_address?: string | null
          id?: string
          status?: string
          subscriber_id: string
          subscription_end?: string | null
          subscription_start?: string | null
          tipster_profile_id: string
          tx_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          from_address?: string | null
          id?: string
          status?: string
          subscriber_id?: string
          subscription_end?: string | null
          subscription_start?: string | null
          tipster_profile_id?: string
          tx_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tipster_subscriptions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipster_subscriptions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipster_subscriptions_tipster_profile_id_fkey"
            columns: ["tipster_profile_id"]
            isOneToOne: false
            referencedRelation: "tipster_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      top_entities: {
        Row: {
          country_name: string | null
          created_at: string | null
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          id: string
          league_id: string | null
          logo: string | null
          slug: string
          sport_id: string
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          country_name?: string | null
          created_at?: string | null
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          id?: string
          league_id?: string | null
          logo?: string | null
          slug: string
          sport_id: string
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          country_name?: string | null
          created_at?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type_enum"]
          id?: string
          league_id?: string | null
          logo?: string | null
          slug?: string
          sport_id?: string
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tx_status: {
        Row: {
          amount_wei: number | null
          chain_id: number
          confirmations: number
          created_at: string
          details: Json | null
          last_error: string | null
          min_confirmations: number
          status: Database["public"]["Enums"]["tx_status_enum"]
          to_address: string
          token_address: string | null
          token_id: number | null
          tx_hash: string
          type: Database["public"]["Enums"]["tx_type_enum"]
          updated_at: string
        }
        Insert: {
          amount_wei?: number | null
          chain_id: number
          confirmations?: number
          created_at?: string
          details?: Json | null
          last_error?: string | null
          min_confirmations?: number
          status?: Database["public"]["Enums"]["tx_status_enum"]
          to_address: string
          token_address?: string | null
          token_id?: number | null
          tx_hash: string
          type?: Database["public"]["Enums"]["tx_type_enum"]
          updated_at?: string
        }
        Update: {
          amount_wei?: number | null
          chain_id?: number
          confirmations?: number
          created_at?: string
          details?: Json | null
          last_error?: string | null
          min_confirmations?: number
          status?: Database["public"]["Enums"]["tx_status_enum"]
          to_address?: string
          token_address?: string | null
          token_id?: number | null
          tx_hash?: string
          type?: Database["public"]["Enums"]["tx_type_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      user_favorite_polymarket_tags: {
        Row: {
          created_at: string
          id: string
          position: number
          tag_id: string
          tag_label: string
          tag_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          tag_id: string
          tag_label: string
          tag_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          tag_id?: string
          tag_label?: string
          tag_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pin: {
        Row: {
          created_at: string
          failed_attempts: number
          hashed_pin: string
          id: string
          last_used_at: string | null
          locked_until: string | null
          pin_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_attempts?: number
          hashed_pin: string
          id?: string
          last_used_at?: string | null
          locked_until?: string | null
          pin_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          failed_attempts?: number
          hashed_pin?: string
          id?: string
          last_used_at?: string | null
          locked_until?: string | null
          pin_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          id: string
          league_id: string | null
          player_id: string | null
          position: number
          sport_id: string | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_type?: Database["public"]["Enums"]["entity_type_enum"]
          id?: string
          league_id?: string | null
          player_id?: string | null
          position: number
          sport_id?: string | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          entity_type?: Database["public"]["Enums"]["entity_type_enum"]
          id?: string
          league_id?: string | null
          player_id?: string | null
          position?: number
          sport_id?: string | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallet: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          updated_at: string | null
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
          wallet_type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wallet_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_wallet_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_method: Database["public"]["Enums"]["auth_method_enum"] | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          email_enabled: boolean | null
          ens_subdomain: string | null
          first_name: string | null
          id: string
          is_profile_public: boolean | null
          last_name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          phone_number: string | null
          phone_verified: boolean | null
          privy_user_id: string | null
          push_enabled: boolean | null
          referral_code: string | null
          updated_at: string | null
          username: string | null
          view_count: number | null
          wallet_address: string | null
        }
        Insert: {
          auth_method?: Database["public"]["Enums"]["auth_method_enum"] | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_enabled?: boolean | null
          ens_subdomain?: string | null
          first_name?: string | null
          id: string
          is_profile_public?: boolean | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          privy_user_id?: string | null
          push_enabled?: boolean | null
          referral_code?: string | null
          updated_at?: string | null
          username?: string | null
          view_count?: number | null
          wallet_address?: string | null
        }
        Update: {
          auth_method?: Database["public"]["Enums"]["auth_method_enum"] | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_enabled?: boolean | null
          ens_subdomain?: string | null
          first_name?: string | null
          id?: string
          is_profile_public?: boolean | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          privy_user_id?: string | null
          push_enabled?: boolean | null
          referral_code?: string | null
          updated_at?: string | null
          username?: string | null
          view_count?: number | null
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          is_profile_public: boolean | null
          last_name: string | null
          username: string | null
          view_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_profile_public?: boolean | null
          last_name?: string | null
          username?: string | null
          view_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_profile_public?: boolean | null
          last_name?: string | null
          username?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _qualified_type_of_leagues_competition_type: {
        Args: never
        Returns: string
      }
      all_players_ready: { Args: { game_id: string }; Returns: boolean }
      apply_azuro_staging_row: { Args: { _row_id: number }; Returns: boolean }
      apply_highlightly_staging_row: {
        Args: { p_id: number }
        Returns: boolean
      }
      azuro_link_exact_v1: {
        Args: { _items: Json; _sport_id: string }
        Returns: {
          applied: boolean
          apply_reason: string
          az_name: string
          az_slug: string
          idx: number
          team_id: string
        }[]
      }
      azuro_match_and_link_bulk_v1: {
        Args: {
          _cand_limit?: number
          _items: Json
          _low_th?: number
          _sport_id: string
          _th?: number
        }
        Returns: {
          az_name: string
          az_slug: string
          country_id: string
          idx: number
          league_id: string
          matched: boolean
          method: string
          near_miss: boolean
          score: number
          top_candidates: Json
        }[]
      }
      azuro_match_and_link_teams_bulk_nc_v1: {
        Args: {
          _cand_limit?: number
          _items: Json
          _low_th?: number
          _sport_id: string
          _th?: number
        }
        Returns: {
          applied: boolean
          apply_reason: string
          az_name: string
          az_slug: string
          idx: number
          matched: boolean
          method: string
          near_miss: boolean
          score: number
          team_id: string
          top_candidates: Json
        }[]
      }
      azuro_match_and_link_teams_bulk_v1: {
        Args: {
          _cand_limit?: number
          _items: Json
          _low_th?: number
          _sport_id: string
          _th?: number
        }
        Returns: {
          applied: boolean
          apply_reason: string
          az_id: string
          az_name: string
          az_slug: string
          idx: number
          matched: boolean
          method: string
          near_miss: boolean
          score: number
          team_id: string
          top_candidates: Json
        }[]
      }
      azuro_match_and_link_teams_bulk_v2: {
        Args: {
          _cand_limit?: number
          _items: Json
          _low_th?: number
          _sport_id: string
          _th?: number
        }
        Returns: {
          applied: boolean
          apply_reason: string
          az_name: string
          az_slug: string
          idx: number
          matched: boolean
          method: string
          near_miss: boolean
          score: number
          team_id: string
          top_candidates: Json
        }[]
      }
      azuro_participants_stage_upsert: {
        Args: { p_rows: Json[]; p_sport: string }
        Returns: Json
      }
      best_league_match_noslug: {
        Args: {
          _country_code?: string
          _sport_id: string
          _threshold: number
          q: string
        }
        Returns: {
          id: string
          reason: string
          sim: number
        }[]
      }
      extract_user_id_from_path: { Args: { path: string }; Returns: string }
      generate_all_team_usernames: {
        Args: never
        Returns: {
          team_id: string
          team_name: string
          username: string
        }[]
      }
      generate_bet_code: { Args: never; Returns: string }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      generate_room_code: { Args: never; Returns: string }
      generate_team_username: {
        Args: { country_code: string; team_slug: string }
        Returns: string
      }
      get_azuro_game_uuid: {
        Args: { p_azuro_game_id: string }
        Returns: string
      }
      get_entity_followers_count: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: number
      }
      get_for_you_feed: {
        Args: {
          p_highlights_limit?: number
          p_past_limit?: number
          p_upcoming_limit?: number
          p_user_id: string
        }
        Returns: Json
      }
      get_highlights: {
        Args: {
          p_cursor?: string
          p_league_id?: string
          p_limit?: number
          p_sport_id?: string
          p_team_id?: string
          p_user_id?: string
        }
        Returns: {
          away_team: Json
          away_team_id: string
          created_at: string
          description: string
          duration_seconds: number
          embed_url: string
          highlightly_id: number
          home_team: Json
          home_team_id: string
          id: string
          image_url: string
          league: Json
          league_id: string
          match: Json
          match_date: string
          match_reason: string
          relevance_score: number
          source: string
          sport_id: string
          title: string
          type: Database["public"]["Enums"]["highlight_type"]
          updated_at: string
          video_url: string
        }[]
      }
      get_mlm_stats: { Args: { p_user_id: string }; Returns: Json }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          first_name: string
          id: string
          is_profile_public: boolean
          last_name: string
          username: string
          view_count: number
        }[]
      }
      get_user_game_ids: {
        Args: { user_uuid: string }
        Returns: {
          game_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      highlightly_match_and_link_bulk_v1: {
        Args: {
          _cand_limit?: number
          _items: Json
          _low_th?: number
          _sport_id: string
          _th?: number
        }
        Returns: {
          country_id: string
          hl_name: string
          hl_slug: string
          idx: number
          league_id: string
          matched: boolean
          method: string
          near_miss: boolean
          score: number
          top_candidates: Json
        }[]
      }
      highlightly_match_and_link_bulk_v2: {
        Args: {
          _cand_limit?: number
          _items: Json
          _low_th?: number
          _sport_id: string
          _th?: number
        }
        Returns: {
          applied: boolean
          apply_reason: string
          country_id: string
          hl_name: string
          hl_slug: string
          idx: number
          league_id: string
          matched: boolean
          method: string
          near_miss: boolean
          score: number
          top_candidates: Json
        }[]
      }
      highlightly_match_and_link_bulk_v3: {
        Args: {
          _cand_limit?: number
          _items: Json
          _low_th?: number
          _sport_id: string
          _th?: number
        }
        Returns: {
          applied: boolean
          apply_reason: string
          country_id: string
          hl_id: string
          hl_name: string
          hl_slug: string
          idx: number
          league_id: string
          matched: boolean
          method: string
          near_miss: boolean
          score: number
          top_candidates: Json
        }[]
      }
      highlightly_match_and_link_bulk_v4: {
        Args: {
          _cand_limit?: number
          _items: Json
          _sport_id: string
          _th?: number
        }
        Returns: {
          applied: boolean
          apply_reason: string
          country_id: string
          country_name: string
          country_slug: string
          hl_id: string
          hl_name: string
          hl_slug: string
          idx: number
          league_country_id: string
          league_country_name: string
          league_country_slug: string
          league_id: string
          league_name: string
          league_slug: string
          matched: boolean
          method: string
          score: number
          top_candidates: Json
        }[]
      }
      highlightly_match_and_link_teams_bulk_nc_v1:
        | {
            Args: {
              _cand_limit?: number
              _items: Json
              _low_th?: number
              _sport_id: string
              _th?: number
            }
            Returns: {
              abbr: string
              applied: boolean
              apply_reason: string
              hl_id: string
              hl_name: string
              hl_slug: string
              idx: number
              matched: boolean
              method: string
              near_miss: boolean
              score: number
              team_id: string
              top_candidates: Json
            }[]
          }
        | {
            Args: {
              _apply?: boolean
              _cand_limit: number
              _items: Json
              _low_th: number
              _sport_id: string
              _th: number
            }
            Returns: {
              abbr: string
              applied: boolean
              apply_reason: string
              hl_id: string
              hl_name: string
              hl_slug: string
              idx: number
              matched: boolean
              method: string
              near_miss: boolean
              score: number
              team_id: string
              top_candidates: Json
            }[]
          }
      highlightly_match_and_link_teams_slice_v1: {
        Args: {
          _apply?: boolean
          _cand_limit: number
          _items: Json
          _low_th: number
          _sport_id: string
          _th: number
        }
        Returns: {
          abbr: string
          applied: boolean
          apply_reason: string
          hl_id: string
          hl_name: string
          hl_slug: string
          idx: number
          matched: boolean
          method: string
          near_miss: boolean
          score: number
          team_id: string
        }[]
      }
      increment_view_count: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_women_label: {
        Args: { _name: string; _slug: string }
        Returns: boolean
      }
      link_fixture_highlightly: {
        Args: {
          p_league_hl_id: number
          p_match_hl_id: number
          p_side: string
          p_team_hl_id: number
        }
        Returns: number
      }
      link_highightly_match_to_fixture: {
        Args: {
          p_away_high_id: number
          p_home_high_id: number
          p_match_id: number
          p_payload: Json
          p_start_iso: string
          p_status_short: string
        }
        Returns: number
      }
      link_highightly_match_to_fixture_by_league: {
        Args: {
          p_away_high_id: number
          p_home_high_id: number
          p_league_high_id: number
          p_match_id: number
          p_payload: Json
          p_start_iso: string
          p_status_short: string
        }
        Returns: number
      }
      link_highightly_matches_bulk_by_league_json: {
        Args: { p_items: Json; p_league_high_id: number }
        Returns: number
      }
      link_highlightly_matches_bulk_by_league_json: {
        Args: { p_items: Json; p_league_high_id: number }
        Returns: number
      }
      map_azuro_state_to_status_short: {
        Args: { p_state: string }
        Returns: string
      }
      match_azuro_row_v1:
        | {
            Args: {
              _apply?: boolean
              _name: string
              _slug: string
              _sport_slug: string
              _th?: number
            }
            Returns: {
              applied: boolean
              apply_reason: string
              matched: boolean
              method: string
              score: number
              team_id: string
            }[]
          }
        | {
            Args: {
              p_abbr: string
              p_apply?: boolean
              p_azuro_slug: string
              p_azuro_team_id: string
              p_name: string
              p_sport_slug: string
              p_threshold?: number
            }
            Returns: {
              applied: boolean
              apply_reason: string
              matched: boolean
              method: string
              score: number
              team_id: string
            }[]
          }
      match_highlightly_row_v1:
        | {
            Args: {
              _abbr: string
              _apply?: boolean
              _hl_id: number
              _hl_slug: string
              _name: string
              _sport_id: string
              _th?: number
            }
            Returns: {
              applied: boolean
              apply_reason: string
              matched: boolean
              method: string
              score: number
              team_id: string
            }[]
          }
        | {
            Args: {
              _abbr: string
              _apply?: boolean
              _hl_id: number
              _hl_slug: string
              _name: string
              _sport_slug: string
              _th?: number
            }
            Returns: {
              applied: boolean
              apply_reason: string
              matched: boolean
              method: string
              score: number
              team_id: string
            }[]
          }
      match_league_azuro_pick: {
        Args: {
          _az_name: string
          _az_slug: string
          _country_id: string
          _sport_id: string
          _th: number
        }
        Returns: {
          league_id: string
          method: string
          name: string
          score: number
          slug: string
        }[]
      }
      match_league_azuro_scoped: {
        Args: {
          _az_name: string
          _az_slug: string
          _country_id: string
          _sport_id: string
          _th?: number
        }
        Returns: {
          league_id: string
          method: string
          score: number
        }[]
      }
      match_league_azuro_scoped_v3: {
        Args: {
          _az_name: string
          _az_slug: string
          _country_id: string
          _sport_id: string
          _th?: number
        }
        Returns: {
          league_id: string
          method: string
          score: number
        }[]
      }
      match_league_azuro_scoped_v3_candidates: {
        Args: {
          _az_name: string
          _az_slug: string
          _country_id: string
          _limit?: number
          _sport_id: string
        }
        Returns: {
          is_women: boolean
          league_id: string
          name: string
          prefix_bonus: number
          prefix_malus: number
          score: number
          sim: number
          slug: string
          women_bonus: number
          women_malus: number
          wsim: number
        }[]
      }
      match_league_azuro_simple_candidates: {
        Args: {
          _az_name: string
          _az_slug: string
          _country_id: string
          _limit: number
          _sport_id: string
        }
        Returns: {
          league_id: string
          method: string
          name: string
          score: number
          slug: string
        }[]
      }
      match_league_scoped_v1: {
        Args: {
          _country_id: string
          _name: string
          _slug: string
          _sport_id: string
          _th?: number
        }
        Returns: {
          league_id: string
          method: string
          score: number
        }[]
      }
      match_league_scoped_v1_candidates: {
        Args: {
          _country_id: string
          _limit?: number
          _name: string
          _slug: string
          _sport_id: string
        }
        Returns: {
          is_women: boolean
          league_id: string
          name: string
          prefix_bonus: number
          prefix_malus: number
          score: number
          sim: number
          slug: string
          women_bonus: number
          women_malus: number
          wsim: number
        }[]
      }
      match_set_azuro_league_anysport:
        | {
            Args: {
              _azuro_name: string
              _azuro_slug: string
              _sport_slug: string
            }
            Returns: Json
          }
        | {
            Args: {
              _azuro_name: string
              _azuro_slug: string
              _country_name?: string
              _country_slug?: string
              _sport_slug: string
            }
            Returns: Json
          }
        | {
            Args: {
              _azuro_name: string
              _azuro_slug: string
              _country_name?: string
              _country_slug?: string
              _force?: boolean
              _sport_slug: string
            }
            Returns: Json
          }
      match_set_highlightly_league_anysport:
        | {
            Args: {
              _country_code?: string
              _hl_id: number
              _hl_name: string
              _sport_slug: string
            }
            Returns: Json
          }
        | {
            Args: {
              _country_code?: string
              _country_id?: string
              _hl_id: number
              _hl_name: string
              _sport_slug: string
            }
            Returns: Json
          }
      match_set_highlightly_team_anysport: {
        Args: {
          _country_code?: string
          _hl_id: number
          _hl_name: string
          _sport_slug: string
        }
        Returns: Json
      }
      norm: { Args: { txt: string }; Returns: string }
      norm_name: { Args: { txt: string }; Returns: string }
      norm_syn: { Args: { txt: string }; Returns: string }
      normalize_name: { Args: { txt: string }; Returns: string }
      process_referral_signup: {
        Args: { p_code: string; p_referred_id: string }
        Returns: Json
      }
      rpc_user_feed:
        | {
            Args: {
              p_cursor_id?: string
              p_cursor_sort_ts?: string
              p_cursor_type?: string
              p_highlight_bias?: unknown
              p_highlight_past?: unknown
              p_limit?: number
              p_match_future?: unknown
              p_match_past?: unknown
              p_now?: string
              p_sport_id?: string
            }
            Returns: {
              away_team_id: string
              data: Json
              home_team_id: string
              item_id: string
              item_type: string
              league_id: string
              pref_entity_type: Database["public"]["Enums"]["entity_type_enum"]
              pref_id: string
              pref_position: number
              sort_ts: string
              sport_id: string
              ts: string
            }[]
          }
        | {
            Args: {
              p_cursor_id?: string
              p_cursor_rn?: number
              p_cursor_type?: string
              p_highlight_first?: boolean
              p_highlight_past?: unknown
              p_limit?: number
              p_match_future?: unknown
              p_match_past?: unknown
              p_now?: string
              p_user_id?: string
            }
            Returns: {
              away_team_id: string
              data: Json
              home_team_id: string
              item_id: string
              item_type: string
              league_id: string
              pref_entity_type: Database["public"]["Enums"]["entity_type_enum"]
              pref_id: string
              pref_position: number
              rn: number
              sport_id: string
              ts: string
            }[]
          }
      search_leagues: {
        Args: { n?: number; q: string; sport_filter_id?: string }
        Returns: {
          country_id: string
          country_name: string
          country_slug: string
          league_id: string
          league_logo: string
          league_name: string
          league_slug: string
          rank: number
          sport_id: string
          sport_name: string
          sport_slug: string
        }[]
      }
      search_leagues_sports_data: {
        Args: {
          favorite_sport_ids?: string[]
          n?: number
          page_offset?: number
          q: string
        }
        Returns: {
          country_id: string
          country_name: string
          followers_count: number
          league_id: string
          league_logo: string
          league_name: string
          league_slug: string
          rank: number
          sport_icon: string
          sport_id: string
          sport_name: string
          sport_slug: string
        }[]
      }
      search_players_sports_data: {
        Args: {
          favorite_sport_ids?: string[]
          n?: number
          page_offset?: number
          q: string
        }
        Returns: {
          followers_count: number
          player_full_name: string
          player_id: string
          player_logo: string
          player_name: string
          rank: number
          sport_icon: string
          sport_id: string
          sport_name: string
          sport_slug: string
          team_id: string
          team_name: string
        }[]
      }
      search_teams: {
        Args: { n?: number; q: string }
        Returns: {
          country_id: string
          country_name: string
          country_slug: string
          rank: number
          sport_id: string
          sport_name: string
          sport_slug: string
          team_id: string
          team_logo: string
          team_name: string
          team_slug: string
        }[]
      }
      search_teams_sports_data: {
        Args: {
          favorite_sport_ids?: string[]
          n?: number
          page_offset?: number
          q: string
        }
        Returns: {
          country_id: string
          country_name: string
          followers_count: number
          rank: number
          sport_icon: string
          sport_id: string
          sport_name: string
          sport_slug: string
          team_id: string
          team_logo: string
          team_name: string
          team_slug: string
        }[]
      }
      search_users: {
        Args: { limit_count?: number; search_term: string }
        Returns: {
          avatar_url: string
          bio: string
          ens_subdomain: string
          first_name: string
          id: string
          last_name: string
          similarity_score: number
          username: string
          wallet_address: string
        }[]
      }
      search_users_safe: {
        Args: { limit_count?: number; search_term: string }
        Returns: {
          avatar_url: string
          bio: string
          first_name: string
          id: string
          last_name: string
          similarity_score: number
          username: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      slugify: { Args: { txt: string }; Returns: string }
      slugify_simple: { Args: { txt: string }; Returns: string }
      sorted_tokens: { Args: { txt: string }; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
      update_league_apisports: {
        Args: {
          p_apisports_id: number
          p_competition_type: string
          p_league_id: string
          p_logo: string
        }
        Returns: undefined
      }
      update_team_username: { Args: { team_id_param: string }; Returns: string }
      upsert_highlights_bulk:
        | {
            Args: {
              _items: Json
              _provider?: Database["public"]["Enums"]["provider_enum"]
            }
            Returns: number
          }
        | {
            Args: {
              _items: Json
              _provider?: Database["public"]["Enums"]["provider_enum"]
              _sport_local_id?: string
            }
            Returns: number
          }
      upsert_league_team_rows: {
        Args: { _rows: Json; _season: number; _sport_slug: string }
        Returns: {
          skipped: number
          upserted: number
        }[]
      }
      upsert_standings_provider: { Args: { _items: Json }; Returns: Json }
      validate_ludo_positions: { Args: { positions: Json }; Returns: boolean }
      validate_referral_code: { Args: { p_code: string }; Returns: Json }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      auth_method_enum: "email" | "wallet"
      bet_status_enum: "pending" | "won" | "lost" | "cancelled" | "refunded"
      bet_type_enum: "single" | "parlay" | "system"
      competition_type_enum: "league" | "cup" | "other"
      entity_type_enum: "sport" | "league" | "team" | "player"
      fixture_status_group:
        | "Scheduled"
        | "InPlay"
        | "Finished"
        | "Postponed"
        | "Cancelled"
        | "Abandoned"
        | "NotPlayed"
      game_state: "prematch" | "live" | "resolved" | "canceled"
      game_status_enum: "created" | "active" | "finished" | "abandoned"
      highlight_type: "VERIFIED" | "UNVERIFIED"
      ludo_color_enum: "R" | "G" | "Y" | "B"
      provider_enum: "api_sport" | "highlightly"
      sport_category_enum: "sport" | "esport" | "special"
      standings_participant_enum: "team" | "driver" | "constructor" | "nation"
      stream_status_enum: "created" | "live" | "ended"
      surface_type_enum:
        | "grass"
        | "artificial"
        | "hybrid"
        | "parquet"
        | "ice"
        | "other"
      ticket_category_enum: "technical" | "billing" | "behavior" | "other"
      ticket_priority_enum: "low" | "medium" | "high" | "urgent"
      ticket_status_enum: "open" | "in_progress" | "resolved" | "closed"
      tx_status_enum:
        | "received"
        | "pending_confirmations"
        | "confirmed"
        | "mismatch"
        | "reverted"
        | "timeout"
      tx_type_enum: "native" | "erc20" | "erc721"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "user"],
      auth_method_enum: ["email", "wallet"],
      bet_status_enum: ["pending", "won", "lost", "cancelled", "refunded"],
      bet_type_enum: ["single", "parlay", "system"],
      competition_type_enum: ["league", "cup", "other"],
      entity_type_enum: ["sport", "league", "team", "player"],
      fixture_status_group: [
        "Scheduled",
        "InPlay",
        "Finished",
        "Postponed",
        "Cancelled",
        "Abandoned",
        "NotPlayed",
      ],
      game_state: ["prematch", "live", "resolved", "canceled"],
      game_status_enum: ["created", "active", "finished", "abandoned"],
      highlight_type: ["VERIFIED", "UNVERIFIED"],
      ludo_color_enum: ["R", "G", "Y", "B"],
      provider_enum: ["api_sport", "highlightly"],
      sport_category_enum: ["sport", "esport", "special"],
      standings_participant_enum: ["team", "driver", "constructor", "nation"],
      stream_status_enum: ["created", "live", "ended"],
      surface_type_enum: [
        "grass",
        "artificial",
        "hybrid",
        "parquet",
        "ice",
        "other",
      ],
      ticket_category_enum: ["technical", "billing", "behavior", "other"],
      ticket_priority_enum: ["low", "medium", "high", "urgent"],
      ticket_status_enum: ["open", "in_progress", "resolved", "closed"],
      tx_status_enum: [
        "received",
        "pending_confirmations",
        "confirmed",
        "mismatch",
        "reverted",
        "timeout",
      ],
      tx_type_enum: ["native", "erc20", "erc721"],
    },
  },
} as const
