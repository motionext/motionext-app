import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { Session, supabase } from "@/services/auth/supabase"
import { AuthResponse, AuthTokenResponsePassword } from "@supabase/supabase-js"
import { NavigationProp } from "@react-navigation/native"
import { AppStackParamList } from "@/navigators"

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
  signIn: (props: SignInProps) => Promise<AuthTokenResponsePassword>
  signUp: (props: SignUpProps) => Promise<AuthResponse>
  signOut: () => void
  handleDeepLinkSignIn: (
    session: Session,
    navigation?: NavigationProp<AppStackParamList>,
  ) => Promise<void>
  setUser: (user: any) => void
  authStatus: "signIn" | "authenticated"
} & AuthState

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  initialCheckDone: false,
  token: undefined,
  signIn: () => new Promise(() => ({})),
  signUp: () => new Promise(() => ({})),
  signOut: () => undefined,
  handleDeepLinkSignIn: () => new Promise(() => ({})),
  setUser: () => undefined,
  authStatus: "signIn",
})

export function useAuth() {
  const value = useContext(AuthContext)

  if (__DEV__) {
    if (!value) {
      throw new Error("useAuth must be used within an AuthProvider")
    }
  }

  return value
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<AuthState["token"]>(undefined)
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const [authStatus, setAuthStatus] = useState<"signIn" | "authenticated">("signIn")

  const updateAuthState = useCallback(async (session: Session | null) => {
    try {
      if (!session?.access_token) {
        setToken(undefined)
        setAuthStatus("signIn")
        return
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(session.access_token)

      if (error || !user?.email_confirmed_at) {
        setToken(undefined)
        setAuthStatus("signIn")
        return
      }

      setToken(session.access_token)
      setAuthStatus("authenticated")
    } catch (error) {
      if (__DEV__) {
        console.log("[AUTH] Error in updateAuthState:", error)
      }
      setToken(undefined)
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
        if (__DEV__) {
          console.log("[AUTH] Initial check error:", error)
        }
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

  const signIn = useCallback(async ({ email, password }: SignInProps) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    return result
  }, [])

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
        navigation?.navigate("Welcome")
      }
    },
    [updateAuthState],
  )

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && initialCheckDone,
        initialCheckDone,
        token,
        signIn,
        signUp,
        signOut,
        handleDeepLinkSignIn,
        setUser: updateAuthState,
        authStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
