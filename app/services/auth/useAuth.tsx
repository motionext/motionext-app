import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { CommonActions, NavigationProp } from "@react-navigation/native"
import { AuthError, AuthResponse, type User } from "@supabase/supabase-js"
import { GoogleSignin } from "@react-native-google-signin/google-signin"

import { AppStackParamList } from "@/navigators"
import { Session, supabase } from "@/services/auth/supabase"
import { reportCrash } from "@/utils/crashReporting"
import { getAuthErrorMessage } from "@/services/auth/errors"
import { showMessage } from "@/utils/showMessage"
import { translate } from "@/i18n"
import { userService } from "@/services/user/userService"
import { load, remove, save } from "@/utils/storage"
import { PendingProfile } from "@/screens/SignUp/types"
import { useConnectivity } from "@/utils/connectivity"

type AuthState = {
  isAuthenticated: boolean
  initialCheckDone: boolean
  token?: Session["access_token"]
}

type SignInProps = {
  email: string
  password: string
}

type SignUpProps = {
  email: string
  password: string
}

type AuthContextType = {
  user: User | null
  signIn: (props: SignInProps) => Promise<AuthResponse>
  signUp: (props: SignUpProps) => Promise<AuthResponse>
  signOut: () => void
  handleDeepLinkSignIn: (
    session: Session,
    navigation: NavigationProp<AppStackParamList>,
  ) => Promise<void>
  setUser: (user: User | null) => void
  authStatus: "signIn" | "authenticated"
  signInWithGoogle: () => Promise<boolean>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
} & AuthState

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  initialCheckDone: false,
  token: undefined,
  signIn: () => new Promise(() => ({})),
  signUp: () => new Promise(() => ({})),
  signOut: () => undefined,
  handleDeepLinkSignIn: () => new Promise(() => ({})),
  setUser: () => undefined,
  authStatus: "signIn",
  signInWithGoogle: () => new Promise(() => ({})),
  resetPassword: () => new Promise(() => ({})),
})

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    reportCrash(new Error("[AUTH] useAuth must be used within an AuthProvider"))
  }

  return value
}

// Define an interface for the cached authentication object
interface CachedAuth {
  user: User
  token: string
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<AuthState["token"]>(undefined)
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const [authStatus, setAuthStatus] = useState<"signIn" | "authenticated">("signIn")
  const { isConnected } = useConnectivity()

  const updateAuthState = useCallback(
    async (session: Session | null) => {
      try {
        if (!session?.access_token) {
          // Check for cached credentials if disconnected
          if (!isConnected) {
            const cachedAuth = (await load("cachedAuth")) as CachedAuth | null
            if (cachedAuth?.user && cachedAuth?.token) {
              setToken(cachedAuth.token)
              setUser(cachedAuth.user)
              setAuthStatus("authenticated")
              return
            }
          }

          setToken(undefined)
          setUser(null)
          setAuthStatus("signIn")
          return
        }

        // If offline, do not attempt to validate the token - trust what we already have
        if (!isConnected) {
          const cachedAuth = (await load("cachedAuth")) as CachedAuth | null
          if (cachedAuth?.user && cachedAuth?.token) {
            // If we have cache, use it directly
            setToken(cachedAuth.token)
            setUser(cachedAuth.user)
            setAuthStatus("authenticated")
            return
          }

          // If we have a session token but are offline without cache, trust the token
          setToken(session.access_token)
          // Attempt to extract user information from the token if possible

          const payload = JSON.parse(atob(session.access_token.split(".")[1]))
          if (payload.sub) {
            const cachedUser = { id: payload.sub, email: payload.email }
            setUser(cachedUser as User)
            // Save in cache for future use
            await save("cachedAuth", {
              user: cachedUser,
              token: session.access_token,
            } as CachedAuth)
          }

          setAuthStatus("authenticated")
          return
        }

        // If online, proceed normally with token verification
        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser(session.access_token)

          if (error || !user?.email_confirmed_at) {
            // If offline, try to use cached credentials before logging out
            if (!isConnected) {
              const cachedAuth = (await load("cachedAuth")) as CachedAuth | null
              if (cachedAuth?.user && cachedAuth?.token) {
                setToken(cachedAuth.token)
                setUser(cachedAuth.user)
                setAuthStatus("authenticated")
                return
              }
            }

            setToken(undefined)
            setUser(null)
            setAuthStatus("signIn")
            return
          }

          // Save user and token to local storage for offline use
          await save("cachedAuth", { user, token: session.access_token } as CachedAuth)

          setToken(session.access_token)
          setUser(user)
          setAuthStatus("authenticated")
        } catch (error) {
          // If it's likely a network error and we're offline
          if (!isConnected) {
            const cachedAuth = (await load("cachedAuth")) as CachedAuth | null
            if (cachedAuth?.user && cachedAuth?.token) {
              setToken(cachedAuth.token)
              setUser(cachedAuth.user)
              setAuthStatus("authenticated")
              return
            }
          }

          reportCrash(error as Error)
          setToken(undefined)
          setUser(null)
          setAuthStatus("signIn")
        }
      } catch (error) {
        // If it's likely a network error and we're offline
        if (!isConnected) {
          const cachedAuth = (await load("cachedAuth")) as CachedAuth | null
          if (cachedAuth?.user && cachedAuth?.token) {
            setToken(cachedAuth.token)
            setUser(cachedAuth.user)
            setAuthStatus("authenticated")
            return
          }
        }

        reportCrash(error as Error)
        setToken(undefined)
        setUser(null)
        setAuthStatus("signIn")
      }
    },
    [isConnected],
  )

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        // First try to load from cache
        const cachedAuth = (await load("cachedAuth")) as CachedAuth | null

        // Try getting a fresh session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (isMounted) {
          if (session) {
            await updateAuthState(session)
          } else if (!isConnected && cachedAuth?.user && cachedAuth?.token) {
            // If offline and no session but we have cached auth, use it
            setToken(cachedAuth.token)
            setUser(cachedAuth.user)
            setAuthStatus("authenticated")
          } else {
            setAuthStatus("signIn")
          }
          setInitialCheckDone(true)
        }
      } catch (error) {
        // If error is likely due to being offline
        if (!isConnected) {
          const cachedAuth = (await load("cachedAuth")) as CachedAuth | null
          if (cachedAuth?.user && cachedAuth?.token && isMounted) {
            setToken(cachedAuth.token)
            setUser(cachedAuth.user)
            setAuthStatus("authenticated")
            setInitialCheckDone(true)
            return
          }
        }

        reportCrash(error as Error)
        if (isMounted) {
          setInitialCheckDone(true)
          setAuthStatus("signIn")
        }
      }
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (isMounted) {
        await updateAuthState(session)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [updateAuthState, isConnected])

  const signIn = async ({ email, password }: SignInProps) => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // The authentication state will be updated automatically by the onAuthStateChange
      return response
    } catch (error) {
      return {
        data: { user: null, session: null },
        error: error as AuthError,
      }
    }
  }

  const signUp = useCallback(async ({ email, password }: SignUpProps) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: "motionext://verify-email" },
    })
    return result
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    await remove("cachedAuth") // Clear cached auth on sign out
  }, [])

  const handleDeepLinkSignIn = useCallback(
    async (session: Session, navigation: NavigationProp<AppStackParamList>) => {
      if (session?.access_token) {
        await updateAuthState(session)

        // Check for a pending profile
        const pendingProfile = (await load("pendingProfile")) as PendingProfile | null
        if (pendingProfile) {
          try {
            await userService.createProfile({
              userId: pendingProfile.userId,
              firstName: pendingProfile.firstName,
              lastName: pendingProfile.lastName,
              email: pendingProfile.email,
              signupToken: pendingProfile.userId,
            })
          } catch (error) {
            reportCrash(error as Error)
          } finally {
            // Clear the temporary data
            await remove("pendingProfile")
          }
        }

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          }),
        )
      }
    },
    [updateAuthState],
  )

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      GoogleSignin.configure({
        scopes: ["profile", "email"],
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      })

      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()

      if (userInfo.data?.idToken) {
        const { data: session, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        })

        if (error) {
          showMessage({
            title: getAuthErrorMessage(error.code),
            type: "error",
          })
          return false
        }

        if (session) {
          const { session: authSession } = session
          await updateAuthState(authSession)

          // Create the user profile
          if (session.user) {
            await userService.createProfile({
              userId: session.user.id,
              firstName:
                userInfo.data.user.givenName || userInfo.data.user.name?.split(" ")[0] || "",
              lastName:
                userInfo.data.user.familyName ||
                userInfo.data.user.name?.split(" ").slice(1).join(" ") ||
                "",
              email: session.user.email || "",
              signupToken: session.user.id,
            })
          }

          setAuthStatus("authenticated")
          return true
        }
      }

      return false
    } catch (error) {
      reportCrash(error as Error)
      showMessage({
        title: translate("auth:errors.unknown"),
        type: "error",
      })
      return false
    }
  }, [updateAuthState])

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://www.motionext.app/reset-password/",
      })

      return { error: error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && initialCheckDone,
        initialCheckDone,
        token,
        user,
        signIn,
        signUp,
        signOut,
        handleDeepLinkSignIn,
        setUser,
        authStatus,
        signInWithGoogle,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  const { user } = useAuth()
  return user
}
