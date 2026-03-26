/**
 * Resilient API Client with Retry Logic & Error Handling
 */

import { API_BASE_URL, API_CONFIG } from './apiConfig';

export interface ApiError extends Error {
  status?: number;
  retryable: boolean;
}

export class APIClientError extends Error implements ApiError {
  constructor(
    message: string,
    public status?: number,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

/**
 * Exponential backoff delay calculator
 */
function getRetryDelay(attempt: number, baseDelay: number, multiplier: number): number {
  return baseDelay * Math.pow(multiplier, attempt) + Math.random() * 100; // add jitter
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(status: number | undefined): boolean {
  if (!status) return true; // Network errors are retryable
  // 408: Request Timeout, 429: Too Many Requests, 5xx: Server errors
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}

/**
 * Generic fetch wrapper with retry, timeout, and error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < API_CONFIG.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new APIClientError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          isRetryableError(response.status),
        );

        if (!error.retryable || attempt === API_CONFIG.retries - 1) {
          throw error;
        }
        lastError = error;
      } else {
        const data = await response.json();
        return data as T;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (attempt === API_CONFIG.retries - 1) {
        throw new APIClientError(
          `Failed after ${API_CONFIG.retries} attempts: ${error.message}`,
          undefined,
          false,
        );
      }

      lastError = error;

      if (attempt < API_CONFIG.retries - 1) {
        const delay = getRetryDelay(attempt, API_CONFIG.retryDelay, API_CONFIG.retryBackoffMultiplier);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new APIClientError('Unknown error', undefined, false);
}
