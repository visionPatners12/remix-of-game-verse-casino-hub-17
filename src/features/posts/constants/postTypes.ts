import React from 'react';
import { FileText, TrendingUp, MessageSquare } from 'lucide-react';
import type { PostTypeConfig } from '../types/creation';

export const POST_TYPES: PostTypeConfig[] = [
  {
    id: 'simple',
    title: 'Simple',
    description: 'Share your thoughts',
    icon: React.createElement(FileText, { className: "h-4 w-4" }),
    placeholder: "What's happening in sports today?"
  },
  {
    id: 'prediction',
    title: 'Prediction',
    description: 'Predict a market',
    icon: React.createElement(TrendingUp, { className: "h-4 w-4" }),
    placeholder: "What's your prediction on this market?"
  },
  {
    id: 'opinion',
    title: 'Opinion',
    description: 'Share about a match',
    icon: React.createElement(MessageSquare, { className: "h-4 w-4" }),
    placeholder: 'Share your opinion on this match...'
  },
];

export const DEFAULT_CONFIDENCE = 75;
export const DEFAULT_CURRENCY = 'EUR' as const;
export const DEFAULT_TIP_VISIBILITY = 'public' as const;