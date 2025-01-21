import { translate } from "@/i18n"
import { AuthError } from "@supabase/supabase-js"

export const AuthErrorCode = {
  USER_BANNED: "user_banned",
  TIMEOUT: "request_timeout",
  INVALID_CREDENTIALS: "invalid_credentials",
  EMAIL_NOT_CONFIRMED: "email_not_confirmed",
  UNKNOWN: "UNKNOWN",
} as const

type AuthErrorCodeType = (typeof AuthErrorCode)[keyof typeof AuthErrorCode]

export function getAuthErrorMessage(code: AuthError["code"] | AuthErrorCodeType): string {
  switch (code) {
    case AuthErrorCode.USER_BANNED:
      return translate("auth:errors.userBanned")
    case AuthErrorCode.INVALID_CREDENTIALS:
      return translate("auth:errors.invalidCredentials")
    case AuthErrorCode.EMAIL_NOT_CONFIRMED:
      return translate("auth:errors.emailNotConfirmed")

    case AuthErrorCode.UNKNOWN:
      return translate("auth:errors.unknown")

    default:
      return translate("auth:errors.unknown")
  }
}
