import { EventEmitter } from "events"

import * as Localization from "expo-localization"
import { I18nManager } from "react-native"
import { initReactI18next } from "react-i18next"
import i18n from "i18next"
import "intl-pluralrules"

import { storage } from "@/utils/storage"

import en, { Translations } from "./en"
import pt from "./pt"

// Creating an event emitter to notify language changes
export const languageEventEmitter = new EventEmitter()

const fallbackLocale = "en-US"

const systemLocales = Localization.getLocales()

const resources = { en, pt }
export const supportedLanguages = Object.keys(resources)

// Checks to see if the device locale matches any of the supported locales
// Device locale may be more specific and still match (e.g., en-US matches en)
const systemTagMatchesSupportedTags = (deviceTag: string) => {
  const primaryTag = deviceTag.split("-")[0]
  return supportedLanguages.includes(primaryTag)
}

const pickSupportedLocale: () => Localization.Locale | undefined = () => {
  return systemLocales.find((locale) => systemTagMatchesSupportedTags(locale.languageTag))
}

const locale = pickSupportedLocale()

export let isRTL = false

// Need to set RTL ASAP to ensure the app is rendered correctly. Waiting for i18n to init is too late.
if (locale?.languageTag && locale?.textDirection === "rtl") {
  I18nManager.allowRTL(true)
  isRTL = true
} else {
  I18nManager.allowRTL(false)
}

export const changeLanguage = async (language: string) => {
  await i18n.changeLanguage(language)
  storage.set("userLanguage", language)
  // Emitting language change event
  languageEventEmitter.emit("languageChanged", language)
  return i18n
}

export const initI18n = async () => {
  i18n.use(initReactI18next)

  // Checking if there is a saved language in the user's preferences
  const savedLanguage = storage.getString("userLanguage")

  await i18n.init({
    resources,
    lng: savedLanguage || locale?.languageTag || fallbackLocale,
    fallbackLng: fallbackLocale,
    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

/**
 * Builds up valid keypaths for translations.
 */

export type TxKeyPath = RecursiveKeyOf<Translations>

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, true>
}[keyof TObj & (string | number)]

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, false>
}[keyof TObj & (string | number)]

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean,
> = TValue extends any[]
  ? Text
  : TValue extends object
    ? IsFirstLevel extends true
      ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
      : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
    : Text
