// Global polyfills for Node.js modules in browser
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer;
}

// Also make it available on window for legacy compatibility
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = globalThis;
}