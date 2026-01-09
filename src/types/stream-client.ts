/**
 * GetStream Client Types
 * Centralized type definitions for the GetStream client
 */
import type { StreamClient } from 'getstream';

/**
 * Typed GetStream client for the application
 * Using the base StreamClient type without custom generics to avoid compatibility issues
 */
export type AppStreamClient = StreamClient;

/**
 * Re-export StreamClient type for convenience
 */
export type { StreamClient };

