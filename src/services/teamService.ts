import { TeamProfile, TeamFixture, TeamHighlight, TeamStanding } from '@/types/team';
import { sportsDataClient } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Get team ID from slug using database query
 */
export async function getTeamIdFromSlug(slug: string): Promise<string | null> {
  try {
    // Check if slug is already a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(slug)) {
      return slug; // Return UUID directly without prefix
    }
    
    // If it's a text slug, return null for now
    // This would normally query the database to find the team ID
    return null;
  } catch (error) {
    logger.error('Error in getTeamIdFromSlug:', error);
    return null;
  }
}

/**
 * Get team by ID from Supabase database
 */
async function getTeamById(teamId: string): Promise<TeamProfile | null> {
  try {
    const { data, error } = await (sportsDataClient as any)
      .from('teams')
      .select(`
        *,
        country:country_id(name, code, slug),
        sport:sport_id(name, slug)
      `)
      .eq('id', teamId)
      .single();

    if (error || !data) {
      logger.error('Error fetching team:', error);
      return null;
    }

    // Map database fields to TeamProfile interface
    const teamProfile: TeamProfile = {
      id: data.id,
      name: data.name || data.display_name || 'Unknown Team',
      slug: data.slug || teamId,
      logo_url: data.logo || '/placeholder.svg',
      sport_slug: data.sport?.slug || '',
      sport_name: data.sport?.name || '',
      league: {
        id: 'unknown',
        name: 'Unknown League',
        slug: 'unknown',
        country_name: data.country?.name || 'Unknown'
      },
      country: data.country?.name || 'Unknown',
      founded_year: 2000, // Default value as not in DB
      stadium: 'Unknown Stadium', // Default value as not in DB
      coach: 'Unknown Coach', // Default value as not in DB
      verified: false,
      colors: {
        primary: '#000000',
        secondary: '#ffffff'
      },
      stats: {
        followers: 0,
        posts_count: 0,
        matches_played: 0,
        position: 0,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        form: []
      }
    };

    return teamProfile;
  } catch (error) {
    logger.error('Error in getTeamById:', error);
    return null;
  }
}

// Utility function to create team from slug
const createTeamFromSlug = (slug: string): TeamProfile => {
  const teamName = slug.split('-vs-')[0] || slug;
  const formattedName = teamName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Generate realistic stats
  const randomStats = {
    position: Math.floor(Math.random() * 20) + 1,
    points: Math.floor(Math.random() * 80) + 10,
    wins: Math.floor(Math.random() * 25) + 5,
    draws: Math.floor(Math.random() * 10) + 2,
    losses: Math.floor(Math.random() * 15) + 1,
    goals_for: Math.floor(Math.random() * 60) + 20,
    goals_against: Math.floor(Math.random() * 40) + 10,
  };

  return {
    id: slug,
    name: formattedName,
    slug: slug,
    logo_url: 'https://via.placeholder.com/100x100?text=' + formattedName.charAt(0),
    league: {
      id: 'premier-league',
      name: 'Premier League',
      slug: 'premier-league',
      country_name: 'England'
    },
    country: 'England',
    founded_year: 1900 + Math.floor(Math.random() * 100),
    stadium: formattedName + ' Stadium',
    coach: 'Manager',
    verified: false,
    colors: {
      primary: '#1a365d',
      secondary: '#2d3748'
    },
    stats: {
      followers: Math.floor(Math.random() * 50000000) + 1000000,
      posts_count: Math.floor(Math.random() * 2000) + 100,
      matches_played: randomStats.wins + randomStats.draws + randomStats.losses,
      ...randomStats,
      goal_difference: randomStats.goals_for - randomStats.goals_against,
      form: ['W', 'D', 'L', 'W', 'D'].sort(() => Math.random() - 0.5).slice(0, 5)
    }
  };
};

// Team name mapping for better navigation
const teamNameMapping: Record<string, string> = {
  'manchester united': 'manchester-united',
  'manchester utd': 'manchester-united',
  'man utd': 'manchester-united',
  'man united': 'manchester-united',
  'liverpool': 'liverpool-fc',
  'liverpool fc': 'liverpool-fc',
  'real madrid': 'real-madrid',
  'barcelona': 'fc-barcelona',
  'fc barcelona': 'fc-barcelona',
  'barca': 'fc-barcelona',
  'psg': 'paris-saint-germain',
  'paris saint-germain': 'paris-saint-germain',
  'paris sg': 'paris-saint-germain',
  'marseille': 'olympique-de-marseille',
  'olympique de marseille': 'olympique-de-marseille',
  'om': 'olympique-de-marseille'
};

// Mock data for development
const mockTeams: TeamProfile[] = [
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    slug: 'paris-saint-germain',
    logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Paris-Saint-Germain-Logo.png',
    league: {
      id: 'ligue1',
      name: 'Ligue 1',
      slug: 'ligue-1',
      country_name: 'France'
    },
    country: 'France',
    founded_year: 1970,
    stadium: 'Parc des Princes',
    coach: 'Luis Enrique',
    verified: true,
    colors: {
      primary: '#004170',
      secondary: '#FF0000'
    },
    stats: {
      followers: 45000000,
      posts_count: 1230,
      matches_played: 25,
      position: 1,
      points: 68,
      wins: 21,
      draws: 5,
      losses: 1,
      goals_for: 72,
      goals_against: 18,
      goal_difference: 54,
      form: ['W', 'W', 'D', 'W', 'W']
    }
  },
  {
    id: 'marseille',
    name: 'Olympique de Marseille',
    slug: 'olympique-de-marseille',
    logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Marseille-Logo.png',
    league: {
      id: 'ligue1',
      name: 'Ligue 1',
      slug: 'ligue-1',
      country_name: 'France'
    },
    country: 'France',
    founded_year: 1899,
    stadium: 'Orange Vélodrome',
    coach: 'Jean-Louis Gasset',
    verified: true,
    colors: {
      primary: '#0099CC',
      secondary: '#FFFFFF'
    },
    stats: {
      followers: 12000000,
      posts_count: 856,
      matches_played: 25,
      position: 8,
      points: 35,
      wins: 10,
      draws: 5,
      losses: 10,
      goals_for: 38,
      goals_against: 42,
      goal_difference: -4,
      form: ['L', 'W', 'L', 'D', 'L']
    }
  },
  {
    id: 'manchester-united',
    name: 'Manchester United',
    slug: 'manchester-united',
    logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
    league: {
      id: 'premier-league',
      name: 'Premier League',
      slug: 'premier-league',
      country_name: 'England'
    },
    country: 'England',
    founded_year: 1878,
    stadium: 'Old Trafford',
    coach: 'Erik ten Hag',
    verified: true,
    colors: {
      primary: '#DA020E',
      secondary: '#FFE500'
    },
    stats: {
      followers: 73000000,
      posts_count: 2156,
      matches_played: 26,
      position: 6,
      points: 44,
      wins: 12,
      draws: 8,
      losses: 6,
      goals_for: 42,
      goals_against: 38,
      goal_difference: 4,
      form: ['L', 'W', 'D', 'L', 'W']
    }
  },
  {
    id: 'real-madrid',
    name: 'Real Madrid',
    slug: 'real-madrid',
    logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
    league: {
      id: 'la-liga',
      name: 'La Liga',
      slug: 'la-liga',
      country_name: 'Spain'
    },
    country: 'Spain',
    founded_year: 1902,
    stadium: 'Santiago Bernabéu',
    coach: 'Carlo Ancelotti',
    verified: true,
    colors: {
      primary: '#FFFFFF',
      secondary: '#FFD700'
    },
    stats: {
      followers: 110000000,
      posts_count: 3245,
      matches_played: 24,
      position: 1,
      points: 65,
      wins: 20,
      draws: 5,
      losses: 1,
      goals_for: 68,
      goals_against: 22,
      goal_difference: 46,
      form: ['W', 'W', 'W', 'D', 'W']
    }
  },
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    slug: 'fc-barcelona',
    logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/FC-Barcelona-Logo.png',
    league: {
      id: 'la-liga',
      name: 'La Liga',
      slug: 'la-liga',
      country_name: 'Spain'
    },
    country: 'Spain',
    founded_year: 1899,
    stadium: 'Camp Nou',
    coach: 'Xavi Hernández',
    verified: true,
    colors: {
      primary: '#A50044',
      secondary: '#004D98'
    },
    stats: {
      followers: 103000000,
      posts_count: 2987,
      matches_played: 24,
      position: 2,
      points: 58,
      wins: 18,
      draws: 4,
      losses: 2,
      goals_for: 55,
      goals_against: 28,
      goal_difference: 27,
      form: ['W', 'D', 'W', 'W', 'L']
    }
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    slug: 'liverpool-fc',
    logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
    league: {
      id: 'premier-league',
      name: 'Premier League',
      slug: 'premier-league',
      country_name: 'England'
    },
    country: 'England',
    founded_year: 1892,
    stadium: 'Anfield',
    coach: 'Jürgen Klopp',
    verified: true,
    colors: {
      primary: '#C8102E',
      secondary: '#FFD700'
    },
    stats: {
      followers: 67000000,
      posts_count: 1876,
      matches_played: 26,
      position: 2,
      points: 58,
      wins: 18,
      draws: 4,
      losses: 4,
      goals_for: 65,
      goals_against: 32,
      goal_difference: 33,
      form: ['W', 'W', 'L', 'W', 'D']
    }
  }
];

const mockFixtures: TeamFixture[] = [
  {
    id: '1',
    round: 'Round 22',
    date: '2024-02-03T15:00:00Z',
    opponent: {
      id: 'marseille',
      name: 'Olympique de Marseille',
      logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Marseille-Logo.png'
    },
    is_home: true,
    status: 'upcoming',
    venue: 'Parc des Princes',
    league: {
      id: '1',
      name: 'Ligue 1',
      logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=32&h=32&fit=crop&crop=center',
      country_name: 'France'
    },
    state: {
      description: 'Not started'
    },
    country: {
      code: 'FR',
      name: 'France',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=24&h=24&fit=crop&crop=center'
    }
  },
  {
    id: '2',
    round: 'Round 23',
    date: '2024-02-10T20:45:00Z',
    opponent: {
      id: 'lille',
      name: 'LOSC Lille',
      logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/LOSC-Lille-Logo.png'
    },
    is_home: false,
    status: 'upcoming',
    venue: 'Stade Pierre-Mauroy',
    league: {
      id: '1',
      name: 'Ligue 1',
      logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=32&h=32&fit=crop&crop=center',
      country_name: 'France'
    },
    state: {
      description: 'Not started'
    },
    country: {
      code: 'FR',
      name: 'France',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=24&h=24&fit=crop&crop=center'
    }
  }
];

const mockResults: TeamFixture[] = [
  {
    id: '3',
    round: 'Round 20',
    date: '2024-01-27T17:00:00Z',
    opponent: {
      id: 'lyon',
      name: 'Olympique Lyonnais',
      logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Lyon-Logo.png'
    },
    is_home: true,
    status: 'finished',
    venue: 'Parc des Princes',
    score: { home: 2, away: 1 },
    league: {
      id: '1',
      name: 'Ligue 1',
      logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=32&h=32&fit=crop&crop=center',
      country_name: 'France'
    },
    state: {
      description: 'Finished'
    },
    country: {
      code: 'FR',
      name: 'France',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=24&h=24&fit=crop&crop=center'
    }
  },
  {
    id: '4',
    round: 'Round 21',
    date: '2024-01-20T20:45:00Z',
    opponent: {
      id: 'monaco',
      name: 'AS Monaco',
      logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Monaco-Logo.png'
    },
    is_home: false,
    status: 'finished',
    venue: 'Stade Louis II',
    score: { home: 1, away: 3 },
    league: {
      id: '1',
      name: 'Ligue 1',
      logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=32&h=32&fit=crop&crop=center',
      country_name: 'France'
    },
    state: {
      description: 'Finished'
    },
    country: {
      code: 'FR',
      name: 'France',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=24&h=24&fit=crop&crop=center'
    }
  }
];

const mockHighlights: TeamHighlight[] = [
  {
    id: 12345,
    type: "goal",
    imgUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&w=400&h=225&fit=crop",
    title: "Incredible Goal by Mbappé",
    description: "Mbappé scores from 30 meters in the 75th minute.",
    url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    embedUrl: "https://example.com/embed/video123",
    channel: "beIN Sports",
    source: "YouTube",
    match: {
      id: 67890,
      round: "Quarter Finals",
      date: "2025-07-27T18:45:00Z",
      country: {
        code: "FR",
        name: "France",
        logo: "https://flagcdn.com/w80/fr.png"
      },
      awayTeam: {
        id: 222,
        name: "Paris FC",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/Paris-Saint-Germain-Logo.png"
      },
      homeTeam: {
        id: 111,
        name: "Marseille SC",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/Olympique-Marseille-Logo.png"
      },
      league: {
        id: 55,
        season: 2025,
        name: "Ligue 1",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/Ligue-1-Logo.png"
      },
      state: {
        description: "Finished"
      },
      clock: 90,
      score: {
        current: "3 - 1",
        penalties: "–"
      }
    }
  },
  {
    id: 12346,
    type: "summary",
    imgUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&w=400&h=225&fit=crop",
    title: "Match Highlights: Manchester United vs Liverpool",
    description: "Complete highlights from the Premier League classic at Old Trafford.",
    url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    embedUrl: "https://example.com/embed/video124",
    channel: "Sky Sports",
    source: "YouTube",
    match: {
      id: 67891,
      round: "Matchday 15",
      date: "2025-07-25T16:30:00Z",
      country: {
        code: "GB",
        name: "England",
        logo: "https://flagcdn.com/w80/gb.png"
      },
      awayTeam: {
        id: 224,
        name: "Liverpool FC",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png"
      },
      homeTeam: {
        id: 223,
        name: "Manchester United",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png"
      },
      league: {
        id: 39,
        season: 2025,
        name: "Premier League",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png"
      },
      state: {
        description: "Finished"
      },
      clock: 90,
      score: {
        current: "2 - 1",
        penalties: "–"
      }
    }
  },
  {
    id: 12347,
    type: "interview",
    imgUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&w=400&h=225&fit=crop",
    title: "Post-Match Interview with the Coach",
    description: "Manager discusses the team's performance and future strategy.",
    url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    embedUrl: "https://example.com/embed/video125",
    channel: "UEFA",
    source: "Official",
    match: {
      id: 67892,
      round: "Semi-Final",
      date: "2025-07-24T20:00:00Z",
      country: {
        code: "ES",
        name: "Spain",
        logo: "https://flagcdn.com/w80/es.png"
      },
      awayTeam: {
        id: 226,
        name: "FC Barcelona",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png"
      },
      homeTeam: {
        id: 225,
        name: "Real Madrid",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png"
      },
      league: {
        id: 140,
        season: 2025,
        name: "Champions League",
        logo: "https://logos-world.net/wp-content/uploads/2020/06/UEFA-Champions-League-Logo.png"
      },
      state: {
        description: "Finished"
      },
      clock: 90,
      score: {
        current: "1 - 0",
        penalties: "–"
      }
    }
  }
];

// Utility function to normalize team names for slug generation
export const normalizeTeamName = (teamName: string): string => {
  const normalized = teamName
    .toLowerCase()
    .trim()
    .replace(/^fc\s+/i, '')  // Remove FC prefix
    .replace(/\s+fc$/i, '')  // Remove FC suffix
    .replace(/\s+/g, '-')    // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
  
  return teamNameMapping[normalized] || normalized;
};

export const teamService = {
  async getTeamById(teamId: string): Promise<TeamProfile | null> {
    return await getTeamById(teamId);
  },

  async getTeamBySlug(slug: string): Promise<TeamProfile | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to find exact match first
    let team = mockTeams.find(team => team.slug === slug);
    
    // If no exact match, try normalized name mapping
    if (!team) {
      const normalizedSlug = Object.keys(teamNameMapping).find(key => 
        teamNameMapping[key] === slug
      );
      if (normalizedSlug) {
        team = mockTeams.find(t => t.slug === teamNameMapping[normalizedSlug]);
      }
    }
    
    // If still no match, create a dynamic team from slug
    if (!team) {
      team = createTeamFromSlug(slug);
    }
    
    return team;
  },

  async getTeamFixtures(teamId: string, type: 'upcoming' | 'recent' = 'upcoming'): Promise<TeamFixture[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return type === 'upcoming' ? mockFixtures : mockResults;
  },

  async getTeamHighlights(teamId: string): Promise<TeamHighlight[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockHighlights;
  },

  async getLeagueStandings(leagueId: string): Promise<TeamStanding[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Synchronized with leagueService data
    const mockStandings: Record<string, TeamStanding[]> = {
      'premier-league': [
        {
          position: 1,
          team: { id: 'liverpool', name: 'Liverpool', logo_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center' },
          played: 20, won: 16, drawn: 3, lost: 1,
          goals_for: 48, goals_against: 16, goal_difference: 32, points: 51,
          form: ['W', 'W', 'D', 'W', 'W']
        },
        {
          position: 2,
          team: { id: 'arsenal', name: 'Arsenal', logo_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center' },
          played: 20, won: 14, drawn: 4, lost: 2,
          goals_for: 42, goals_against: 18, goal_difference: 24, points: 46,
          form: ['W', 'D', 'W', 'W', 'L']
        },
        {
          position: 3,
          team: { id: 'chelsea', name: 'Chelsea', logo_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center' },
          played: 20, won: 13, drawn: 4, lost: 3,
          goals_for: 38, goals_against: 20, goal_difference: 18, points: 43,
          form: ['W', 'W', 'D', 'W', 'W']
        },
        {
          position: 4,
          team: { id: 'manchester-city', name: 'Manchester City', logo_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center' },
          played: 20, won: 12, drawn: 5, lost: 3,
          goals_for: 35, goals_against: 22, goal_difference: 13, points: 41,
          form: ['D', 'W', 'W', 'D', 'L']
        },
        {
          position: 5,
          team: { id: 'manchester-utd', name: 'Manchester United', logo_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center' },
          played: 20, won: 11, drawn: 4, lost: 5,
          goals_for: 32, goals_against: 25, goal_difference: 7, points: 37,
          form: ['W', 'L', 'D', 'W', 'W']
        },
        {
          position: 6,
          team: { id: 'tottenham', name: 'Tottenham', logo_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center' },
          played: 20, won: 10, drawn: 6, lost: 4,
          goals_for: 33, goals_against: 26, goal_difference: 7, points: 36,
          form: ['D', 'W', 'D', 'L', 'W']
        }
      ]
    };

    return mockStandings[leagueId] || [];
  }
};