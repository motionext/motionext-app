// External Libraries
import { useCallback, useEffect, useRef, useState } from "react"
import { BackHandler, Platform } from "react-native"
import {
  createNavigationContainerRef,
  NavigationProp,
  NavigationState,
  PartialState,
} from "@react-navigation/native"
import * as Linking from "expo-linking"

// Internal Imports
import Config from "../config"
import type { PersistNavigationConfig } from "../config/config.base"
import { useAuth } from "../services/auth/useAuth"
import { supabase } from "../services/auth/supabase"
import * as storage from "../utils/storage"
import { useIsMounted } from "../utils/useIsMounted"
import type { AppStackParamList, NavigationProps } from "./AppNavigator"
import { reportCrash } from "@/utils/crashReporting"

type Storage = typeof storage

/**
 * Reference to the root App Navigator.
 *
 * Use this to access the navigation object outside of a
 * `NavigationContainer` context if needed. However, use the `useNavigation` hook whenever possible.
 * @see [Navigating Without Navigation Prop]{@link https://reactnavigation.org/docs/navigating-without-navigation-prop/}
 *
 * The types on this reference only allow referencing top-level navigators. For nested navigators,
 * use the `useNavigation` with the stack navigator's ParamList type.
 */
export const navigationRef = createNavigationContainerRef<AppStackParamList>()

/**
 * Gets the current screen from any navigation state.
 * @param {NavigationState | PartialState<NavigationState>} state - The navigation state to traverse.
 * @returns {string} - The name of the current screen.
 */
export function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
  const route = state.routes[state.index ?? 0]

  // Found the active route -- return the name
  if (!route.state) return route.name as keyof AppStackParamList

  // Recursive call to deal with nested routers
  return getActiveRouteName(route.state as NavigationState<AppStackParamList>)
}

const iosExit = () => false

/**
 * Hook that handles Android back button presses and forwards those on to
 * the navigation or allows exiting the app.
 * @see [BackHandler]{@link https://reactnative.dev/docs/backhandler}
 * @param {(routeName: string) => boolean} canExit - Function that returns whether it's possible to exit the app.
 * @returns {void}
 */
export function useBackButtonHandler(canExit: (routeName: string) => boolean) {
  // Use a ref to update the canExit function without re-setting up all the listeners.
  const canExitRef = useRef(Platform.OS !== "android" ? iosExit : canExit)

  useEffect(() => {
    canExitRef.current = canExit
  }, [canExit])

  useEffect(() => {
    // Fire this when the back button is pressed on Android.
    const onBackPress = () => {
      if (!navigationRef.isReady()) {
        return false
      }

      // grab the current route
      const routeName = getActiveRouteName(navigationRef.getRootState())

      // are allowed to exit?
      if (canExitRef.current(routeName)) {
        // exit and let the system know the app handled the event
        BackHandler.exitApp()
        return true
      }

      // can't exit, so let's turn this into a back action
      if (navigationRef.canGoBack()) {
        navigationRef.goBack()
        return true
      }

      return false
    }

    // Subscribe when come to life
    BackHandler.addEventListener("hardwareBackPress", onBackPress)

    // Unsubscribe when done
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress)
  }, [])
}

/**
 * Determine whether to enable navigation persistence
 * based on a config setting and the __DEV__ environment (dev or prod).
 * @param {PersistNavigationConfig} persistNavigation - The config setting for navigation persistence.
 * @returns {boolean} - Whether to restore navigation state by default.
 */
function navigationRestoredDefaultState(persistNavigation: PersistNavigationConfig) {
  if (persistNavigation === "always") return false
  if (persistNavigation === "dev" && __DEV__) return false
  if (persistNavigation === "prod" && !__DEV__) return false

  // all other cases, disable restoration by returning true
  return true
}

/**
 * Custom hook for persisting navigation state.
 * @param {Storage} storage - The storage utility to use.
 * @param {string} persistenceKey - The key to use for storing the navigation state.
 * @returns {object} - The navigation state and persistence functions.
 */
export function useNavigationPersistence(storage: Storage, persistenceKey: string) {
  const [initialNavigationState, setInitialNavigationState] =
    useState<NavigationProps["initialState"]>()
  const isMounted = useIsMounted()

  const initNavState = navigationRestoredDefaultState(Config.persistNavigation)
  const [isRestored, setIsRestored] = useState(initNavState)

  const routeNameRef = useRef<keyof AppStackParamList | undefined>()

  const onNavigationStateChange = (state: NavigationState | undefined) => {
    const previousRouteName = routeNameRef.current
    if (state !== undefined) {
      const currentRouteName = getActiveRouteName(state)

      if (previousRouteName !== currentRouteName) {
        // track screens.
        if (__DEV__) {
          console.log("[NAVIGATOR] Track screen: ", currentRouteName)
        }
      }

      // Save the current route name for later comparison
      routeNameRef.current = currentRouteName as keyof AppStackParamList

      // Persist state to storage
      storage.save(persistenceKey, state)
    }
  }

  const restoreState = async () => {
    try {
      const initialUrl = await Linking.getInitialURL()

      // Only restore the state if app has not started from a deep link
      if (!initialUrl) {
        const state = (await storage.load(persistenceKey)) as NavigationProps["initialState"] | null
        if (state) setInitialNavigationState(state)
      }
    } finally {
      if (isMounted()) setIsRestored(true)
    }
  }

  useEffect(() => {
    if (!isRestored) restoreState()
    // runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { onNavigationStateChange, restoreState, isRestored, initialNavigationState }
}

/**
 * use this to navigate without the navigation
 * prop. If have access to the navigation prop, do not use this.
 * @see {@link https://reactnavigation.org/docs/navigating-without-navigation-prop/}
 * @param {unknown} name - The name of the route to navigate to.
 * @param {unknown} params - The params to pass to the route.
 */
export function navigate(name: unknown, params?: unknown) {
  if (navigationRef.isReady()) {
    // @ts-expect-error
    navigationRef.navigate(name as never, params as never)
  }
}

/**
 * This function is used to go back in a navigation stack, if it's possible to go back.
 * If the navigation stack can't go back, nothing happens.
 * The navigationRef variable is a React ref that references a navigation object.
 * The navigationRef variable is set in the App component.
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack()
  }
}

/**
 * resetRoot will reset the root navigation state to the given params.
 * @param {Parameters<typeof navigationRef.resetRoot>[0]} state - The state to reset the root to.
 * @returns {void}
 */
export function resetRoot(
  state: Parameters<typeof navigationRef.resetRoot>[0] = { index: 0, routes: [] },
) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot(state)
  }
}

/**
 * Custom hook to manage deep links
 */
export function useDeepLinks() {
  const { handleDeepLinkSignIn } = useAuth()

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (!url) return

      // Verify email after sign up
      if (url.includes("verify-email")) {
        const token = url.split("token=")[1]?.split("&")[0]
        if (token) {
          if (__DEV__) {
            console.log("[DEEP LINK] Token received:", token)
          }

          try {
            // Set session using the token
            const {
              data: { session },
              error,
            } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: token,
            })

            if (error) {
              return reportCrash(error)
            }

            if (session) {
              if (__DEV__) {
                console.log("[DEEP LINK] Session set, handling sign in")
              }
              handleDeepLinkSignIn(
                session,
                navigationRef as unknown as NavigationProp<AppStackParamList>,
              )
            }
          } catch (error) {
            return reportCrash(error as Error)
          }
        }
      }
    },
    [handleDeepLinkSignIn],
  )

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url && __DEV__) {
        console.log("[DEEP LINK] Initial URL:", url)
      }
      handleDeepLink(url)
    })

    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url && __DEV__) {
        console.log("[DEEP LINK] New URL:", url)
      }
      handleDeepLink(url)
    })

    return () => {
      subscription.remove()
    }
  }, [handleDeepLink])
}
