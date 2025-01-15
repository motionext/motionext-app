/**
 * Use the app navigator for the primary navigation flows of the app.
 * Generally, include an auth flow (registration, login, forgot password)
 * and a "main" flow to use once logged in.
 */
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import * as Screens from "@/screens"
import Config from "@/config"
import { navigationRef, useBackButtonHandler, useDeepLinks } from "@/navigators/navigationUtilities"
import { useAppTheme, useThemeProvider } from "@/utils/useAppTheme"
import { ComponentProps } from "react"
import { useAuth } from "@/services/auth/useAuth"

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
  VerifyEmail: undefined
  Home: undefined
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

  if (__DEV__) {
    console.log("[AUTH] Auth status:", authStatus)
  }

  if (!initialCheckDone) {
    return null
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={authStatus === "authenticated" ? "Home" : "Welcome"}
    >
      {/* Public routes */}
      <Stack.Screen name="Welcome" component={Screens.LandingScreen} />
      <Stack.Screen name="SignIn" component={Screens.SignInScreen} />
      <Stack.Screen name="VerifyEmail" component={Screens.VerifyEmailScreen} />
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}

      {authStatus === "authenticated" && (
        // Authenticated routes
        <>
          <Stack.Screen name="Home" component={Screens.HomeScreen} />
        </>
      )}
    </Stack.Navigator>
  )
})

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer>> {}

export function AppNavigator(props: NavigationProps) {
  const { themeScheme, navigationTheme, setThemeContextOverride, ThemeProvider } =
    useThemeProvider()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))
  useDeepLinks() // Watch for deep links appearing

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        <AppStack />
      </NavigationContainer>
    </ThemeProvider>
  )
}
