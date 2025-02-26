import { FC, useEffect, useState } from "react"
import { View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Button, Screen, Text } from "@/components"
import { useAuth } from "@/services/auth/useAuth"
import { useAppTheme } from "@/utils/useAppTheme"
import { userService } from "@/services/user/userService"
import { UserProfile } from "@/screens/SignUp/types"
import { $styles, ThemedStyle } from "@/theme"

export const HomeScreen: FC = observer(function HomeScreen() {
  const { themed } = useAppTheme()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        setIsLoading(true)
        const { data } = await userService.getProfileById(user.id)
        setProfile(data)
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($contentContainer)}>
        {isLoading ? (
          <Text text="Loading..." />
        ) : (
          <>
            <Text text={`Provider: ${user?.app_metadata.provider}`} />
            <Text text={`Email: ${user?.email}`} />
            {profile && (
              <>
                <Text text={`First Name: ${profile.first_name}`} />
                <Text text={`Last Name: ${profile.last_name}`} />
              </>
            )}
          </>
        )}
        <Button tx="home:logout" onPress={signOut} preset="filled" />
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
