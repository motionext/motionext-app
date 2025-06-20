/**
 * Define an API endpoint and methods to request
 * data and process it using this Api class.
 */
import { ApisauceInstance, create } from "apisauce"

import Config from "../../config"

import type { ApiConfig } from "./api.types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Simple rate limiter to prevent API abuse
 */
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(): boolean {
    const now = Date.now()
    // Remove requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs)

    if (this.requests.length >= this.maxRequests) {
      return false
    }

    this.requests.push(now)
    return true
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0
    return this.requests[0] + this.windowMs
  }
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
}

/**
 * Manage all requests to the API. Use this class to build out various requests
 * needed to call from the backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  private rateLimiter: RateLimiter
  private retryConfig: RetryConfig

  /**
   * Set up the API instance.
   * * Keep this lightweight!
   */
  constructor(
    config: ApiConfig = DEFAULT_API_CONFIG,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
  ) {
    this.config = config
    this.retryConfig = retryConfig
    this.rateLimiter = new RateLimiter()

    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })

    // Add request interceptor for rate limiting
    this.apisauce.addRequestTransform((request) => {
      if (!this.rateLimiter.isAllowed()) {
        throw new Error(
          `Rate limit exceeded. Try again after ${new Date(this.rateLimiter.getResetTime()).toISOString()}`,
        )
      }
    })

    // Add response interceptor for better error handling
    this.apisauce.addResponseTransform((response) => {
      // Log non-2xx responses in development
      if (__DEV__ && !response.ok) {
        console.warn(`[API] ${response.status} ${response.problem}:`, response.data)
      }
    })
  }

  /**
   * Generic method with retry logic
   */
  private async withRetry<T>(operation: () => Promise<T>, retryCount: number = 0): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retryCount >= this.retryConfig.maxRetries) {
        throw error
      }

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof Error && error.message.includes("CLIENT_ERROR")) {
        if (!error.message.includes("429")) {
          throw error
        }
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount),
        this.retryConfig.maxDelay,
      )

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000

      if (__DEV__) {
        console.log(
          `[API] Retrying request in ${jitteredDelay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`,
        )
      }

      await new Promise((resolve) => setTimeout(resolve, jitteredDelay))
      return this.withRetry(operation, retryCount + 1)
    }
  }

  /**
   * Enhanced GET request with retry
   */
  async get<T>(url: string, params?: any): Promise<T> {
    return this.withRetry(async () => {
      const response = await this.apisauce.get(url, params)
      if (!response.ok) {
        throw new Error(`${response.problem}: ${response.status}`)
      }
      return response.data as T
    })
  }

  /**
   * Enhanced POST request with retry
   */
  async post<T>(url: string, data?: any): Promise<T> {
    return this.withRetry(async () => {
      const response = await this.apisauce.post(url, data)
      if (!response.ok) {
        throw new Error(`${response.problem}: ${response.status}`)
      }
      return response.data as T
    })
  }

  /**
   * Enhanced PUT request with retry
   */
  async put<T>(url: string, data?: any): Promise<T> {
    return this.withRetry(async () => {
      const response = await this.apisauce.put(url, data)
      if (!response.ok) {
        throw new Error(`${response.problem}: ${response.status}`)
      }
      return response.data as T
    })
  }

  /**
   * Enhanced DELETE request with retry
   */
  async delete<T>(url: string): Promise<T> {
    return this.withRetry(async () => {
      const response = await this.apisauce.delete(url)
      if (!response.ok) {
        throw new Error(`${response.problem}: ${response.status}`)
      }
      return response.data as T
    })
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
