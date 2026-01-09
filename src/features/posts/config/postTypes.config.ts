import React from 'react';
import { FileText, TrendingUp, MessageSquare, Target, Star } from 'lucide-react';
import type { PostTypeConfig } from '@/types/posts';
import { POST_TYPES } from '@/types/posts';

/**
 * Declarative configuration for all post types
 * Centralized configuration makes it easy to add new types
 */
export const POST_TYPE_CONFIGS: Record<string, PostTypeConfig> = {
  [POST_TYPES.SIMPLE]: {
    type: POST_TYPES.SIMPLE,
    title: 'Simple',
    description: 'Partagez vos pensées',
    icon: React.createElement(FileText, { className: "h-4 w-4" }),
    placeholder: 'Que se passe-t-il dans le sport aujourd\'hui ?',
    category: 'basic',
    fields: {
      required: ['content'],
      optional: ['media', 'hashtags']
    },
    validation: {
      minContentLength: 1,
      maxContentLength: 500
    }
  },

  [POST_TYPES.PREDICTION]: {
    type: POST_TYPES.PREDICTION,
    title: 'Pronostic',
    description: 'Prédire un marché',
    icon: React.createElement(TrendingUp, { className: "h-4 w-4" }),
    placeholder: 'Quel est votre pronostic sur ce marché ?',
    category: 'prediction',
    fields: {
      required: ['predictionContent', 'content'],
      optional: ['hashtags', 'betAmount', 'currency']
    },
    validation: {
      minContentLength: 10,
      requiredFields: ['predictionContent.match', 'predictionContent.selection', 'predictionContent.confidence']
    }
  },

  [POST_TYPES.OPINION]: {
    type: POST_TYPES.OPINION,
    title: 'Opinion',
    description: 'Partager sur un match',
    icon: React.createElement(MessageSquare, { className: "h-4 w-4" }),
    placeholder: 'Partagez votre opinion sur ce match...',
    category: 'social',
    fields: {
      required: ['content'],
      optional: ['opinionContent', 'hashtags']
    },
    validation: {
      minContentLength: 5,
      maxContentLength: 300
    }
  },

  [POST_TYPES.BET]: {
    type: POST_TYPES.BET,
    title: 'Pari',
    description: 'Partager un pari',
    icon: React.createElement(Target, { className: "h-4 w-4" }),
    placeholder: 'Partagez votre pari...',
    category: 'prediction',
    fields: {
      required: ['betContent', 'content'],
      optional: ['hashtags']
    },
    validation: {
      minContentLength: 10,
      requiredFields: ['betContent.match', 'betContent.selection', 'betContent.betAmount']
    }
  },

  [POST_TYPES.HIGHLIGHT]: {
    type: POST_TYPES.HIGHLIGHT,
    title: 'Highlight',
    description: 'Moment fort du match',
    icon: React.createElement(Star, { className: "h-4 w-4" }),
    placeholder: 'Décrivez ce moment fort...',
    category: 'highlight',
    fields: {
      required: ['highlightContent', 'content'],
      optional: ['hashtags']
    },
    validation: {
      minContentLength: 1,
      requiredFields: ['highlightContent.type']
    }
  }
};

// Helper functions
export function getPostTypeConfig(type: string): PostTypeConfig | null {
  return POST_TYPE_CONFIGS[type] || null;
}

export function getAllPostTypeConfigs(): PostTypeConfig[] {
  return Object.values(POST_TYPE_CONFIGS);
}

export function getPostTypesByCategory(category: PostTypeConfig['category']): PostTypeConfig[] {
  return Object.values(POST_TYPE_CONFIGS).filter(config => config.category === category);
}

export function validatePostType(type: string): boolean {
  return type in POST_TYPE_CONFIGS;
}