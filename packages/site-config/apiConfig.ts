/**
 * Centralized API Configuration
 * Supports environment-based configuration for development, staging, and production
 *
 * NEXT_PUBLIC_API_URL — override the API origin (e.g. when running the Express
 * backend locally alongside Next.js).  Defaults to '' (same origin), which
 * means all /api/* calls are handled by the Next.js API routes.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  retryBackoffMultiplier: 2, // exponential backoff
} as const;

export const ENDPOINTS = {
  health: '/',
  karma: '/api/karma',
  bhakti: '/api/bhakti',
  jnana: '/api/jnana',
  dhyana: '/api/dhyana',
  vasana: '/api/vasana',
  dharma: '/api/dharma',
} as const;

/**
 * Validates API endpoint is reachable
 */
export async function validateApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.health}`, {
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });
    return response.ok;
  } catch {
    return false;
  }
}
