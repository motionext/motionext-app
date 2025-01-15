const en = {
  common: {
    ok: "OK",
  },
  welcomeScreen: {
    postscript: "This is the welcome screen!",
    title: "This is Motionext!",
    slogan: "More healthy, more connected.",
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
}

export default en
export type Translations = typeof en
