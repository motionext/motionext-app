import { FC, useState } from "react"
import { View, TouchableOpacity, ViewStyle, TextStyle, Image, ImageStyle } from "react-native"
import { useTranslation } from "react-i18next"

import { Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { changeLanguage, supportedLanguages, TxKeyPath } from "@/i18n/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

interface LanguageToggleProps {
  style?: ViewStyle
}

// Define a type for the keys of flagImages
type SupportedLanguage = (typeof supportedLanguages)[number]

const flagImages: Record<SupportedLanguage, any> = {
  en: require("../../assets/flags/usa.png"),
  pt: require("../../assets/flags/pt.png"),
}

export const LanguageToggle: FC<LanguageToggleProps> = ({ style }) => {
  const { themed } = useAppTheme()
  const { i18n } = useTranslation()
  const [, forceUpdate] = useState({})

  const handleLanguageChange = async (language: string) => {
    await changeLanguage(language)
    // Forces a component update after language change
    forceUpdate({})
  }

  const currentLanguage = i18n.language.split("-")[0]

  return (
    <View style={style}>
      <View style={themed($optionsContainer)}>
        {supportedLanguages.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[themed($option), currentLanguage === lang && themed($selectedOption)]}
            onPress={() => handleLanguageChange(lang)}
          >
            <Image
              source={flagImages[lang as SupportedLanguage]}
              style={themed($flagIcon)}
              resizeMode="contain"
            />
            <Text
              tx={`settings:languageSelector.${lang}` as TxKeyPath}
              style={[themed($optionText), currentLanguage === lang && themed($selectedText)]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

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

const $flagIcon: ThemedStyle<ImageStyle> = () => ({
  width: 24,
  height: 24,
  borderRadius: 12,
})
