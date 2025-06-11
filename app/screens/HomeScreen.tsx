import { FC, useEffect, useState, useCallback } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { NavigationProp, useNavigation } from "@react-navigation/native"

import { $styles, ThemedStyle } from "@/theme"
import { AppStackParamList } from "@/navigators"
import { Button, Screen, Text } from "@/components"
import { useAuth } from "@/services/auth/useAuth"
import { userService } from "@/services/user/userService"
import { useConnectivity } from "@/utils/connectivity"
import { useAppTheme } from "@/utils/useAppTheme"
import { UserProfile } from "@/screens/SignUp/types"

export const HomeScreen: FC = observer(function HomeScreen() {
  const { themed } = useAppTheme()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isConnected } = useConnectivity()
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()

  const loadProfile = useCallback(async () => {
    if (user?.id) {
      setIsLoading(true)
      try {
        const { data } = await userService.getProfileById(user.id)
        if (data) {
          setProfile(data)
        }
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadProfile()
  }, [user, isConnected, loadProfile])

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($contentContainer)}>
        {isLoading ? (
          <Text text="Loading..." />
        ) : (
          <>
            <Text text={`Provider: ${user?.app_metadata?.provider || "-"}`} />
            <Text text={`Email: ${user?.email || "-"}`} />
            {profile ? (
              <>
                <Text text={`First Name: ${profile.first_name}`} />
                <Text text={`Last Name: ${profile.last_name}`} />
              </>
            ) : (
              <Text text="Profile not available" style={themed($errorText)} />
            )}
          </>
        )}
        <View style={themed($buttonContainer)}>
          <Button
            tx="home:settings"
            onPress={() => navigation.navigate("Settings")}
            preset="filled"
          />
        </View>
      </View>
    </Screen>
  )
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.md,
  justifyContent: "center",
  alignItems: "center",
  gap: spacing.md,
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  gap: spacing.md,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})
