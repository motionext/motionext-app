const en = {
  common: {
    ok: "OK",
    google: "Google",
  },
  landingScreen: {
    continueWithMail: "Continue with Email",
    or: "or continue with",
  },
  errorScreen: {
    friendlySubtitle:
      "An unexpected error has occurred. Please try restarting the app or contact support if the problem persists.",
    reset: "RESET APP",
  },
  emptyStateComponent: {
    generic: {
      heading: "Nothing Here Yet",
      content: "No data available. Try refreshing or restarting the app.",
      button: "Try Again",
    },
  },
  verifyEmailScreen: {
    title: "Verify Your Email",
    description:
      "We've sent a confirmation link to your email address. Please check your inbox and click the link to verify your account.",
    openEmail: "Open Email",
  },
  errors: {
    title: "Something Went Wrong",
    emailAppNotFound:
      "No email app found. Please ensure you have an email app installed and configured.",
    emailAppError: "Failed to open email app",
    unknown: "An unexpected error has occurred",
  },
  home: {
    logout: "Sign Out",
  },
  auth: {
    resetPassword: "Forgot Password?",
    resetPasswordSuccessTitle: "Email Sent!",
    resetPasswordSuccessDescription: "Please check your inbox for instructions.",
    errors: {
      userBanned: "This account has been suspended",
      invalidCredentials: "Incorrect email or password",
      emailNotConfirmed: "Please verify your email address before signing in",
      unknown: "An unexpected error has occurred",
      emailRequired: "Please enter your email address",
      invalidEmail: "Please enter a valid email address",
      passwordRequired: "Please enter your password",
      googleSignInFailed: "Google sign-in failed",
      firstNameRequired: "First name required",
      lastNameRequired: "Last name required",
      firstNameTooLong: "Max 50 characters",
      lastNameTooLong: "Max 50 characters",
      invalidFirstName: "Invalid characters",
      invalidLastName: "Invalid characters",
      emailTooLong: "Max 100 characters for email",
      passwordTooShort: "Minimum 8 characters for password",
      passwordTooLong: "Max 100 characters for password",
    },
    signIn: {
      title: "Sign In",
      email: "Email",
      password: "Password",
      button: "Sign In",
      noAccount: "Don't have an account?",
      createAccount: "Create Account",
    },
    signUp: {
      title: "Create Account",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      password: "Password",
      button: "Create Account",
      haveAccount: "Already have an account?",
      signIn: "Sign In",
    },
    terms: {
      agreement: "By using Motionext, you agree to our ",
      termsOfService: "Terms of Service",
      and: " and ",
      privacyPolicy: "Privacy Policy",
    },
  },
  passwordStrength: {
    veryWeak: "Very weak",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    veryStrong: "Very strong",
    empty: "Your password is empty 👀",
    requirements: {
      minLength: "Minimum 8 characters",
      lowercase: "Include a lowercase letter",
      uppercase: "Include an uppercase letter",
      number: "Include a number",
      perfect: "Excellent password! 🔒",
    },
  },
}

export default en
export type Translations = typeof en
