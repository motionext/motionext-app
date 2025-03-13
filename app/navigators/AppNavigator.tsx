/**
 * Use the app navigator for the primary navigation flows of the app.
 * Generally, include an auth flow (registration, login, forgot password)
 * and a "main" flow to use once logged in.
 */
import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"

import Config from "@/config"
import * as Screens from "@/screens"
import { navigationRef, useBackButtonHandler, useDeepLinks } from "@/navigators/navigationUtilities"

import { useAuth } from "@/services/auth/useAuth"
import { Onboarding } from "@/components/Onboarding"

import { storage } from "@/utils/storage"
import { useAppTheme, useThemeProvider } from "@/utils/useAppTheme"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, it's
 * recommend using the MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Welcome: undefined
  SignIn: undefined
  SignUp: undefined
  VerifyEmail: undefined
  Home: undefined
  Settings: undefined
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

/**
 * This is a list of all the route names that will exit the app if the back
 * button is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

export const AppStack = observer(function AppStack() {
  const {
    theme: { colors },
  } = useAppTheme()

  const { authStatus, initialCheckDone } = useAuth()

  if (__DEV__ && initialCheckDone) {
    console.log("[AUTH] Auth status:", authStatus)
  }

  if (!initialCheckDone) return null

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {authStatus === "authenticated" ? (
        // Authenticated stack
        <>
          <Stack.Screen name="Home" component={Screens.HomeScreen} />
          <Stack.Screen name="Settings" component={Screens.SettingsScreen} />
        </>
      ) : (
        // Auth stack
        <>
          <Stack.Screen name="Welcome" component={Screens.LandingScreen} />
          <Stack.Group>
            <Stack.Screen name="SignIn" component={Screens.SignInScreen} />
            <Stack.Screen name="SignUp" component={Screens.SignUpScreen} />
          </Stack.Group>
          <Stack.Screen name="VerifyEmail" component={Screens.VerifyEmailScreen} />
          {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}{" "}
        </>
      )}
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export function AppNavigator(props: NavigationProps) {
  const {
    themeScheme,
    navigationTheme,
    setThemeContextOverride,
    themePreference,
    setThemePreference,
    ThemeProvider,
  } = useThemeProvider()

  // Onboarding drawer bottom - is shown if the user has not seen it yet
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = storage.getString("hasSeenOnboarding")

    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))
  useDeepLinks() // Watch for deep links appearing

  return (
    <ThemeProvider
      value={{
        themeScheme,
        setThemeContextOverride,
        themePreference,
        setThemePreference,
      }}
    >
      <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        <>
          <AppStack />
          <Onboarding isVisible={showOnboarding} onDismiss={() => setShowOnboarding(false)} />
        </>
      </NavigationContainer>
    </ThemeProvider>
  )
}
