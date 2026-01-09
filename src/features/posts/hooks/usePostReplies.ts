import { logger } from '@/utils/logger';

export function usePostReplies() {
  // Mock replies for the post - format compatible avec PostWrapper + SimplePost
  const mockReplies = [
    {
      id: 'reply-1',
      author: {
        username: 'user123',
        fullName: 'User 123',
        avatar: '/placeholder-avatar.jpg'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
      text: "Excellente analyse ! Je suis d'accord avec ton pronostic. L'équipe semble vraiment en forme cette saison.",
      reactions: { likes: 5, comments: 2, shares: 1, userLiked: false },
      tags: []
    },
    {
      id: 'reply-2', 
      author: {
        username: 'bettor_pro',
        fullName: 'Bettor Pro',
        avatar: '/placeholder-avatar.jpg'
      },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h ago
      text: "Intéressant, mais je pense que Liverpool a plus de chances. Leurs stats à domicile sont impressionnantes.",
      reactions: { likes: 12, comments: 0, shares: 3, userLiked: true },
      tags: ['Liverpool', 'Stats']
    },
    {
      id: 'reply-3',
      author: {
        username: 'sports_fan',
        fullName: 'Sports Fan',
        avatar: '/placeholder-avatar.jpg'
      },
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45min ago
      text: "Quelqu'un a vu les dernières nouvelles sur les blessures ? Ça pourrait changer la donne.",
      reactions: { likes: 3, comments: 1, shares: 0, userLiked: false },
      tags: ['Info']
    }
  ];

  const handleReplyReaction = (replyId: string) => ({
    onLike: () => logger.debug(`Like reply ${replyId}`),
    onComment: () => logger.debug(`Comment on reply ${replyId}`),
    onShare: () => logger.debug(`Share reply ${replyId}`)
  });

  return {
    mockReplies,
    handleReplyReaction
  };
}