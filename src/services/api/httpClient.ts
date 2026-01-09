import { logger } from '@/utils/logger';

// HTTP client for external API calls
export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      // Add query parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      logger.debug('Making GET request to:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        // Removed headers to avoid CORS preflight for simple GET requests
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('HTTP Client Error:', error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('HTTP Client Error:', error);
      throw error;
    }
  }
}

// Polymarket API client instance - now using our Edge Function proxy
export const polymarketApiClient = new HttpClient('https://fbahnhkfhwphgtoxlzcz.supabase.co/functions/v1/polymarket-proxy');