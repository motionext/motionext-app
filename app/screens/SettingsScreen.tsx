import { FC, useState, useEffect } from "react"
import { View, ViewStyle, Alert, TextStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation, NavigationProp } from "@react-navigation/native"

import { Screen, ThemeToggle, Button, Header, Text } from "@/components"
import { Icon } from "@/components/Icon"
import { DataModal } from "@/components/DataModal"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useAppTheme } from "@/utils/useAppTheme"
import { languageEventEmitter } from "@/i18n/i18n"
import { useAuth } from "@/services/auth/useAuth"
import { $styles, ThemedStyle } from "@/theme"
import { AppStackParamList } from "@/navigators"
import { getAllStoredData, clearAllStoredData } from "@/utils/storageUtils"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { translate } from "@/i18n"

export const SettingsScreen: FC = observer(function SettingsScreen() {
  const { themed, theme } = useAppTheme()
  const { signOut } = useAuth()
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()
  const [, forceUpdate] = useState({})

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const [isModalVisible, setModalVisible] = useState(false)
  const [storedData, setStoredData] = useState("")

  // Listen for language change events
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({})
    }

    languageEventEmitter.on("languageChanged", handleLanguageChange)

    return () => {
      languageEventEmitter.off("languageChanged", handleLanguageChange)
    }
  }, [])

  const handleViewAllData = () => {
    const data = getAllStoredData()
    setStoredData(data)
    setModalVisible(true)
  }

  const handleClearAllData = () => {
    Alert.alert(
      translate("settings:clearAllData.title"),
      translate("settings:clearAllData.message"),
      [
        { text: translate("settings:clearAllData.cancelButton"), style: "cancel" },
        {
          text: translate("settings:clearAllData.deleteButton"),
          style: "destructive",
          onPress: () => {
            clearAllStoredData()
            Alert.alert(
              translate("settings:clearAllData.successTitle"),
              translate("settings:clearAllData.successMessage"),
            )
          },
        },
      ],
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={[themed($contentContainer), $bottomContainerInsets]}>
        <Header leftIcon="back" onLeftPress={() => navigation.goBack()} titleTx="settings:title" />

        <View style={themed($section)}>
          <Text
            tx="settings:themeSelector.title"
            preset="subheading"
            style={themed($sectionTitle)}
          />
          <ThemeToggle />
        </View>

        <View style={themed($section)}>
          <Text
            tx="settings:languageSelector.title"
            preset="subheading"
            style={themed($sectionTitle)}
          />
          <LanguageToggle />
        </View>

        <View style={themed($section)}>
          <Text tx="settings:data" preset="subheading" style={themed($sectionTitle)} />
          <View style={themed($buttonGroup)}>
            <Button
              tx="settings:viewAllData"
              onPress={handleViewAllData}
              preset="default"
              style={themed($dataButton)}
              LeftAccessory={() => (
                <Icon icon="view" size={20} color={theme.colors.palette.neutral800} />
              )}
            />
            <Button
              tx="settings:clearAllData.buttonText"
              onPress={handleClearAllData}
              preset="default"
              style={themed($clearButton)}
              LeftAccessory={() => (
                <Icon icon="trash" size={20} color={theme.colors.palette.angry500} />
              )}
            />
          </View>
        </View>

        <View style={themed($footer)}>
          <Button
            tx="home:logout"
            onPress={signOut}
            preset="reversed"
            style={themed($logoutButton)}
            LeftAccessory={() => (
              <Icon icon="logout" size={20} color={theme.colors.palette.neutral100} />
            )}
          />
        </View>
      </View>

      <DataModal
        visible={isModalVisible}
        data={storedData}
        onClose={() => setModalVisible(false)}
        title={translate("settings:dataModal.title")}
        emptyText={translate("settings:dataModal.emptyState")}
      />
    </Screen>
  )
})

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  paddingHorizontal: spacing.md,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $buttonGroup: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $dataButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: spacing.sm,
})

const $clearButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.palette.angry500,
  borderRadius: spacing.sm,
})

const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  alignItems: "center",
  marginTop: spacing.lg,
})

const $logoutButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minWidth: 200,
  backgroundColor: colors.palette.angry500,
  color: "#FFFFFF",
  borderRadius: spacing.sm,
  shadowColor: colors.palette.angry500,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
})
