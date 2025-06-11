import { FC } from "react"
import { View, Image, ViewStyle, ImageStyle, TextStyle } from "react-native"
import { useWindowDimensions } from "react-native"

import { Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"

const logo = require("../../../../assets/images/logo.png")

export const SignUpHeader: FC = () => {
  const { themed, theme } = useAppTheme()
  const { height: screenHeight } = useWindowDimensions()

  const logoHeight = Math.min(screenHeight * 0.08, 60)
  const logoWidth = (logoHeight * 170) / 60

  return (
    <View style={themed($container)}>
      <Image
        source={logo}
        style={[
          themed($logo),
          {
            height: logoHeight,
            width: logoWidth,
            tintColor: theme.colors.palette.neutral900,
          },
        ]}
        resizeMode="contain"
      />
      <Text tx="auth:signUp.title" preset="subheading" style={themed($title)} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.md,
  minHeight: "10%",
})

const $logo: ImageStyle = {
  height: 60,
  width: 170,
}

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.xxs,
})
