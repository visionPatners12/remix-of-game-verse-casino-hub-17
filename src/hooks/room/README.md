
# Room Management System

This directory contains hooks and utilities for managing game rooms in the application.

## Core Components

### `useRoomConnection.ts`
Manages the WebSocket connection to a room, including reconnection logic and presence tracking.

### `useWalletCheck.ts`
Provides wallet balance checking functionality without loading unnecessary transaction data.

### `useRoomWebSocketSlim.ts`
A streamlined version of the room WebSocket hook that separates concerns more cleanly.

### `useSimpleGameRoom.ts`
A higher-level hook that combines room connection, authentication, and game state management.

### `useRoomActionsSlim.ts`
Provides room actions (toggle ready, start game, forfeit) with cleaner separation of concerns.

## Usage Example

```typescript
// In a game room component
import { useSimpleGameRoom } from "@/hooks/room/useSimpleGameRoom";

const GameRoom = () => {
  const {
    loading,
    roomData,
    currentUserId,
    gameType,
    gameName,
    gameStatus,
    isReady,
    toggleReady,
    startGame,
    forfeitGame,
    players
  } = useSimpleGameRoom();

  // Use these values to render your UI
  return (
    // ...
  );
};
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each hook does one thing and does it well
2. **Reusability**: Components can be combined in different ways for different needs
3. **Performance**: Avoids unnecessary data loading (e.g., transactions)
4. **Maintainability**: Smaller, more focused files are easier to understand and update
5. **Testing**: Isolated functionality is easier to test
