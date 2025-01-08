/* eslint-disable import/first */
import "./utils/gestureHandler"
import { initI18n } from "./i18n"
import "./utils/ignoreWarnings"
import { useFonts } from "expo-font"
import { useEffect, useState } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import { useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import Config from "./config"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { loadDateFnsLocale } from "./utils/formatDate"
import { initCrashReporting } from "./utils/crashReporting"
import { AuthProvider } from "./services/auth/useAuth"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Web linking configuration (deep link)
const prefix = Linking.createURL("/")
const config = {
  screens: {},
}

interface AppProps {
  hideSplashScreen: () => Promise<void>
}

/**
 * This is the root component of the app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
function App(props: AppProps) {
  const { hideSplashScreen } = props
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  // Initialize the Sentry crash reporting system to monitor and log application errors
  initCrashReporting()

  const { rehydrated } = useInitialRootStore(() => {
    // This runs after the root store has been initialized and rehydrated.

    /**
     * If the initialization scripts run very fast, it's good to show the
     * splash screen for just a bit longer to prevent flicker.
     * Slightly delaying splash screen hiding for better UX; can be customized
     * or removed as needed.
     * Note: (vanilla Android) The splash-screen will not appear if launch app
     *    via the terminal or Android Studio. Kill the app and launch it
     *    normally by tapping on the launcher icon. https://stackoverflow.com/a/69831106
     * Note: (vanilla iOS) Might notice the splash-screen logo change size.
     *    This happens in debug/development mode. Try building the app for release.
     */
    setTimeout(hideSplashScreen, 500)
  })

  /**
   * Before show the app, it's imperative to wait for the state to be ready.
   * In the meantime, don't render anything. This will be the background
   * color set in native by rootView's background color.
   * In iOS: application:didFinishLaunchingWithOptions
   * In Android: https://stackoverflow.com/a/45838109/204044
   */

  if (
    !rehydrated ||
    !isNavigationStateRestored ||
    !isI18nInitialized ||
    (!areFontsLoaded && !fontLoadError)
  ) {
    return null
  }

  const linking = {
    prefixes: [prefix],
    config,
  }

  // otherwise, it's ok to render the app
  return (
    <AuthProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <KeyboardProvider>
            <AppNavigator
              linking={linking}
              initialState={initialNavigationState}
              onStateChange={onNavigationStateChange}
            />
          </KeyboardProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </AuthProvider>
  )
}

export default App
