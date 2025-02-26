import { useEffect, useState } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { useFonts } from "expo-font"
import { KeyboardProvider } from "react-native-keyboard-controller"
import * as Linking from "expo-linking"
import * as SplashScreen from "expo-splash-screen"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import i18n from "i18next"

import { AppNavigator, useNavigationPersistence } from "@/navigators"
import { AuthProvider } from "@/services/auth/useAuth"
import Config from "@/config"
import { customFontsToLoad } from "@/theme"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { initCrashReporting } from "@/utils/crashReporting"
import { initI18n } from "@/i18n"
import { loadDateFnsLocale } from "@/utils/formatDate"
import { NotifierWrapper } from "react-native-notifier"
import { useInitialRootStore } from "@/models"
import * as storage from "@/utils/storage"

import "./utils/gestureHandler"
import "./utils/ignoreWarnings"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Web linking configuration (deep link)
const prefix = Linking.createURL("/")
const config = {
  screens: {
    VerifyEmail: "verify-email",
    welcome: "welcome",
  },
}

/**
 * This is the root component of the app.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
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

    // Add listener for language changes
    i18n.on("languageChanged", () => {
      loadDateFnsLocale()
    })

    return () => {
      i18n.off("languageChanged")
    }
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
     */
    setTimeout(SplashScreen.hideAsync, 500)
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
    <GestureHandlerRootView>
      <AuthProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ErrorBoundary catchErrors={Config.catchErrors}>
            <KeyboardProvider>
              <NotifierWrapper>
                <AppNavigator
                  linking={linking}
                  initialState={initialNavigationState}
                  onStateChange={onNavigationStateChange}
                />
              </NotifierWrapper>
            </KeyboardProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
