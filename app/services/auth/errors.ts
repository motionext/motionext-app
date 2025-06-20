import { translate } from "@/i18n"
import { reportCrash } from "@/utils/crashReporting"

/**
 * Authentication error codes from Supabase and custom errors
 */
export enum AuthErrorCode {
  // Supabase errors
  INVALID_CREDENTIALS = "invalid_grant",
  EMAIL_NOT_CONFIRMED = "email_not_confirmed",
  USER_BANNED = "user_banned",
  SIGNUP_DISABLED = "signup_disabled",
  INVALID_EMAIL = "invalid_email",
  PASSWORD_TOO_SHORT = "password_too_short",
  PASSWORD_TOO_WEAK = "password_too_weak",
  EMAIL_ALREADY_EXISTS = "email_address_already_exists",
  EMAIL_RATE_LIMIT = "email_rate_limit_exceeded",
  SMS_RATE_LIMIT = "sms_rate_limit_exceeded",
  CAPTCHA_FAILED = "captcha_failed",
  SAML_RELAY_STATE_NOT_FOUND = "saml_relay_state_not_found",
  SAML_RELAY_STATE_EXPIRED = "saml_relay_state_expired",
  SAML_IDP_NOT_FOUND = "saml_idp_not_found",
  MANUAL_LINKING_DISABLED = "manual_linking_disabled",
  SESSION_NOT_FOUND = "session_not_found",
  FLOW_STATE_NOT_FOUND = "flow_state_not_found",
  FLOW_STATE_EXPIRED = "flow_state_expired",
  SIGNUP_RATE_LIMIT = "signup_rate_limit_exceeded",

  // Custom errors
  NETWORK_ERROR = "network_error",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
  INVALID_TOKEN = "invalid_token",
  TOKEN_EXPIRED = "token_expired",
  BIOMETRIC_NOT_AVAILABLE = "biometric_not_available",
  BIOMETRIC_NOT_ENROLLED = "biometric_not_enrolled",
  BIOMETRIC_LOCKOUT = "biometric_lockout",
  DEVICE_NOT_SECURE = "device_not_secure",
}

/**
 * Error severity levels for logging and handling
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Enhanced error information
 */
export interface AuthErrorInfo {
  code: AuthErrorCode
  message: string
  severity: ErrorSeverity
  retryable: boolean
  userMessage: string
  technicalDetails?: string
}

/**
 * Map of error codes to error information
 */
const AUTH_ERROR_MAP: Record<string, AuthErrorInfo> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: {
    code: AuthErrorCode.INVALID_CREDENTIALS,
    message: "Invalid email or password",
    severity: ErrorSeverity.LOW,
    retryable: true,
    userMessage: translate("auth:errors.invalidCredentials"),
  },
  [AuthErrorCode.EMAIL_NOT_CONFIRMED]: {
    code: AuthErrorCode.EMAIL_NOT_CONFIRMED,
    message: "Email not confirmed",
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userMessage: translate("auth:errors.emailNotConfirmed"),
  },
  [AuthErrorCode.USER_BANNED]: {
    code: AuthErrorCode.USER_BANNED,
    message: "User account banned",
    severity: ErrorSeverity.HIGH,
    retryable: false,
    userMessage: translate("auth:errors.userBanned"),
  },
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]: {
    code: AuthErrorCode.EMAIL_ALREADY_EXISTS,
    message: "Email already registered",
    severity: ErrorSeverity.LOW,
    retryable: false,
    userMessage: "Este email já está registado",
  },
  [AuthErrorCode.EMAIL_RATE_LIMIT]: {
    code: AuthErrorCode.EMAIL_RATE_LIMIT,
    message: "Email rate limit exceeded",
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userMessage: "Muitos emails enviados. Tente novamente em alguns minutos.",
  },
  [AuthErrorCode.SIGNUP_RATE_LIMIT]: {
    code: AuthErrorCode.SIGNUP_RATE_LIMIT,
    message: "Signup rate limit exceeded",
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userMessage: "Muitas tentativas de registo. Tente novamente em alguns minutos.",
  },
  [AuthErrorCode.NETWORK_ERROR]: {
    code: AuthErrorCode.NETWORK_ERROR,
    message: "Network connection error",
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userMessage: "Erro de ligação. Verifique a sua internet.",
  },
  [AuthErrorCode.TIMEOUT]: {
    code: AuthErrorCode.TIMEOUT,
    message: "Request timeout",
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userMessage: "Pedido expirou. Tente novamente.",
  },
  [AuthErrorCode.INVALID_TOKEN]: {
    code: AuthErrorCode.INVALID_TOKEN,
    message: "Invalid authentication token",
    severity: ErrorSeverity.HIGH,
    retryable: false,
    userMessage: "Sessão inválida. Faça login novamente.",
  },
  [AuthErrorCode.TOKEN_EXPIRED]: {
    code: AuthErrorCode.TOKEN_EXPIRED,
    message: "Authentication token expired",
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userMessage: "Sessão expirada. Faça login novamente.",
  },
}

/**
 * Enhanced error message function with logging and context
 */
export function getAuthErrorMessage(
  errorCode?: string,
  originalError?: Error,
  context?: string,
): string {
  const errorInfo = getAuthErrorInfo(errorCode, originalError, context)
  return errorInfo.userMessage
}

/**
 * Get comprehensive error information
 */
export function getAuthErrorInfo(
  errorCode?: string,
  originalError?: Error,
  context?: string,
): AuthErrorInfo {
  const defaultError: AuthErrorInfo = {
    code: AuthErrorCode.UNKNOWN,
    message: "Unknown authentication error",
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userMessage: translate("auth:errors.unknown"),
    technicalDetails: originalError?.message,
  }

  if (!errorCode) {
    logAuthError(defaultError, originalError, context)
    return defaultError
  }

  const errorInfo = AUTH_ERROR_MAP[errorCode] || {
    ...defaultError,
    technicalDetails: `Unknown error code: ${errorCode}. ${originalError?.message || ""}`,
  }

  // Add technical details if available
  if (originalError) {
    errorInfo.technicalDetails = originalError.message
  }

  logAuthError(errorInfo, originalError, context)
  return errorInfo
}

/**
 * Log authentication errors with appropriate severity
 */
function logAuthError(errorInfo: AuthErrorInfo, originalError?: Error, context?: string): void {
  const logMessage = `[AUTH ERROR] ${errorInfo.code}: ${errorInfo.message}`
  const logContext = context ? ` (Context: ${context})` : ""
  const technicalDetails = errorInfo.technicalDetails ? ` - ${errorInfo.technicalDetails}` : ""

  const fullMessage = `${logMessage}${logContext}${technicalDetails}`

  // Log to console in development
  if (__DEV__) {
    switch (errorInfo.severity) {
      case ErrorSeverity.LOW:
        console.info(fullMessage)
        break
      case ErrorSeverity.MEDIUM:
        console.warn(fullMessage)
        break
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        console.error(fullMessage)
        break
    }
  }

  // Report to crash reporting service for medium+ severity errors
  if (errorInfo.severity !== ErrorSeverity.LOW && originalError) {
    const enhancedError = new Error(fullMessage)
    enhancedError.name = `AuthError_${errorInfo.code}`
    enhancedError.stack = originalError.stack

    reportCrash(enhancedError)
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableAuthError(errorCode?: string): boolean {
  if (!errorCode) return false
  const errorInfo = AUTH_ERROR_MAP[errorCode]
  return errorInfo?.retryable || false
}

/**
 * Get retry delay based on error type and attempt count
 */
export function getRetryDelay(errorCode?: string, attemptCount: number = 1): number {
  const baseDelay = 1000 // 1 second
  const maxDelay = 30000 // 30 seconds

  if (!errorCode || !isRetryableAuthError(errorCode)) {
    return 0 // Not retryable
  }

  const errorInfo = AUTH_ERROR_MAP[errorCode]

  // Rate limit errors should have longer delays
  if (errorCode.includes("rate_limit")) {
    return Math.min(maxDelay, baseDelay * Math.pow(2, attemptCount) * 5)
  }

  // Network errors can be retried more quickly
  if (errorCode === AuthErrorCode.NETWORK_ERROR || errorCode === AuthErrorCode.TIMEOUT) {
    return Math.min(maxDelay, baseDelay * Math.pow(1.5, attemptCount))
  }

  // Default exponential backoff
  return Math.min(maxDelay, baseDelay * Math.pow(2, attemptCount))
}
