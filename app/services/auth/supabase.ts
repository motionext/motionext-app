import Config from "app/config"
import { createClient } from "@supabase/supabase-js"
import * as SessionStorage from "app/utils/storage/storage"
import { AppState } from "react-native"

export const supabase = createClient(Config.supabaseUrl, Config.supabaseAnonKey, {
  auth: {
    storage: {
      getItem: SessionStorage.loadString,
      setItem: SessionStorage.saveString,
      removeItem: SessionStorage.remove,
    },
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

export { type Session, type AuthError } from "@supabase/supabase-js"

/**
 * Tells Supabase to autorefresh the session while the application
 * is in the foreground. (Docs: https://supabase.com/docs/reference/javascript/auth-startautorefresh)
 */
AppState.addEventListener("change", (nextAppState) => {
  if (nextAppState === "active") {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
