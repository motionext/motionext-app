const en = {
  common: {},
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
}

export default en
export type Translations = typeof en
