import { FC } from "react"
import { View, ViewStyle, TouchableOpacity, TextStyle } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { Text } from "@/components/Text"
import { Icon } from "@/components/Icon"
import { ThemedStyle } from "@/theme"

interface ThemeToggleProps {
  style?: ViewStyle
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ style }) => {
  const { themed, themePreference, setThemePreference, theme } = useAppTheme()

  const handleThemeChange = (theme: "light" | "dark" | undefined) => {
    setThemePreference(theme)
  }

  return (
    <View style={[themed($container), style]}>
      <Text tx="settings:themeSelector.title" style={themed($title)} />

      <View style={themed($optionsContainer)}>
        <TouchableOpacity
          style={[themed($option), themePreference === "light" && themed($selectedOption)]}
          onPress={() => handleThemeChange("light")}
        >
          <Icon
            icon="sun"
            size={24}
            color={
              themePreference === "light" ? theme.colors.tint : theme.colors.palette.neutral900
            }
          />
          <Text
            tx="settings:themeSelector.light"
            style={[themed($optionText), themePreference === "light" && themed($selectedText)]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[themed($option), themePreference === "dark" && themed($selectedOption)]}
          onPress={() => handleThemeChange("dark")}
        >
          <Icon
            icon="moon"
            size={24}
            color={themePreference === "dark" ? theme.colors.tint : theme.colors.palette.neutral900}
          />
          <Text
            tx="settings:themeSelector.dark"
            style={[themed($optionText), themePreference === "dark" && themed($selectedText)]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[themed($option), themePreference === undefined && themed($selectedOption)]}
          onPress={() => handleThemeChange(undefined)}
        >
          <Icon
            icon="settings"
            size={24}
            color={
              themePreference === undefined ? theme.colors.tint : theme.colors.palette.neutral900
            }
          />
          <Text
            tx="settings:themeSelector.auto"
            style={[themed($optionText), themePreference === undefined && themed($selectedText)]}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  marginVertical: spacing.sm,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: spacing.sm,
  color: colors.text,
})

const $optionsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.xs,
})

const $option: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.sm,
  marginHorizontal: spacing.xxs,
  borderRadius: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $selectedOption: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
  backgroundColor: colors.palette.primary100,
})

const $optionText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.xs,
  fontSize: 14,
  color: colors.text,
})

const $selectedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "bold",
})
