import { Linking, Alert } from "react-native"

import { translate } from "@/i18n"

import { reportCrash } from "./crashReporting"

export async function openEmailApp() {
  try {
    const canOpen = await Linking.canOpenURL("mailto:")

    if (!canOpen) {
      Alert.alert(translate("errors:title"), translate("errors:emailAppNotFound"), [
        { text: translate("common:ok") },
      ])
      return
    }

    // Linking.openURL() may throw an error if there are problems opening the app
    // For example: email app was uninstalled between checking and opening
    await Linking.openURL("mailto:")
  } catch (error) {
    reportCrash(error as Error)
    Alert.alert(translate("errors:title"), translate("errors:emailAppError"), [
      { text: translate("common:ok") },
    ])
  }
}
