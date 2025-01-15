// External Libraries
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { NavigationProp } from "@react-navigation/native"
import { AuthError, AuthResponse, type User } from "@supabase/supabase-js"
import { GoogleSignin } from "@react-native-google-signin/google-signin"

// Internal Imports
import { AppStackParamList } from "@/navigators"
import { Session, supabase } from "@/services/auth/supabase"
import { reportCrash } from "@/utils/crashReporting"

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
    navigation?: NavigationProp<AppStackParamList>,
  ) => Promise<void>
  setUser: (user: User | null) => void
  authStatus: "signIn" | "authenticated"
  signInWithGoogle: () => Promise<boolean>
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
})

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    reportCrash(new Error("[AUTH] useAuth must be used within an AuthProvider"))
  }

  return value
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<AuthState["token"]>(undefined)
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const [authStatus, setAuthStatus] = useState<"signIn" | "authenticated">("signIn")

  const updateAuthState = useCallback(async (session: Session | null) => {
    try {
      if (!session?.access_token) {
        setToken(undefined)
        setUser(null)
        setAuthStatus("signIn")
        return
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(session.access_token)

      if (error || !user?.email_confirmed_at) {
        setToken(undefined)
        setUser(null)
        setAuthStatus("signIn")
        return
      }

      setToken(session.access_token)
      setUser(user)
      setAuthStatus("authenticated")
    } catch (error) {
      reportCrash(error as Error)
      setToken(undefined)
      setUser(null)
      setAuthStatus("signIn")
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (isMounted) {
          await updateAuthState(session)
          setInitialCheckDone(true)
        }
      } catch (error) {
        reportCrash(error as Error)
        if (isMounted) {
          setInitialCheckDone(true)
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
  }, [updateAuthState])

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
  }, [])

  const handleDeepLinkSignIn = useCallback(
    async (session: Session, navigation?: NavigationProp<AppStackParamList>) => {
      if (session?.access_token) {
        await updateAuthState(session)
        navigation?.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
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
          reportCrash(new Error("[GOOGLE AUTH] Error signing in with ID token"))
          return false
        }

        if (session) {
          const { session: authSession } = session
          await updateAuthState(authSession)
          setAuthStatus("authenticated")
          return true
        }
      } else {
        // User cancelled the sign in process. Ignore.
        return false
      }
    } catch (error) {
      reportCrash(error as Error)
      return false
    }
    return false
  }, [updateAuthState])

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
