import type { ComponentType } from 'react';
import type { PostType, TypedPost, FeedPost } from './post';
import type { ReactionCounts, ReactionHandlers, Comment } from '../core';

/**
 * Post Component Props - Generic props for post display components
 */
export interface PostComponentProps<T extends TypedPost = TypedPost> {
  post: T;
  reactions: ReactionCounts;
  comments: Comment[];
  showComments: boolean;
  isLoadingComments: boolean;
  onAddComment: (text: string) => void;
  onToggleComments: () => void;
  reactionHandlers: ReactionHandlers;
}

/**
 * Post Component Interface
 */
export interface PostComponent<T extends TypedPost = TypedPost> {
  DisplayComponent: ComponentType<PostComponentProps<T>>;
  CreationComponent?: ComponentType<unknown>;
  displayName: string;
}

/**
 * Post Type Configuration
 */
export interface PostTypeConfig {
  type: PostType;
  title: string;
  description: string;
  icon: React.ReactNode;
  placeholder: string;
  category: 'basic' | 'prediction' | 'social' | 'highlight';
  fields: {
    required: string[];
    optional: string[];
  };
  validation?: {
    minContentLength?: number;
    maxContentLength?: number;
    requiredFields?: string[];
  };
}

/**
 * Unified Post Registry Interface
 */
export interface UnifiedPostRegistry {
  register<T extends TypedPost>(
    type: PostType,
    displayComponent: ComponentType<PostComponentProps<T>>,
    displayName: string,
    creationComponent?: ComponentType<unknown>
  ): void;
  getDisplayComponent<T extends TypedPost>(type: PostType): ComponentType<PostComponentProps<T>> | null;
  getCreationComponent(type: PostType): ComponentType<unknown> | null;
  isRegistered(type: PostType): boolean;
  getAvailableTypes(): PostType[];
}

/**
 * Post Type Plugin - For extension system
 */
export interface PostTypePlugin {
  type: PostType;
  config: PostTypeConfig;
  displayComponent: PostComponent;
  creationComponent?: ComponentType<unknown>;
  services?: {
    create?: (data: unknown) => Promise<void>;
    validate?: (data: unknown) => boolean;
    transform?: (data: unknown) => unknown;
  };
}

/**
 * Plugin Registry
 */
export interface PluginRegistry {
  register(plugin: PostTypePlugin): void;
  unregister(type: PostType): void;
  get(type: PostType): PostTypePlugin | null;
  getAll(): PostTypePlugin[];
  isEnabled(type: PostType): boolean;
}
