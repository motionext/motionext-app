import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { StyleProp, useColorScheme } from "react-native"
import { DarkTheme, DefaultTheme, useTheme as useNavTheme } from "@react-navigation/native"
import * as SystemUI from "expo-system-ui"

import {
  type Theme,
  type ThemeContexts,
  type ThemedStyle,
  type ThemedStyleArray,
  lightTheme,
  darkTheme,
} from "@/theme"
import { storage } from "@/utils/storage"

import { reportCrash } from "./crashReporting"

type ThemeContextType = {
  themeScheme: ThemeContexts
  setThemeContextOverride: (newTheme: ThemeContexts) => void
  themePreference: ThemeContexts
  setThemePreference: (preference: ThemeContexts) => void
}

// create a React context and provider for the current theme
export const ThemeContext = createContext<ThemeContextType>({
  themeScheme: undefined,
  setThemeContextOverride: (_newTheme: ThemeContexts) => {
    reportCrash(
      new Error("Tried to call setThemeContextOverride before the ThemeProvider was initialized"),
    )
  },
  themePreference: undefined,
  setThemePreference: (_preference: ThemeContexts) => {
    reportCrash(
      new Error("Tried to call setThemePreference before the ThemeProvider was initialized"),
    )
  },
})

const themeContextToTheme = (themeContext: ThemeContexts): Theme =>
  themeContext === "dark" ? darkTheme : lightTheme

const setImperativeTheming = (theme: Theme) => {
  SystemUI.setBackgroundColorAsync(theme.colors.background)
}

export const useThemeProvider = (initialTheme: ThemeContexts = undefined) => {
  const colorScheme = useColorScheme()
  const [overrideTheme, setTheme] = useState<ThemeContexts>(initialTheme)
  const [themePreference, setThemePreferenceState] = useState<ThemeContexts>(undefined)

  useEffect(() => {
    const loadThemePreference = async () => {
      const savedPreference = storage.getString("themePreference") as ThemeContexts | undefined
      if (savedPreference) {
        setThemePreferenceState(savedPreference)
        if (savedPreference !== undefined) {
          setTheme(savedPreference)
        }
      }
    }

    loadThemePreference()
  }, [])

  const setThemeContextOverride = useCallback((newTheme: ThemeContexts) => {
    setTheme(newTheme)
  }, [])

  const setThemePreference = useCallback((preference: ThemeContexts) => {
    setThemePreferenceState(preference)

    if (preference) {
      storage.set("themePreference", preference)
    } else {
      storage.delete("themePreference")
    }

    if (preference !== undefined) {
      setTheme(preference)
    } else {
      setTheme(undefined)
    }
  }, [])

  const themeScheme = overrideTheme || colorScheme || "light"
  const navigationTheme = themeScheme === "dark" ? DarkTheme : DefaultTheme

  useEffect(() => {
    setImperativeTheming(themeContextToTheme(themeScheme))
  }, [themeScheme])

  return {
    themeScheme,
    navigationTheme,
    setThemeContextOverride,
    themePreference,
    setThemePreference,
    ThemeProvider: ThemeContext.Provider,
  }
}

interface UseAppThemeValue {
  // The theme object from react-navigation
  navTheme: typeof DefaultTheme
  // A function to set the theme context override (for switching modes)
  setThemeContextOverride: (newTheme: ThemeContexts) => void
  // The current theme object
  theme: Theme
  // The current theme context "light" | "dark"
  themeContext: ThemeContexts
  // The current theme preference "light" | "dark" | undefined (auto)
  themePreference: ThemeContexts
  // A function to set the theme preference
  setThemePreference: (preference: ThemeContexts) => void
  // A function to apply the theme to a style object.
  themed: <T>(styleOrStyleFn: ThemedStyle<T> | StyleProp<T> | ThemedStyleArray<T>) => T
}

/**
 * Custom hook that provides the app theme and utility functions for theming.
 *
 * @returns {UseAppThemeReturn} An object containing various theming values and utilities.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export const useAppTheme = (): UseAppThemeValue => {
  const navTheme = useNavTheme()
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  const {
    themeScheme: overrideTheme,
    setThemeContextOverride,
    themePreference,
    setThemePreference,
  } = context

  const themeContext: ThemeContexts = useMemo(
    () => overrideTheme || (navTheme.dark ? "dark" : "light"),
    [overrideTheme, navTheme],
  )

  const themeVariant: Theme = useMemo(() => themeContextToTheme(themeContext), [themeContext])

  const themed = useCallback(
    <T>(styleOrStyleFn: ThemedStyle<T> | StyleProp<T> | ThemedStyleArray<T>) => {
      const flatStyles = [styleOrStyleFn].flat(3)
      const stylesArray = flatStyles.map((f) => {
        if (typeof f === "function") {
          return (f as ThemedStyle<T>)(themeVariant)
        } else {
          return f
        }
      })

      // Flatten the array of styles into a single object
      return Object.assign({}, ...stylesArray) as T
    },
    [themeVariant],
  )

  return {
    navTheme,
    setThemeContextOverride,
    theme: themeVariant,
    themeContext,
    themed,
    themePreference,
    setThemePreference,
  }
}
