import { FC } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { Text } from "./Text"

interface DividerProps {
  text?: string
  textType?: "light" | "dark" | "neutral"
}

export const Divider: FC<DividerProps> = ({ text, textType = "neutral" }) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($container)}>
      <View style={themed($line)} />
      {text && <Text text={text} style={themed($text(textType))} />}
      <View style={themed($line)} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $line: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.border,
})

const $text =
  (textType: "light" | "dark" | "neutral"): ThemedStyle<TextStyle> =>
  ({ colors }) => ({
    color: textType === "light" ? "#FFFFFF" : textType === "dark" ? "#000000" : colors.text,
  })
