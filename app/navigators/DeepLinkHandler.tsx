import { useEffect } from "react"
import * as Linking from "expo-linking"
import { useAuth } from "@/services/auth/useAuth"
import { supabase } from "@/services/auth/supabase"
import { useNavigation } from "@react-navigation/native"
import { NavigationProp } from "@react-navigation/native"
import { AppStackParamList } from "@/navigators/AppNavigator"

export function DeepLinkHandler() {
  const { handleDeepLinkSignIn } = useAuth()
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()

  useEffect(() => {
    // Check for initial deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        // If it's a verification link
        if (url.includes("verify-email")) {
          const token = url.split("token=")[1]?.split("&")[0]
          if (token) {
            // Check session after email verification
            supabase.auth.getSession().then(({ data: { session }, error }) => {
              if (session && !error) {
                handleDeepLinkSignIn(session, navigation)
              }
            })
          }
        }
      }
    })

    // Listener for deep links when the app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("verify-email")) {
        const token = url.split("token=")[1]?.split("&")[0]
        if (token) {
          supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (session && !error) {
              handleDeepLinkSignIn(session, navigation)
            }
          })
        }
      }
    })

    return () => {
      subscription.remove()
    }
  }, [handleDeepLinkSignIn, navigation])

  return null
}
