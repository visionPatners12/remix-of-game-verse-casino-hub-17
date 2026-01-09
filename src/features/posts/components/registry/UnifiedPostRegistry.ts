import React, { type ComponentType } from 'react';
import type { PostType, TypedPost, PostComponentProps } from '@/types/posts';

/**
 * Unified registry for both display and creation components
 * KISS: One registry instead of two separate ones
 */
export interface PostComponent<T extends TypedPost = TypedPost> {
  DisplayComponent: ComponentType<PostComponentProps & { post: T }>;
  CreationComponent?: ComponentType<any>;
  displayName: string;
}

class UnifiedPostRegistryImpl {
  private components = new Map<PostType, PostComponent>();

  register<T extends TypedPost>(
    type: PostType, 
    displayComponent: ComponentType<PostComponentProps & { post: T }>,
    displayName: string,
    creationComponent?: ComponentType<any>
  ): void {
    this.components.set(type, {
      DisplayComponent: displayComponent as ComponentType<PostComponentProps & { post: any }>,
      CreationComponent: creationComponent,
      displayName
    });
  }

  getDisplayComponent<T extends TypedPost>(type: PostType): ComponentType<PostComponentProps & { post: T }> | null {
    const component = this.components.get(type);
    return component?.DisplayComponent as ComponentType<PostComponentProps & { post: T }> || null;
  }

  getCreationComponent(type: PostType): ComponentType<any> | null {
    const component = this.components.get(type);
    return component?.CreationComponent || null;
  }

  isRegistered(type: PostType): boolean {
    return this.components.has(type);
  }

  getAvailableTypes(): PostType[] {
    return Array.from(this.components.keys());
  }

  getAll(): Map<PostType, PostComponent> {
    return new Map(this.components);
  }
}

// Singleton instance
export const UnifiedPostRegistry = new UnifiedPostRegistryImpl();

// Factory function for creating post components
export function createPostComponent(post: TypedPost, props: any): JSX.Element | null {
  const DisplayComponent = UnifiedPostRegistry.getDisplayComponent(post.type);
  
  if (!DisplayComponent) {
    console.warn(`No component registered for post type: ${post.type}`);
    return null;
  }

  return React.createElement(DisplayComponent, { post, ...props });
}

// Helper functions
export function getCreationComponent(type: PostType): ComponentType<any> | null {
  return UnifiedPostRegistry.getCreationComponent(type);
}