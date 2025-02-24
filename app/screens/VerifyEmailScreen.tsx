import { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackParamList, AppStackScreenProps } from "@/navigators"
import { Screen, Text, Button, Header } from "@/components"
import { EmailVerificationIcon } from "@/components/icons/EmailVerificationIcon"
import { useAppTheme } from "@/utils/useAppTheme"
import { $styles, type ThemedStyle } from "@/theme"
import { NavigationProp } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"
import { openEmailApp } from "@/utils/openEmailApp"

interface VerifyEmailScreenProps extends AppStackScreenProps<"VerifyEmail"> {}

export const VerifyEmailScreen: FC<VerifyEmailScreenProps> = observer(function VerifyEmailScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <Header leftIcon="back" onLeftPress={() => navigation.navigate("SignIn")} />

      <View style={themed($contentContainer)}>
        <EmailVerificationIcon width={200} height={200} color={theme.colors.tint} />

        <Text tx="verifyEmailScreen:title" preset="heading" style={themed($titleStyle)} />

        <Text
          tx="verifyEmailScreen:description"
          preset="default"
          style={themed($descriptionStyle)}
        />

        <View style={themed($buttonContainer)}>
          <Button
            onPress={openEmailApp}
            tx="verifyEmailScreen:openEmail"
            preset="reversed"
            style={themed($button)}
          />
        </View>
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

const $titleStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.sm,
  marginTop: spacing.xxl,
})

const $descriptionStyle: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  marginBottom: spacing.xl,
  color: colors.textDim,
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  gap: spacing.md,
})

const $button: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  color: colors.palette.neutral100,
})
