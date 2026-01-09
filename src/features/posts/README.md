# Posts Feature - Modern Architecture

## Overview

The Posts feature has been refactored with a modern, extensible architecture that makes it easy to add new post types without modifying existing code.

## Architecture

### 🏗️ Core Components

```
src/features/posts/
├── components/
│   ├── registry/           # Component registration system
│   ├── types/             # Post type specific components  
│   ├── creation/          # Legacy creation components
│   ├── ui/               # Reusable UI components
│   └── pages/            # Page components
├── hooks/                # React hooks
├── services/            # Business logic
├── config/              # Configuration files
└── types/               # Legacy types (being migrated)
```

### 🎯 Key Features

- **Registry System**: Dynamic component registration
- **Type Safety**: Full TypeScript support with Zod validation
- **Modular Components**: Each post type is self-contained
- **Easy Extension**: Add new post types with minimal code
- **Backward Compatibility**: Legacy code continues to work

## Adding a New Post Type

### 1. Define the Post Type

```typescript
// Add to src/types/posts/post-types.ts
export const POST_TYPES = {
  // ... existing types
  POLL: 'poll'
} as const;

// Add content schema
export const PollContentSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  allowMultiple: z.boolean().default(false),
  expiresAt: z.string().optional(),
});
```

### 2. Create the Display Component

```typescript
// src/features/posts/components/types/PollPostComponent.tsx
import React from 'react';
import { BasePost } from '@/features/social-feed/components/posts/base/BasePost';
import type { PostComponentProps, PollPost } from '@/types/posts';

export function PollPostComponent(props: PostComponentProps & { post: PollPost }) {
  const { post } = props;
  const poll = post.pollContent;

  return (
    <BasePost {...props}>
      <div className="space-y-3">
        <h3 className="font-semibold">{poll.question}</h3>
        <div className="space-y-2">
          {poll.options.map((option, index) => (
            <button key={index} className="w-full p-2 text-left border rounded hover:bg-muted">
              {option}
            </button>
          ))}
        </div>
      </div>
    </BasePost>
  );
}
```

### 3. Add Configuration

```typescript
// Add to src/features/posts/config/postTypes.config.ts
[POST_TYPES.POLL]: {
  type: POST_TYPES.POLL,
  title: 'Sondage',
  description: 'Créer un sondage',
  icon: React.createElement(BarChart, { className: "h-4 w-4" }),
  placeholder: 'Posez votre question...',
  category: 'social',
  fields: {
    required: ['pollContent', 'content'],
    optional: ['hashtags']
  }
}
```

### 4. Register the Component

```typescript
// Add to src/features/posts/components/registry/registerComponents.ts
PostComponentRegistry.register(POST_TYPES.POLL, {
  Component: PollPostComponent,
  displayName: 'Poll Post',
  category: 'social',
  requiredFields: ['pollContent', 'content'],
  optionalFields: ['hashtags'],
});
```

### 5. Add Creation Logic

```typescript
// Add to PostCreationService
static async createPoll(client: any, question: string, options: string[], user: any, profile: any) {
  // Implementation here
}
```

That's it! Your new post type is ready to use.

## Migration Guide

### From Legacy to New Architecture

1. **Component Updates**: Replace hardcoded factory with registry
```typescript
// Old
switch (post.type) {
  case 'simple': return <SimplePostCard {...props} />;
  // ...
}

// New  
return createPostComponent(post, props);
```

2. **Type Updates**: Use unified post types
```typescript
// Old
import type { FeedPost } from '@/types/social-feed';

// New
import type { Post } from '@/types/posts';
```

3. **Hook Updates**: Use unified creation hook
```typescript
// Old
import { usePostCreation } from '@/features/posts/hooks/usePostCreation';

// New
import { useUnifiedPostCreation } from '@/features/posts/hooks/useUnifiedPostCreation';
```

## Benefits

✅ **Extensible**: Add new post types easily  
✅ **Type Safe**: Full TypeScript support  
✅ **Modular**: Components are self-contained  
✅ **Consistent**: Unified API across all post types  
✅ **Maintainable**: Clear separation of concerns  
✅ **Testable**: Each component can be tested in isolation

## Registry API

### PostComponentRegistry

```typescript
// Register a new post component
PostComponentRegistry.register(type, {
  Component: YourComponent,
  displayName: 'Your Post Type',
  category: 'social',
  requiredFields: ['content'],
  optionalFields: ['media']
});

// Get a registered component
const component = PostComponentRegistry.get('yourType');

// Check if registered
const isRegistered = PostComponentRegistry.isRegistered('yourType');
```

### Configuration System

```typescript
// Get post type config
const config = getPostTypeConfig('simple');

// Get all configs
const allConfigs = getAllPostTypeConfigs();

// Get by category
const socialPosts = getPostTypesByCategory('social');
```

This architecture provides a solid foundation for the future growth of the Posts feature while maintaining backward compatibility with existing code.
