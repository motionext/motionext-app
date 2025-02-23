import { FC } from "react"
import { Image, ImageStyle, View, ViewStyle, TextStyle, StyleProp } from "react-native"
import { Text } from "@/components"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface HeaderLogoProps {
  style?: StyleProp<ImageStyle>
  tintColor?: "light" | "dark"
}

const logo = require("../../assets/images/logo.png")
const logoWhite = require("../../assets/images/logo-white.png")

export const HeaderLogo: FC<HeaderLogoProps> = ({ style, tintColor }) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($headerContainer)}>
      <View style={[themed($contentContainer), style]}>
        <Image
          style={themed($logo)}
          source={tintColor === "light" ? logo : logoWhite}
          resizeMode="contain"
        />
        <Text
          text="MOTIONEXT"
          preset="heading"
          // eslint-disable-next-line react-native/no-color-literals, react-native/no-inline-styles
          style={[themed($title), { color: tintColor === "light" ? "#000" : "#fff" }]}
        />
      </View>
    </View>
  )
}

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.lg,
})

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 5,
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  height: 80,
  width: 80,
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 36,
  fontWeight: "black",
  color: colors.palette.neutral900,
  fontFamily: typography.fonts.sourceSans.black,
})
