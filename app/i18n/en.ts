const en = {
  common: {
    ok: "OK",
    google: "Google",
  },
  landingScreen: {
    continueWithMail: "Continue with email",
    or: "or continue with",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "An unexpected error occurred. Please try resetting the app or contact support if the issue persists.",
    reset: "RESET APP",
  },
  emptyStateComponent: {
    generic: {
      heading: "So empty... so sad",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },
  verifyEmailScreen: {
    title: "Verify your email",
    description:
      "We've sent a confirmation link to your email. Please check your inbox and click the link to confirm your account.",
    openEmail: "Open email",
  },
  errors: {
    title: "Error",
    emailAppNotFound: "Could not open email app. Please check if you have an email app configured.",
    emailAppError: "An error occurred while trying to open email",
  },
  home: {
    logout: "Logout",
  },
  auth: {
    resetPassword: "Forgot your password?",
    resetPasswordSuccessTitle: "Email sent successfully!",
    resetPasswordSuccessDescription: "Check your inbox.",
    errors: {
      cancelled: "Authentication cancelled",
      userBanned: "This account has been banned",
      invalidCredentials: "Invalid email or password",
      emailNotConfirmed: "Please confirm your email before logging in",
      unknown: "An unexpected error occurred",
      emailRequired: "Enter your email to reset your password",
    },
  },
}

export default en
export type Translations = typeof en
