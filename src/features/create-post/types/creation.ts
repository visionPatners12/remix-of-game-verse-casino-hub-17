// Post Creation Types

export type PostType = 'simple' | 'prediction' | 'opinion';

export interface PostTypeConfig {
  id: PostType;
  title: string;
  description: string;
  icon: React.ReactNode;
  placeholder: string;
}

export interface MediaFile {
  file: File;
  url: string;
  type: 'image' | 'video';
}

export interface PostCreationState {
  selectedType: PostType;
  content: string;
  hashtags: string[];
  newHashtag: string;
  mediaFiles: MediaFile[];
  isSubmitting: boolean;
  
  // Prediction specific
  selectedPrediction: any | null;
  selectedMatch: { matchTitle: string; sport: string; league: string; } | null;
  
  // Premium tip specific
  confidence: number;
  isPremiumTip: boolean;
  betAmount: number;
  currency: 'USD' | 'EUR' | 'STX';
}

export interface PostCreationActions {
  setSelectedType: (type: PostType) => void;
  setContent: (content: string) => void;
  addHashtag: (hashtag?: string) => void;
  removeHashtag: (hashtag: string) => void;
  setNewHashtag: (hashtag: string) => void;
  addMediaFile: (file: MediaFile) => void;
  removeMediaFile: (index: number) => void;
  handlePredictionSelection: (selection: any) => void;
  handleRemovePrediction: () => void;
  setConfidence: (confidence: number) => void;
  setIsPremiumTip: (isPremium: boolean) => void;
  setBetAmount: (amount: number) => void;
  setCurrency: (currency: 'USD' | 'EUR' | 'STX') => void;
  submitPost: () => Promise<void>;
  resetForm: () => void;
}