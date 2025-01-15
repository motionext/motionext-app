import { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "@/navigators"
import { Screen, Text, Button } from "@/components"
import { $styles, type ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAuth } from "@/services/auth/useAuth"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  const { themed } = useAppTheme()
  const { user, signOut } = useAuth()

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($contentContainer)}>
        <Text text={`Provider: ${user?.app_metadata.provider}`} />
        <Text text={`Email: ${user?.email}`} />
        <Button tx="home:logout" onPress={signOut} preset="filled" />
      </View>
    </Screen>
  )
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})
