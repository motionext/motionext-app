import { FC } from "react"
import { Platform, TextStyle, View, ViewStyle } from "react-native"
import { Text } from "@/components"
import { StackActions, useNavigation } from "@react-navigation/native"
import { useAppTheme } from "@/utils/useAppTheme"
import { type ThemedStyle } from "@/theme"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"

interface SignInFooterProps {
  isKeyboardVisible: boolean
}

export const SignInFooter: FC<SignInFooterProps> = ({ isKeyboardVisible }) => {
  const navigation = useNavigation()
  const { themed } = useAppTheme()

  if (isKeyboardVisible) return null

  return (
    <View style={themed($container)}>
      <View style={themed($createAccountContainer)}>
        <Text tx="auth:signIn.noAccount" />
        <Text
          tx="auth:signIn.createAccount"
          style={themed($createAccountText)}
          onPress={() => navigation.dispatch(StackActions.replace("SignUp"))}
        />
      </View>

      <View style={themed($termsContainer)}>
        <Text tx="auth:terms.agreement" size="xs" style={themed($terms)} />
        <Text
          tx="auth:terms.termsOfService"
          size="xs"
          style={[themed($terms), themed($link)]}
          onPress={() => openLinkInBrowser("https://www.motionext.app/legal/tos")}
        />
        <Text tx="auth:terms.and" size="xs" style={themed($terms)} />
        <Text
          tx="auth:terms.privacyPolicy"
          size="xs"
          style={[themed($terms), themed($link)]}
          onPress={() => openLinkInBrowser("https://www.motionext.app/legal/privacy")}
        />
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: Platform.OS === "ios" ? 34 : 16,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  backgroundColor: colors.background,
})

const $createAccountContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.sm,
  gap: spacing.xxs,
})

const $createAccountText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})

const $termsContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
}

const $terms: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginHorizontal: 2,
})

const $link: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})
