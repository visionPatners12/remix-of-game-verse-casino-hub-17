// Simple utility types to replace 'any' in common patterns

// Stream types
export interface StreamUser {
  id: string;
  name: string;
}

export interface StreamClient {
  disconnectUser: () => Promise<void>;
}

export interface StreamCall {
  camera: {
    enable: () => Promise<void>;
    disable: () => Promise<void>;
  };
  microphone: {
    enable: () => Promise<void>;
    disable: () => Promise<void>;
  };
  leave: () => Promise<void>;
  join: (options: { create?: boolean; ring?: boolean }) => Promise<void>;
}

export interface ChatClient {
  id: string;
}

// Team types for components
export interface TeamInfo {
  name: string;
  slug: string;
  image?: string;
  image_path?: string;
}

// Generic SQL query result
export interface SqlRow {
  [key: string]: unknown;
}

// Error handling
export interface ErrorWithMessage {
  message: string;
}

// Post types
export interface SimplePost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

// Common object type for props
export interface CommonObject {
  [key: string]: unknown;
}