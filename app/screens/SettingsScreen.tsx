import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Screen, ThemeToggle, Button, Header } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAuth } from "@/services/auth/useAuth"
import { $styles, ThemedStyle } from "@/theme"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { NavigationProp } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"
import { AppStackParamList } from "@/navigators"

export const SettingsScreen: FC = observer(function SettingsScreen() {
  const { themed } = useAppTheme()
  const { signOut } = useAuth()
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={[themed($contentContainer), $bottomContainerInsets]}>
        <Header leftIcon="back" onLeftPress={() => navigation.goBack()} title="Configurações" />

        <ThemeToggle />

        <View style={themed($footer)}>
          <Button
            tx="home:logout"
            onPress={signOut}
            preset="reversed"
            style={themed($logoutButton)}
          />
        </View>
      </View>
    </Screen>
  )
})

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  alignItems: "center",
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minWidth: 200,
  backgroundColor: colors.palette.angry500,
})
