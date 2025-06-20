/**
 * If using Sentry
 *   Expo https://docs.expo.dev/guides/using-sentry/
 */
import * as Sentry from "@sentry/react-native"

/**
 * If using Crashlytics: https://rnfirebase.io/crashlytics/usage
 */
// import crashlytics from "@react-native-firebase/crashlytics"

/**
 * If using Bugsnag:
 *   RN   https://docs.bugsnag.com/platforms/react-native/)
 *   Expo https://docs.bugsnag.com/platforms/react-native/expo/
 */
// import Bugsnag from "@bugsnag/react-native"
// import Bugsnag from "@bugsnag/expo"

// Place crash reporting service initialization code to call in `./app/app.tsx`
export const initCrashReporting = () => {
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN

  if (!sentryDsn && __DEV__) {
    console.warn("[CRASH REPORTING] Sentry DSN not configured")
    return
  }

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      debug: __DEV__, // Enable debug only in development
      environment: __DEV__ ? "development" : "production",
      beforeSend(event, hint) {
        // Filter out sensitive information
        if (event.exception) {
          const error = hint.originalException
          if (error instanceof Error && error.message.includes("password")) {
            return null // Don't send errors containing password info
          }
        }
        return event
      },
    })
  }
  // Bugsnag.start("API_KEY")
}

/**
 * Error classifications used to sort errors on error reporting services.
 */
export enum ErrorType {
  /**
   * An error that would normally cause a red screen in dev
   * and force the user to sign out and restart.
   */
  FATAL = "Fatal",
  /**
   * An error caught by try/catch.
   */
  HANDLED = "Handled",
}

/**
 * Manually report a handled error.
 */
export const reportCrash = (error: Error, type: ErrorType = ErrorType.FATAL) => {
  if (__DEV__) {
    // Log to console
    const message = error.message || "Unknown"
    console.error(error)
    console.log(message, type)
  } else {
    // In production, utilize crash reporting service of choice below:
    Sentry.captureException(error)
    // crashlytics().recordError(error)
    /// Bugsnag.notify(error)
  }
}
