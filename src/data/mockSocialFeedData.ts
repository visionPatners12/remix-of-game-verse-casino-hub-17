import type { 
  FeedPost, 
  Author, 
  Comment, 
  ReactionCounts,
  PredictionData,
  OpinionData,
  BetData
} from '@/types/feed';

// ===== UTILISATEURS MOCK =====
export const mockAuthors: Author[] = [
  {
    id: 'user-instagram',
    username: 'leo_skills10',
    fullName: 'Leo Skills',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-1',
    username: 'jules_martin',
    fullName: 'Jules Martin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-2', 
    username: 'emma_dubois',
    fullName: 'Emma Dubois',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-3',
    username: 'antoine_bernard',
    fullName: 'Antoine Bernard', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-4',
    username: 'lea_moreau',
    fullName: 'Léa Moreau',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-5',
    username: 'maxime_rousseau',
    fullName: 'Maxime Rousseau',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-6',
    username: 'chloe_petit',
    fullName: 'Chloé Petit',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-7',
    username: 'thomas_garcia',
    fullName: 'Thomas Garcia',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-8',
    username: 'sarah_martinez',
    fullName: 'Sarah Martinez',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-9',
    username: 'kevin_james',
    fullName: 'Kevin James',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-10',
    username: 'marie_laurent',
    fullName: 'Marie Laurent',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-11',
    username: 'pierre_durand',
    fullName: 'Pierre Durand',
    avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-12',
    username: 'sophie_blanc',
    fullName: 'Sophie Blanc',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-13',
    username: 'lucas_fernandez',
    fullName: 'Lucas Fernandez',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-14',
    username: 'camille_roux',
    fullName: 'Camille Roux',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-15',
    username: 'alex_thompson',
    fullName: 'Alex Thompson',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-16',
    username: 'nina_rossi',
    fullName: 'Nina Rossi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-17',
    username: 'hugo_silva',
    fullName: 'Hugo Silva',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-18',
    username: 'olivia_martin',
    fullName: 'Olivia Martin',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-19',
    username: 'marco_gonzalez',
    fullName: 'Marco Gonzalez',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user-20',
    username: 'laura_petit',
    fullName: 'Laura Petit',
    avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&h=150&fit=crop&crop=face'
  }
];

// ===== REACTIONS MOCK =====
const createMockReactions = (likes: number, comments: number, shares: number, userLiked = false): ReactionCounts => ({
  likes,
  comments,
  shares,
  userLiked
});

// ===== COMMENTAIRES MOCK =====
const mockComments: Record<string, Comment[]> = {
  'post-1': [
    {
      id: 'comment-1-1',
      username: 'emma_dubois',
      fullName: 'Emma Dubois',
      displayUsername: '@emma_dubois',
      avatar: mockAuthors[1].avatar,
      text: 'Excellente analyse ! PSG a vraiment dominé ce match 🔥',
      timestamp: '2024-12-18T14:32:00Z'
    },
    {
      id: 'comment-1-2', 
      username: 'antoine_bernard',
      fullName: 'Antoine Bernard',
      displayUsername: '@antoine_bernard',
      avatar: mockAuthors[2].avatar,
      text: 'Tu as raison, Mbappé était en feu ce soir-là',
      timestamp: '2024-12-18T14:45:00Z'
    }
  ],
  'post-2': [
    {
      id: 'comment-2-1',
      username: 'lea_moreau', 
      fullName: 'Léa Moreau',
      displayUsername: '@lea_moreau',
      avatar: mockAuthors[3].avatar,
      text: 'Prédiction risquée mais j\'aime ton style 💪',
      timestamp: '2024-12-18T13:15:00Z'
    }
  ],
  'post-3': [
    {
      id: 'comment-3-1',
      username: 'maxime_rousseau',
      fullName: 'Maxime Rousseau', 
      displayUsername: '@maxime_rousseau',
      avatar: mockAuthors[4].avatar,
      text: 'Liverpool à domicile, c\'est toujours du spectacle !',
      timestamp: '2024-12-18T12:48:00Z'
    },
    {
      id: 'comment-3-2',
      username: 'thomas_garcia',
      fullName: 'Thomas Garcia',
      displayUsername: '@thomas_garcia', 
      avatar: mockAuthors[6].avatar,
      text: 'Les cotes sont intéressantes, je suis tenté 🤔',
      timestamp: '2024-12-18T13:02:00Z'
    }
  ]
};

// ===== POSTS MOCK =====

// Post Simple
const mockSimplePost: FeedPost = {
  id: 'post-1',
  type: 'simple',
  author: mockAuthors[0],
  content: 'Soirée incroyable hier au Parc des Princes ! L\'ambiance était électrique et le PSG a offert un spectacle magnifique. Rien de tel qu\'un match de foot pour rassembler les passionnés ! ⚽️🔥 #PSG #Football',
  timestamp: '2024-12-18T20:30:00Z',
  reactions: createMockReactions(47, 8, 12, true),
  activityId: 'activity-1', 
  tags: ['PSG', 'Football'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 47, comment: 8, share: 12 },
    own_reactions: { like: [{ user_id: 'current-user' }] },
    latest_reactions: { 
      like: [
        { user_id: 'user-2', username: 'emma_dubois' },
        { user_id: 'user-3', username: 'antoine_bernard' }
      ] 
    }
  },
  media: []
};

// Post Tip (Prédiction)
const mockTipPost: FeedPost = {
  id: 'post-2', 
  type: 'prediction',
  author: mockAuthors[1],
  content: 'Match décisif demain ! United à domicile avec leur forme récente, je vois une victoire serrée. L\'attaque de United en grande forme ces dernières semaines. 📊',
  timestamp: '2024-12-18T16:45:00Z',
  reactions: createMockReactions(23, 5, 3),
  activityId: 'activity-2',
  tags: ['Premier League', 'Manchester United', 'Arsenal'],
  prediction: {
    match: {
      id: 'match-mu-arsenal-001',
      date: '2024-12-19T15:00:00Z',
      homeId: 'team-mu',
      homeName: 'Manchester United',
      awayId: 'team-arsenal',
      awayName: 'Arsenal',
      league: 'Premier League',
      leagueId: 'league-pl'
    },
    selection: {
      marketType: 'Résultat final',
      pick: 'Victoire Manchester United',
      odds: 2.10,
      conditionId: 'condition-mu-arsenal-001',
      outcomeId: 'outcome-mu-win'
    },
    analysis: 'Manchester United montre une excellente forme à domicile avec 8 victoires sur les 10 derniers matchs à Old Trafford. Arsenal sans plusieurs titulaires.',
    confidence: 75,
    hashtags: ['Premier League', 'Manchester United', 'Arsenal']
  } as PredictionData,
  streamReactionData: {
    reaction_counts: { like: 23, comment: 5, share: 3 },
    own_reactions: {},
    latest_reactions: {
      like: [{ user_id: 'user-4', username: 'lea_moreau' }]
    }
  }
};

// Post Bet (Pari)
const mockBetPost: FeedPost = {
  id: 'post-3',
  type: 'bet', 
  author: mockAuthors[2],
  content: 'Excellent match à venir ! Liverpool invaincu à Anfield depuis 12 matchs, la cote est vraiment intéressante. Les Reds sont en grande forme ! 🚀',
  timestamp: '2024-12-18T14:20:00Z',
  reactions: createMockReactions(31, 7, 9),
  activityId: 'activity-3',
  tags: ['Liverpool', 'Chelsea', 'Premier League'],
  bet: {
    selections: [{
      marketType: 'Résultat final',
      pick: 'Victoire Liverpool',
      odds: 1.85,
      conditionId: 'condition-liv-che-001',
      outcomeId: 'outcome-liv-win',
      matchName: 'Liverpool vs Chelsea',
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      league: 'Premier League',
      leagueId: 'league-pl',
      startsAt: '2024-12-20T17:30:00Z'
    }],
    bet_type: 'simple',
    analysis: 'Liverpool à domicile reste une forteresse. Avec Salah et Mané en forme, plus la qualité de leur pressing, je vois une victoire assez nette.',
    betAmount: 50,
    currency: 'USDT',
    hashtags: ['Liverpool', 'Chelsea', 'Premier League']
  } as BetData,
  streamReactionData: {
    reaction_counts: { like: 31, comment: 7, share: 9 },
    own_reactions: {},
    latest_reactions: {
      like: [
        { user_id: 'user-5', username: 'maxime_rousseau' },
        { user_id: 'user-7', username: 'thomas_garcia' }
      ]
    }
  }
};

// Post Opinion
const mockOpinionPost: FeedPost = {
  id: 'post-4',
  type: 'opinion',
  author: mockAuthors[3],
  content: 'Débat : Pensez-vous que la VAR améliore vraiment le football moderne ? Personnellement, je trouve qu\'elle casse parfois l\'émotion du jeu... Votre avis ? ⚖️',
  timestamp: '2024-12-18T11:15:00Z', 
  reactions: createMockReactions(18, 15, 4),
  activityId: 'activity-4',
  tags: ['VAR', 'Football', 'Débat'],
  opinion: {
    title: 'La VAR dans le football moderne',
    category: 'Technologie',
    stance: 'against'
  } as OpinionData,
  streamReactionData: {
    reaction_counts: { like: 18, comment: 15, share: 4 },
    own_reactions: {},
    latest_reactions: {
      comment: [
        { user_id: 'user-6', username: 'chloe_petit' },
        { user_id: 'user-8', username: 'sarah_martinez' }
      ]
    }
  }
};

// Post Simple avec média
const mockMediaPost: FeedPost = {
  id: 'post-5',
  type: 'simple',
  author: mockAuthors[4],
  content: 'Magnifique coucher de soleil au stade aujourd\'hui ! Ces moments avant le match, c\'est magique ✨ #StadiumLife #Football',
  timestamp: '2024-12-18T10:30:00Z',
  reactions: createMockReactions(65, 4, 8, true),
  activityId: 'activity-5',
  tags: ['StadiumLife', 'Football'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 65, comment: 4, share: 8 },
    own_reactions: { like: [{ user_id: 'current-user' }] },
    latest_reactions: {
      like: [
        { user_id: 'user-1', username: 'jules_martin' },
        { user_id: 'user-7', username: 'thomas_garcia' }
      ]
    }
  },
  media: [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop',
      alt: 'Coucher de soleil au stade'
    }
  ]
};

// Post avec carrousel - plusieurs images
const mockCarouselPost: FeedPost = {
  id: 'post-7',
  type: 'simple',
  author: mockAuthors[7],
  content: 'Séance d\'entraînement intense aujourd\'hui ! L\'équipe se prépare pour le match de demain. Ambiance, technique, physique... tout y est ! 💪⚽️ #Training #TeamSpirit',
  timestamp: '2024-12-18T08:15:00Z',
  reactions: createMockReactions(142, 18, 24, false),
  activityId: 'activity-7',
  tags: ['Training', 'TeamSpirit', 'Football'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 142, comment: 18, share: 24 },
    own_reactions: {},
    latest_reactions: {
      like: [
        { user_id: 'user-1', username: 'jules_martin' },
        { user_id: 'user-3', username: 'antoine_bernard' },
        { user_id: 'user-5', username: 'maxime_rousseau' }
      ]
    }
  },
  media: [
    {
      id: 'img-1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
      alt: 'Échauffement des joueurs sur le terrain'
    },
    {
      id: 'img-2', 
      type: 'image',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      alt: 'Exercices techniques avec le ballon'
    },
    {
      id: 'img-3',
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1506629905607-31307e8cfb6d?w=800&h=600&fit=crop',
      alt: 'Sprint et préparation physique'
    },
    {
      id: 'img-4',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1554344728-026914bcbc13?w=800&h=600&fit=crop',
      alt: 'Travail tactique en groupe'
    },
    {
      id: 'img-5',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=600&fit=crop',
      alt: 'Célébration après l\'entraînement'
    }
  ]
};

// Tip complexe avec analyse
const mockAdvancedTipPost: FeedPost = {
  id: 'post-6',
  type: 'prediction',
  author: mockAuthors[5],
  content: 'Le Clasico approche ! Analyse complète de ce match décisif. Real en grande forme, Barça qui retrouve des couleurs... Match très ouvert ! 📈⚽️',
  timestamp: '2024-12-18T09:45:00Z',
  reactions: createMockReactions(89, 23, 15),
  activityId: 'activity-6',
  tags: ['Clasico', 'Real Madrid', 'Barcelona', 'La Liga'],
  prediction: {
    match: {
      id: 'match-clasico-001',
      date: '2024-12-20T20:00:00Z',
      homeId: 'team-real',
      homeName: 'Real Madrid',
      awayId: 'team-barca',
      awayName: 'Barcelona', 
      league: 'La Liga',
      leagueId: 'league-laliga'
    },
    selection: {
      marketType: 'Résultat final',
      pick: 'Victoire Real Madrid',
      odds: 2.25,
      conditionId: 'condition-clasico-001',
      outcomeId: 'outcome-real-win'
    },
    analysis: 'Le Real Madrid affiche une forme éblouissante avec Bellingham et Vinicius Jr en état de grâce. Barcelona progresse mais reste fragile défensivement face aux gros.',
    confidence: 68,
    hashtags: ['Clasico', 'Real Madrid', 'Barcelona', 'La Liga']
  } as PredictionData,
  streamReactionData: {
    reaction_counts: { like: 89, comment: 23, share: 15 },
    own_reactions: {},
    latest_reactions: {
      like: [
        { user_id: 'user-2', username: 'emma_dubois' },
        { user_id: 'user-4', username: 'lea_moreau' },
        { user_id: 'user-8', username: 'sarah_martinez' }
      ],
      comment: [
        { user_id: 'user-1', username: 'jules_martin' },
        { user_id: 'user-6', username: 'chloe_petit' }
      ]
    }
  }
};

// Post Highlight avec vidéo
const mockHighlightVideoPost: FeedPost = {
  id: 'post-highlight-1',
  type: 'highlight',
  author: mockAuthors[0], // leo_skills10
  content: 'But incroyable de Mbappé à la 89e minute ! ⚽️🔥 Le geste parfait pour arracher la victoire !',
  timestamp: '2024-12-19T21:30:00Z',
  reactions: createMockReactions(456, 78, 92, true),
  activityId: 'activity-highlight-1',
  tags: ['PSG', 'Mbappé', 'Goal', 'Ligue1'],
  highlightContent: {
    type: 'goal',
    match: {
      id: 'match-psg-om',
      homeTeam: 'Paris Saint-Germain',
      awayTeam: 'Olympique de Marseille',
      league: 'Ligue 1',
    },
    data: {
      minute: '89\'',
      score: '2-1',
      assist: 'Neymar',
    },
    video: {
      id: 'highlight-video-1',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    }
  },
  streamReactionData: {
    reaction_counts: { like: 456, comment: 78, share: 92 },
    own_reactions: { like: [{ user_id: 'current-user' }] },
    latest_reactions: {
      like: [
        { user_id: 'user-1', username: 'jules_martin' },
        { user_id: 'user-2', username: 'emma_dubois' },
        { user_id: 'user-3', username: 'antoine_bernard' }
      ]
    }
  }
};

// Post vidéo Instagram style avec autoplay
const mockInstagramVideoPost: FeedPost = {
  id: 'post-instagram-1',
  type: 'simple',
  author: mockAuthors[0], // leo_skills10
  content: 'Les meilleurs skills du weekend ! 🔥⚽️ Qui veut voir plus de contenu comme ça ? #SkillGoals #Football #Reels #Viral',
  timestamp: '2024-12-19T08:30:00Z',
  reactions: createMockReactions(234, 42, 18, false),
  activityId: 'activity-instagram-1',
  tags: ['SkillGoals', 'Football', 'Reels', 'Viral'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 234, comment: 42, share: 18 },
    own_reactions: {},
    latest_reactions: {
      like: [
        { user_id: 'user-1', username: 'jules_martin' },
        { user_id: 'user-2', username: 'emma_dubois' },
        { user_id: 'user-3', username: 'antoine_bernard' }
      ]
    }
  },
  media: [
    {
      id: 'video-instagram-1',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      alt: 'Skills de football impressionnants'
    }
  ]
};

// Post NBA - Prédiction Lakers
const mockNBATipPost: FeedPost = {
  id: 'post-nba-1',
  type: 'prediction',
  author: mockAuthors[9],
  content: 'LeBron et AD en pleine forme ! Lakers vs Warriors ce soir, je vois une grosse performance offensive des Lakers 🏀🔥',
  timestamp: '2024-12-19T18:00:00Z',
  reactions: createMockReactions(156, 34, 21),
  activityId: 'activity-nba-1',
  tags: ['NBA', 'Lakers', 'Warriors'],
  prediction: {
    match: {
      id: 'match-lakers-warriors',
      date: '2024-12-20T02:00:00Z',
      homeId: 'team-lakers',
      homeName: 'Los Angeles Lakers',
      awayId: 'team-warriors',
      awayName: 'Golden State Warriors',
      league: 'NBA',
      leagueId: 'league-nba'
    },
    selection: {
      marketType: 'Total Points',
      pick: 'Over 225.5',
      odds: 1.90,
      conditionId: 'condition-lakers-warriors',
      outcomeId: 'outcome-over'
    },
    analysis: 'Les deux équipes jouent à un rythme élevé. LeBron et Curry sont en forme, match spectaculaire en perspective.',
    confidence: 72,
    hashtags: ['NBA', 'Lakers', 'Warriors']
  } as PredictionData,
  streamReactionData: {
    reaction_counts: { like: 156, comment: 34, share: 21 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-10', username: 'marie_laurent' }] }
  }
};

// Post Tennis - Opinion
const mockTennisOpinion: FeedPost = {
  id: 'post-tennis-1',
  type: 'opinion',
  author: mockAuthors[11],
  content: 'Djokovic vs Alcaraz, le clash des générations ! Qui selon vous dominera le tennis en 2025 ? Le GOAT expérimenté ou le jeune prodige ? 🎾',
  timestamp: '2024-12-19T15:30:00Z',
  reactions: createMockReactions(203, 67, 19),
  activityId: 'activity-tennis-1',
  tags: ['Tennis', 'Djokovic', 'Alcaraz'],
  opinion: {
    title: 'Le futur du tennis',
    category: 'Tennis',
    stance: 'neutral'
  } as OpinionData,
  streamReactionData: {
    reaction_counts: { like: 203, comment: 67, share: 19 },
    own_reactions: {},
    latest_reactions: { comment: [{ user_id: 'user-12', username: 'sophie_blanc' }] }
  }
};

// Post Bundesliga - Bet
const mockBundesligaBet: FeedPost = {
  id: 'post-bundesliga-1',
  type: 'bet',
  author: mockAuthors[13],
  content: 'Bayern à domicile contre Dortmund, le classique allemand ! Les Bavarois imbattables à l\'Allianz Arena ⚽️💪',
  timestamp: '2024-12-19T13:15:00Z',
  reactions: createMockReactions(178, 41, 28),
  activityId: 'activity-bundesliga-1',
  tags: ['Bundesliga', 'Bayern', 'Dortmund'],
  bet: {
    selections: [{
      marketType: 'Résultat final',
      pick: 'Victoire Bayern Munich',
      odds: 1.65,
      conditionId: 'condition-bayern-dortmund',
      outcomeId: 'outcome-bayern-win',
      matchName: 'Bayern Munich vs Borussia Dortmund',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      league: 'Bundesliga',
      leagueId: 'league-bundesliga',
      startsAt: '2024-12-21T17:30:00Z'
    }],
    bet_type: 'simple',
    analysis: 'Bayern a gagné 8 des 10 derniers derbys. Leur attaque est en feu avec Kane et Musiala.',
    betAmount: 100,
    currency: 'USDT',
    hashtags: ['Bundesliga', 'Bayern', 'Dortmund']
  } as BetData,
  streamReactionData: {
    reaction_counts: { like: 178, comment: 41, share: 28 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-14', username: 'camille_roux' }] }
  }
};

// Post Simple - Motivation
const mockMotivationPost: FeedPost = {
  id: 'post-motivation-1',
  type: 'simple',
  author: mockAuthors[15],
  content: 'Chaque défaite est une leçon, chaque victoire est une célébration. Le sport nous apprend à ne jamais abandonner 💪🏆 #Motivation #Sport',
  timestamp: '2024-12-19T12:00:00Z',
  reactions: createMockReactions(421, 56, 73),
  activityId: 'activity-motivation-1',
  tags: ['Motivation', 'Sport'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 421, comment: 56, share: 73 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-16', username: 'nina_rossi' }] }
  },
  media: [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
      alt: 'Athlète en action'
    }
  ]
};

// Post Serie A - Tip
const mockSerieATip: FeedPost = {
  id: 'post-seriea-1',
  type: 'prediction',
  author: mockAuthors[17],
  content: 'Inter Milan en grande forme ! Lautaro Martinez est en feu avec 15 buts cette saison. Je vois une victoire confortable ce weekend 🇮🇹⚽️',
  timestamp: '2024-12-19T11:00:00Z',
  reactions: createMockReactions(134, 29, 17),
  activityId: 'activity-seriea-1',
  tags: ['SerieA', 'Inter', 'Lautaro'],
  prediction: {
    match: {
      id: 'match-inter-napoli',
      date: '2024-12-21T19:45:00Z',
      homeId: 'team-inter',
      homeName: 'Inter Milan',
      awayId: 'team-napoli',
      awayName: 'SSC Napoli',
      league: 'Serie A',
      leagueId: 'league-seriea'
    },
    selection: {
      marketType: 'Résultat final',
      pick: 'Victoire Inter Milan',
      odds: 1.75,
      conditionId: 'condition-inter-napoli',
      outcomeId: 'outcome-inter-win'
    },
    analysis: 'Inter domine à domicile cette saison. Lautaro et Thuram forment un duo redoutable.',
    confidence: 78,
    hashtags: ['SerieA', 'Inter', 'Lautaro']
  } as PredictionData,
  streamReactionData: {
    reaction_counts: { like: 134, comment: 29, share: 17 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-18', username: 'olivia_martin' }] }
  }
};

// Post UFC - Opinion
const mockUFCOpinion: FeedPost = {
  id: 'post-ufc-1',
  type: 'opinion',
  author: mockAuthors[10],
  content: 'Combat de l\'année à venir ! Jones vs Miocic, qui remporte ce choc des titans ? Le striking de Stipe ou la polyvalence de Jon Jones ? 🥊',
  timestamp: '2024-12-19T10:30:00Z',
  reactions: createMockReactions(287, 93, 42),
  activityId: 'activity-ufc-1',
  tags: ['UFC', 'JonJones', 'Miocic'],
  opinion: {
    title: 'Combat UFC heavyweight',
    category: 'MMA',
    stance: 'for'
  } as OpinionData,
  streamReactionData: {
    reaction_counts: { like: 287, comment: 93, share: 42 },
    own_reactions: {},
    latest_reactions: { comment: [{ user_id: 'user-19', username: 'marco_gonzalez' }] }
  }
};

// Post Ligue 1 - Simple avec carrousel
const mockLigue1CarouselPost: FeedPost = {
  id: 'post-ligue1-carousel',
  type: 'simple',
  author: mockAuthors[2],
  content: 'Journée incroyable de Ligue 1 ! Tous les résultats et les meilleurs moments du weekend 📸⚽️ #Ligue1 #Football',
  timestamp: '2024-12-19T09:00:00Z',
  reactions: createMockReactions(312, 48, 56),
  activityId: 'activity-ligue1-carousel',
  tags: ['Ligue1', 'Football'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 312, comment: 48, share: 56 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-3', username: 'antoine_bernard' }] }
  },
  media: [
    {
      id: 'ligue1-img-1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
      alt: 'Action de match Ligue 1'
    },
    {
      id: 'ligue1-img-2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop',
      alt: 'Célébration de but'
    },
    {
      id: 'ligue1-img-3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop',
      alt: 'Tribune de supporters'
    }
  ]
};

// Post NFL - Tip
const mockNFLTip: FeedPost = {
  id: 'post-nfl-1',
  type: 'prediction',
  author: mockAuthors[16],
  content: 'NFL Sunday Night ! Chiefs vs Bills, le match de la semaine 🏈 Mahomes est imbattable en playoffs, mais Allen veut sa revanche !',
  timestamp: '2024-12-19T07:45:00Z',
  reactions: createMockReactions(267, 58, 39),
  activityId: 'activity-nfl-1',
  tags: ['NFL', 'Chiefs', 'Bills'],
  prediction: {
    match: {
      id: 'match-chiefs-bills',
      date: '2024-12-22T01:20:00Z',
      homeId: 'team-chiefs',
      homeName: 'Kansas City Chiefs',
      awayId: 'team-bills',
      awayName: 'Buffalo Bills',
      league: 'NFL',
      leagueId: 'league-nfl'
    },
    selection: {
      marketType: 'Total Points',
      pick: 'Over 48.5',
      odds: 1.85,
      conditionId: 'condition-chiefs-bills',
      outcomeId: 'outcome-over'
    },
    analysis: 'Deux attaques explosives. Mahomes et Allen vont mettre le feu, match à gros score garanti.',
    confidence: 81,
    hashtags: ['NFL', 'Chiefs', 'Bills']
  } as PredictionData,
  streamReactionData: {
    reaction_counts: { like: 267, comment: 58, share: 39 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-17', username: 'hugo_silva' }] }
  }
};

// Post Champions League - Bet
const mockCLBet: FeedPost = {
  id: 'post-cl-1',
  type: 'bet',
  author: mockAuthors[4],
  content: 'Soirée Champions League ! City reçoit le PSG, Guardiola vs Luis Enrique 🏆 Les Citizens sont favoris à domicile',
  timestamp: '2024-12-18T22:30:00Z',
  reactions: createMockReactions(389, 72, 61),
  activityId: 'activity-cl-1',
  tags: ['UCL', 'ManCity', 'PSG'],
  bet: {
    selections: [{
      marketType: 'Les deux équipes marquent',
      pick: 'Oui',
      odds: 1.70,
      conditionId: 'condition-city-psg',
      outcomeId: 'outcome-btts-yes',
      matchName: 'Manchester City vs Paris Saint-Germain',
      homeTeam: 'Manchester City',
      awayTeam: 'Paris Saint-Germain',
      league: 'UEFA Champions League',
      leagueId: 'league-ucl',
      startsAt: '2024-12-20T20:00:00Z'
    }],
    bet_type: 'simple',
    analysis: 'Match ouvert entre deux équipes offensives. City solide à domicile mais PSG dangereux en contre.',
    betAmount: 75,
    currency: 'USDT',
    hashtags: ['UCL', 'ManCity', 'PSG']
  } as BetData,
  streamReactionData: {
    reaction_counts: { like: 389, comment: 72, share: 61 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-5', username: 'maxime_rousseau' }] }
  }
};

// Post F1 - Opinion
const mockF1Opinion: FeedPost = {
  id: 'post-f1-1',
  type: 'opinion',
  author: mockAuthors[12],
  content: 'Verstappen vs Hamilton, le duel continue ! Qui mérite le plus d\'être considéré comme le GOAT de la F1 ? 🏎️🏁 #F1 #GOAT',
  timestamp: '2024-12-18T21:00:00Z',
  reactions: createMockReactions(512, 148, 87),
  activityId: 'activity-f1-1',
  tags: ['F1', 'Verstappen', 'Hamilton'],
  opinion: {
    title: 'Le GOAT de la F1',
    category: 'Formule 1',
    stance: 'neutral'
  } as OpinionData,
  streamReactionData: {
    reaction_counts: { like: 512, comment: 148, share: 87 },
    own_reactions: {},
    latest_reactions: { comment: [{ user_id: 'user-13', username: 'lucas_fernandez' }] }
  }
};

// Post Simple - Stadium atmosphere
const mockStadiumPost: FeedPost = {
  id: 'post-stadium-1',
  type: 'simple',
  author: mockAuthors[6],
  content: 'Il n\'y a rien de comparable à l\'atmosphère d\'un stade un soir de match ! Les frissons, les chants, l\'émotion pure ⚽️❤️ #StadiumVibes',
  timestamp: '2024-12-18T19:30:00Z',
  reactions: createMockReactions(678, 91, 124),
  activityId: 'activity-stadium-1',
  tags: ['StadiumVibes', 'Football'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 678, comment: 91, share: 124 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-7', username: 'thomas_garcia' }] }
  },
  media: [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop',
      alt: 'Stade plein de supporters'
    }
  ]
};

// Post LaLiga - Tip
const mockLaLigaTip: FeedPost = {
  id: 'post-laliga-2',
  type: 'prediction',
  author: mockAuthors[8],
  content: 'Atlético Madrid vs Sevilla ! Les Colchoneros sont redoutables au Wanda Metropolitano 🔴⚪️ Simeone toujours stratège',
  timestamp: '2024-12-18T17:00:00Z',
  reactions: createMockReactions(198, 37, 23),
  activityId: 'activity-laliga-2',
  tags: ['LaLiga', 'Atletico', 'Sevilla'],
  prediction: {
    match: {
      id: 'match-atletico-sevilla',
      date: '2024-12-21T20:00:00Z',
      homeId: 'team-atletico',
      homeName: 'Atlético Madrid',
      awayId: 'team-sevilla',
      awayName: 'Sevilla FC',
      league: 'La Liga',
      leagueId: 'league-laliga'
    },
    selection: {
      marketType: 'Résultat final',
      pick: 'Victoire Atlético Madrid',
      odds: 1.80,
      conditionId: 'condition-atletico-sevilla',
      outcomeId: 'outcome-atletico-win'
    },
    analysis: 'Atlético en forme, défense solide et Griezmann inspiré. Sevilla peine en déplacement cette saison.',
    confidence: 73,
    hashtags: ['LaLiga', 'Atletico', 'Sevilla']
  } as PredictionData,
  streamReactionData: {
    reaction_counts: { like: 198, comment: 37, share: 23 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-9', username: 'kevin_james' }] }
  }
};

// Post Basketball Euroleague - Bet
const mockEuroleagueBet: FeedPost = {
  id: 'post-euroleague-1',
  type: 'bet',
  author: mockAuthors[14],
  content: 'Euroleague ce soir ! Real Madrid Basket à domicile, ils sont imbattables en Europe cette saison 🏀👑',
  timestamp: '2024-12-18T16:00:00Z',
  reactions: createMockReactions(145, 28, 19),
  activityId: 'activity-euroleague-1',
  tags: ['Euroleague', 'RealMadrid', 'Basketball'],
  bet: {
    selections: [{
      marketType: 'Handicap',
      pick: 'Real Madrid -5.5',
      odds: 1.95,
      conditionId: 'condition-real-efes',
      outcomeId: 'outcome-real-handicap',
      matchName: 'Real Madrid vs Anadolu Efes',
      homeTeam: 'Real Madrid',
      awayTeam: 'Anadolu Efes',
      league: 'Euroleague',
      leagueId: 'league-euroleague',
      startsAt: '2024-12-20T20:30:00Z'
    }],
    bet_type: 'simple',
    analysis: 'Real domine à domicile avec une défense exceptionnelle. Campazzo et Hezonja en grande forme.',
    betAmount: 60,
    currency: 'USDT',
    hashtags: ['Euroleague', 'RealMadrid', 'Basketball']
  } as BetData,
  streamReactionData: {
    reaction_counts: { like: 145, comment: 28, share: 19 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-15', username: 'alex_thompson' }] }
  }
};

// Post Premier League - Simple
const mockPLSimplePost: FeedPost = {
  id: 'post-pl-simple',
  type: 'simple',
  author: mockAuthors[1],
  content: 'La Premier League est vraiment le championnat le plus spectaculaire au monde ! Chaque match est un événement 🏴󐁧󐁢󐁥󐁮󐁧󐁿⚽️ #PremierLeague #Football',
  timestamp: '2024-12-18T15:00:00Z',
  reactions: createMockReactions(543, 76, 92),
  activityId: 'activity-pl-simple',
  tags: ['PremierLeague', 'Football'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 543, comment: 76, share: 92 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-2', username: 'emma_dubois' }] }
  },
  media: []
};

// Post Boxing - Opinion
const mockBoxingOpinion: FeedPost = {
  id: 'post-boxing-1',
  type: 'opinion',
  author: mockAuthors[19],
  content: 'Combat historique à venir ! Fury vs Usyk pour unifier tous les titres heavyweight. Qui gagne selon vous ? 🥊👑',
  timestamp: '2024-12-18T14:00:00Z',
  reactions: createMockReactions(378, 112, 54),
  activityId: 'activity-boxing-1',
  tags: ['Boxing', 'Fury', 'Usyk'],
  opinion: {
    title: 'Unification heavyweight boxing',
    category: 'Boxe',
    stance: 'for'
  } as OpinionData,
  streamReactionData: {
    reaction_counts: { like: 378, comment: 112, share: 54 },
    own_reactions: {},
    latest_reactions: { comment: [{ user_id: 'user-20', username: 'laura_petit' }] }
  }
};

// Post Simple - Fitness motivation
const mockFitnessPost: FeedPost = {
  id: 'post-fitness-1',
  type: 'simple',
  author: mockAuthors[18],
  content: 'Séance de training matinale terminée ! 💪 Le sport, c\'est la vie. Restez actifs, restez motivés ! #Fitness #Motivation #HealthyLifestyle',
  timestamp: '2024-12-18T07:00:00Z',
  reactions: createMockReactions(892, 123, 156),
  activityId: 'activity-fitness-1',
  tags: ['Fitness', 'Motivation', 'HealthyLifestyle'],
  simplePost: {},
  streamReactionData: {
    reaction_counts: { like: 892, comment: 123, share: 156 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-19', username: 'marco_gonzalez' }] }
  },
  media: [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
      alt: 'Entraînement fitness'
    }
  ]
};

// Post Ligue des Champions - Tip multiple (PARLAY avec 3 sélections)
const mockCLMultipleTip: FeedPost = {
  id: 'post-cl-multiple',
  type: 'prediction',
  author: mockAuthors[5],
  content: 'Soirée de fou en Champions League ! Bayern, Barça et Arsenal tous favoris ce soir. Triple combiné à tenter ? 🎯⚽️',
  timestamp: '2024-12-18T18:30:00Z',
  reactions: createMockReactions(267, 51, 38),
  activityId: 'activity-cl-multiple',
  tags: ['UCL', 'Bayern', 'Barcelona', 'Arsenal'],
  prediction: {
    match: {
      id: 'match-multiple-cl',
      date: '2024-12-20T20:00:00Z',
      homeId: 'multiple',
      homeName: 'Combiné 3 matchs',
      awayId: 'multiple',
      awayName: 'UCL',
      league: 'UEFA Champions League',
      leagueId: 'league-ucl'
    },
    bet_type: 'combiné',
    selections: [
      {
        marketType: 'Résultat final',
        pick: 'Victoire Bayern Munich',
        odds: 1.65,
        matchName: 'Bayern Munich vs Copenhagen',
        conditionId: 'condition-bayern',
        outcomeId: 'outcome-bayern-win'
      },
      {
        marketType: 'Résultat final',
        pick: 'Victoire Barcelona',
        odds: 1.75,
        matchName: 'Barcelona vs Napoli',
        conditionId: 'condition-barca',
        outcomeId: 'outcome-barca-win'
      },
      {
        marketType: 'Résultat final',
        pick: 'Victoire Arsenal',
        odds: 1.55,
        matchName: 'Arsenal vs Porto',
        conditionId: 'condition-arsenal',
        outcomeId: 'outcome-arsenal-win'
      }
    ],
    analysis: 'Bayern domine en Allemagne, Barça retrouve sa forme et Arsenal invaincu à domicile. Combiné risqué mais juteux.',
    confidence: 65,
    betAmount: 50,
    currency: 'EUR',
    hashtags: ['UCL', 'Bayern', 'Barcelona', 'Arsenal']
  } as PredictionData,
  streamReactionData: {
    reaction_counts: { like: 267, comment: 51, share: 38 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-6', username: 'chloe_petit' }] }
  }
};

// Post Parlay 2 matchs - Premier League
const mockPLParlayTip: FeedPost = {
  id: 'post-pl-parlay',
  type: 'prediction',
  author: mockAuthors[2],
  content: 'Double victoire ce weekend en PL ! Man City et Liverpool vont régaler 🔥⚽️',
  timestamp: '2024-12-18T13:00:00Z',
  reactions: createMockReactions(198, 42, 27),
  activityId: 'activity-pl-parlay',
  tags: ['PremierLeague', 'ManCity', 'Liverpool'],
  prediction: {
    match: {
      id: 'match-pl-parlay',
      date: '2024-12-21T15:00:00Z',
      homeId: 'parlay',
      homeName: 'Combiné 2 matchs',
      awayId: 'parlay',
      awayName: 'PL',
      league: 'Premier League',
      leagueId: 'league-pl'
    },
    bet_type: 'combiné',
    selections: [
      {
        marketType: 'Résultat final',
        pick: 'Victoire Man City',
        odds: 1.40,
        matchName: 'Man City vs Brentford',
        conditionId: 'condition-city',
        outcomeId: 'outcome-city-win'
      },
      {
        marketType: 'Les deux équipes marquent',
        pick: 'Oui',
        odds: 1.70,
        matchName: 'Liverpool vs Chelsea',
        conditionId: 'condition-liv',
        outcomeId: 'outcome-btts'
      }
    ],
    analysis: 'City invincible à domicile et Liverpool-Chelsea toujours spectaculaire. Combiné sûr pour multiplier la mise.',
    confidence: 78,
    betAmount: 75,
    currency: 'EUR',
    hashtags: ['PremierLeague', 'ManCity', 'Liverpool']
  } as PredictionData,
  streamReactionData: {
    reaction_counts: { like: 198, comment: 42, share: 27 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-3', username: 'antoine_bernard' }] }
  }
};

// Post Bet Parlay - LaLiga + Bundesliga
const mockMultiLeagueBet: FeedPost = {
  id: 'post-multi-league-bet',
  type: 'bet',
  author: mockAuthors[7],
  content: 'Parlay audacieux ce soir ! Real Madrid + Bayern Munich, les deux géants européens 👑',
  timestamp: '2024-12-18T19:45:00Z',
  reactions: createMockReactions(321, 67, 45),
  activityId: 'activity-multi-league',
  tags: ['RealMadrid', 'Bayern', 'Parlay'],
  bet: {
    bet_type: 'combiné',
    selections: [
      {
        marketType: 'Résultat final',
        pick: 'Victoire Real Madrid',
        odds: 1.50,
        matchName: 'Real Madrid vs Valencia',
        homeTeam: 'Real Madrid',
        awayTeam: 'Valencia',
        league: 'LaLiga',
        conditionId: 'condition-real',
        outcomeId: 'outcome-real-win'
      },
      {
        marketType: 'Plus de 2.5 buts',
        pick: 'Oui',
        odds: 1.85,
        matchName: 'Bayern Munich vs Dortmund',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Dortmund',
        league: 'Bundesliga',
        conditionId: 'condition-bayern',
        outcomeId: 'outcome-over'
      }
    ],
    analysis: 'Real Madrid écrase à domicile et le Klassiker est toujours explosif. Combiné à 2.78 très intéressant.',
    betAmount: 100,
    currency: 'USDT',
    hashtags: ['RealMadrid', 'Bayern', 'Parlay']
  } as BetData,
  streamReactionData: {
    reaction_counts: { like: 321, comment: 67, share: 45 },
    own_reactions: {},
    latest_reactions: { like: [{ user_id: 'user-8', username: 'sarah_martinez' }] }
  }
};

// Post Bet Parlay - Ligue 1
const mockLigue1Parlay: FeedPost = {
  id: 'bet-parlay-ligue1',
  activityId: 'bet-parlay-ligue1',
  type: 'bet',
  author: mockAuthors[0],
  content: '🔥 Parlay solide sur la Ligue 1 ce soir ! PSG et OM pour la victoire, confiance maximale 💪',
  timestamp: '2024-01-22T18:30:00Z',
  reactions: createMockReactions(142, 31, 18),
  bet: {
    bet_type: 'combiné',
    betAmount: 100,
    currency: 'EUR',
    selections: [
      {
        matchName: 'PSG vs Lens',
        marketType: 'Match Winner',
        pick: 'PSG',
        odds: 1.65,
        league: 'Ligue 1',
        conditionId: 'cond_psg_lens_001',
        outcomeId: 'out_psg_win_001'
      },
      {
        matchName: 'OM vs Nice',
        marketType: 'Match Winner',
        pick: 'OM',
        odds: 1.80,
        league: 'Ligue 1',
        conditionId: 'cond_om_nice_001',
        outcomeId: 'out_om_win_001'
      }
    ],
    analysis: 'PSG domine à domicile et l\'OM est en grande forme. Un combiné sûr avec une cote de 2.97.'
  } as BetData
};

// Post Bet Parlay - Premier League
const mockPLParlay: FeedPost = {
  id: 'bet-parlay-pl',
  activityId: 'bet-parlay-pl',
  type: 'bet',
  author: mockAuthors[2],
  content: 'Arsenal et Tottenham vont tout écraser aujourd\'hui ! Le Nord de Londres en feu 🔴⚪️',
  timestamp: '2024-01-22T14:15:00Z',
  reactions: createMockReactions(189, 44, 27),
  bet: {
    bet_type: 'combiné',
    betAmount: 150,
    currency: 'EUR',
    selections: [
      {
        matchName: 'Arsenal vs Newcastle',
        marketType: 'Match Winner',
        pick: 'Arsenal',
        odds: 1.55,
        league: 'Premier League',
        conditionId: 'cond_ars_new_001',
        outcomeId: 'out_ars_win_001'
      },
      {
        matchName: 'Tottenham vs Aston Villa',
        marketType: 'Match Winner',
        pick: 'Tottenham',
        odds: 1.90,
        league: 'Premier League',
        conditionId: 'cond_tot_vil_001',
        outcomeId: 'out_tot_win_001'
      }
    ],
    analysis: 'Arsenal invincible à l\'Emirates et Tottenham retrouve sa forme. Cote de 2.95 très attractive.'
  } as BetData
};

// Post Bet Parlay - Serie A
const mockSerieAParlay: FeedPost = {
  id: 'bet-parlay-seriea',
  activityId: 'bet-parlay-seriea',
  type: 'bet',
  author: mockAuthors[4],
  content: 'Les géants milanais vont dominer ! Inter et Milan, victoires assurées ce week-end 🇮🇹⚽️',
  timestamp: '2024-01-21T20:45:00Z',
  reactions: createMockReactions(167, 38, 22),
  bet: {
    bet_type: 'combiné',
    betAmount: 80,
    currency: 'EUR',
    selections: [
      {
        matchName: 'Inter vs Lazio',
        marketType: 'Match Winner',
        pick: 'Inter',
        odds: 1.70,
        league: 'Serie A',
        conditionId: 'cond_int_laz_001',
        outcomeId: 'out_int_win_001'
      },
      {
        matchName: 'AC Milan vs Roma',
        marketType: 'Match Winner',
        pick: 'AC Milan',
        odds: 1.75,
        league: 'Serie A',
        conditionId: 'cond_mil_rom_001',
        outcomeId: 'out_mil_rom_001'
      }
    ],
    analysis: 'Inter leader incontesté et Milan qui revient fort. Combiné à 2.98, excellent rapport risque/récompense.'
  } as BetData
};

// Post Bet Parlay - Bundesliga
const mockBundesligaParlay: FeedPost = {
  id: 'bet-parlay-bundesliga',
  activityId: 'bet-parlay-bundesliga',
  type: 'bet',
  author: mockAuthors[1],
  content: 'Bundesliga en mode folie ! Bayern et Dortmund, double victoire incoming 🇩🇪💥',
  timestamp: '2024-01-21T16:00:00Z',
  reactions: createMockReactions(201, 52, 31),
  bet: {
    bet_type: 'combiné',
    betAmount: 120,
    currency: 'EUR',
    selections: [
      {
        matchName: 'Bayern Munich vs RB Leipzig',
        marketType: 'Match Winner',
        pick: 'Bayern Munich',
        odds: 1.50,
        league: 'Bundesliga',
        conditionId: 'cond_bay_lei_001',
        outcomeId: 'out_bay_win_001'
      },
      {
        matchName: 'Borussia Dortmund vs Bayer Leverkusen',
        marketType: 'Match Winner',
        pick: 'Borussia Dortmund',
        odds: 2.10,
        league: 'Bundesliga',
        conditionId: 'cond_dor_lev_001',
        outcomeId: 'out_dor_win_001'
      }
    ],
    analysis: 'Bayern inarrêtable à l\'Allianz Arena et Dortmund en pleine confiance. Cote de 3.15, je signe !'
  } as BetData
};

// Post Bet Parlay - Mixed Leagues
const mockMixedParlay: FeedPost = {
  id: 'bet-parlay-mixed',
  activityId: 'bet-parlay-mixed',
  type: 'bet',
  author: mockAuthors[3],
  content: 'Combo de dingue ! Real Madrid à domicile et Man United qui se réveille, let\'s go ! 🏆🔴',
  timestamp: '2024-01-20T19:30:00Z',
  reactions: createMockReactions(224, 61, 39),
  bet: {
    bet_type: 'combiné',
    betAmount: 75,
    currency: 'EUR',
    selections: [
      {
        matchName: 'Real Madrid vs Atlético Madrid',
        marketType: 'Match Winner',
        pick: 'Real Madrid',
        odds: 1.85,
        league: 'LaLiga',
        conditionId: 'cond_rea_atl_001',
        outcomeId: 'out_rea_win_001'
      },
      {
        matchName: 'Man United vs Liverpool',
        marketType: 'Match Winner',
        pick: 'Man United',
        odds: 2.20,
        league: 'Premier League',
        conditionId: 'cond_mun_liv_001',
        outcomeId: 'out_mun_win_001'
      }
    ],
    analysis: 'Real Madrid écrase tout au Bernabéu et United retrouve son niveau contre Liverpool. Cote de 4.07, énorme potentiel !'
  } as BetData
};

// ===== EXPORT PRINCIPAL =====
export const mockSocialFeedData: FeedPost[] = [
  mockLigue1Parlay,             // 2024-01-22T18:30:00Z (NEW - Parlay PSG + OM)
  mockPLParlay,                 // 2024-01-22T14:15:00Z (NEW - Parlay Arsenal + Tottenham)
  mockSerieAParlay,             // 2024-01-21T20:45:00Z (NEW - Parlay Inter + Milan)
  mockBundesligaParlay,         // 2024-01-21T16:00:00Z (NEW - Parlay Bayern + Dortmund)
  mockMixedParlay,              // 2024-01-20T19:30:00Z (NEW - Parlay Real + Man United)
  mockHighlightVideoPost,       // 2024-12-19T21:30:00Z
  mockCLBet,                    // 2024-12-18T22:30:00Z
  mockF1Opinion,                // 2024-12-18T21:00:00Z
  mockMultiLeagueBet,           // 2024-12-18T19:45:00Z (NEW - Parlay Real + Bayern)
  mockStadiumPost,              // 2024-12-18T19:30:00Z
  mockCLMultipleTip,            // 2024-12-18T18:30:00Z (Updated to Parlay)
  mockNBATipPost,               // 2024-12-19T18:00:00Z
  mockLaLigaTip,                // 2024-12-18T17:00:00Z
  mockTipPost,                  // 2024-12-18T16:45:00Z
  mockEuroleagueBet,            // 2024-12-18T16:00:00Z
  mockTennisOpinion,            // 2024-12-19T15:30:00Z
  mockPLSimplePost,             // 2024-12-18T15:00:00Z
  mockBetPost,                  // 2024-12-18T14:20:00Z
  mockBoxingOpinion,            // 2024-12-18T14:00:00Z
  mockBundesligaBet,            // 2024-12-19T13:15:00Z
  mockPLParlayTip,              // 2024-12-18T13:00:00Z (NEW - Parlay City + Liverpool)
  mockMotivationPost,           // 2024-12-19T12:00:00Z
  mockOpinionPost,              // 2024-12-18T11:15:00Z
  mockSerieATip,                // 2024-12-19T11:00:00Z
  mockUFCOpinion,               // 2024-12-19T10:30:00Z
  mockMediaPost,                // 2024-12-18T10:30:00Z
  mockAdvancedTipPost,          // 2024-12-18T09:45:00Z
  mockLigue1CarouselPost,       // 2024-12-19T09:00:00Z
  mockInstagramVideoPost,       // 2024-12-19T08:30:00Z
  mockCarouselPost,             // 2024-12-18T08:15:00Z
  mockNFLTip,                   // 2024-12-19T07:45:00Z
  mockFitnessPost,              // 2024-12-18T07:00:00Z
  mockSimplePost                // 2024-12-18T20:30:00Z
];

export const getMockComments = (activityId: string): Comment[] => {
  const postId = mockSocialFeedData.find(post => post.activityId === activityId)?.id;
  return postId ? mockComments[postId] || [] : [];
};

export const getMockUser = (): Author => ({
  id: 'current-user',
  username: 'vous',
  fullName: 'Vous',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
});

// Helper pour la pagination
export const getMockFeedPage = (page: number = 1, limit: number = 10): FeedPost[] => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return mockSocialFeedData.slice(startIndex, endIndex);
};

// Helper pour filtrer par type
export const getMockPostsByType = (type: FeedPost['type']): FeedPost[] => {
  return mockSocialFeedData.filter(post => post.type === type);
};