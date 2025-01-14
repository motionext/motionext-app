import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { Session, supabase } from "./supabase"
import { AuthResponse, AuthTokenResponsePassword } from "@supabase/supabase-js"

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
  signIn: (props: { token: string }) => Promise<AuthTokenResponsePassword>
  signUp: (props: SignUpProps) => Promise<AuthResponse>
  signOut: () => void
} & AuthState

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  initialCheckDone: false,
  token: undefined,
  signIn: () => new Promise(() => ({})),
  signUp: () => new Promise(() => ({})),
  signOut: () => undefined,
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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("SUPABASE EVENT", event)
      switch (event) {
        case "SIGNED_OUT":
          setToken(undefined)
          break
        case "INITIAL_SESSION":
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          setToken(session?.access_token)
          break
        default:
        // no-op
      }
      setInitialCheckDone(true) // Flag as finished after the main event
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  const signIn = useCallback(
    async ({ email, password }: SignInProps) => {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (result.data?.session?.access_token) {
        setToken(result.data.session.access_token)
      }

      return result
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabase],
  )

  const signUp = useCallback(
    async ({ email, password }: SignUpProps) => {
      const result = await supabase.auth.signUp({
        email,
        password,
      })

      if (result.data?.session?.access_token) {
        setToken(result.data.session.access_token)
      }

      return result
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabase],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setToken(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && initialCheckDone,
        initialCheckDone,
        token,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
