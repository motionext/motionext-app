import { MMKV } from "react-native-mmkv"
import * as SecureStore from "expo-secure-store"
import * as Crypto from "expo-crypto"

import { reportCrash } from "../crashReporting"

import { saveSecureChunked, loadSecureChunked, removeSecureChunked } from "./chunkedStorage"

// Fetches or generates an encryption key for MMKV storage
const fetchOrGenerateEncryptionKey = (): string => {
  const encryptionKey = SecureStore.getItem("session-encryption-key")

  if (encryptionKey) {
    return encryptionKey
  } else {
    const uuid = Crypto.randomUUID()
    SecureStore.setItem("session-encryption-key", uuid)
    return uuid
  }
}

export const storage = new MMKV({
  id: "session",
  encryptionKey: fetchOrGenerateEncryptionKey(),
})

// List of keys that contain sensitive data and should be stored in SecureStore
const SECURE_KEYS = ["cachedAuth", "password", "credentials", "token", "api_key"]

// List of keys that should NOT be cleared during a general clear operation
const PROTECTED_KEYS = [
  "session-encryption-key", // Encryption key for MMKV
  "hasSeenOnboarding", // User onboarding state
  "themePreference", // User theme preference
  "languagePreference", // User language preference
  "biometricEnabled", // Biometric authentication setting
  "crashReportingConsent", // User consent for crash reporting
]

/**
 * Checks if a key should be stored in SecureStore
 */
const isSecureKey = (key: string): boolean => {
  return SECURE_KEYS.some((secureKey) => key.includes(secureKey))
}

/**
 * Checks if a key should be protected from general clear operations
 */
const isProtectedKey = (key: string): boolean => {
  return PROTECTED_KEYS.includes(key) || key.startsWith("secure_ref_")
}

/**
 * Saves sensitive data in SecureStore instead of MMKV
 */
const saveSecure = async (key: string, value: string): Promise<void> => {
  try {
    await saveSecureChunked(key, value)
  } catch (error) {
    reportCrash(error as Error)
  }
}

/**
 * Loads sensitive data from SecureStore
 */
const loadSecure = async (key: string): Promise<string | null> => {
  try {
    return await loadSecureChunked(key)
  } catch (error) {
    reportCrash(error as Error)
    return null
  }
}

/**
 * Removes sensitive data from SecureStore
 */
const removeSecure = async (key: string): Promise<void> => {
  try {
    await removeSecureChunked(key)
  } catch (error) {
    reportCrash(error as Error)
  }
}

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export function loadString(key: string): string | null {
  try {
    // For sensitive keys, use SecureStore instead of MMKV
    // SecureStore is asynchronous, but this is a synchronous function
    // Return the result of the last stored operation
    if (isSecureKey(key)) {
      const cachedValue = storage.getString(`secure_ref_${key}`)
      return cachedValue || null
    }

    const value = storage.getString(key)
    if (value === undefined) {
      return null // Explicitly return null if the value is undefined
    }
    return value
  } catch (error) {
    reportCrash(error as Error)
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key: string, value: string): Promise<void> {
  try {
    // For sensitive keys, use SecureStore instead of MMKV
    if (isSecureKey(key)) {
      await saveSecure(key, value)
      // Store a copy in MMKV for synchronous access
      storage.set(`secure_ref_${key}`, value)
      return
    }

    storage.set(key, value)
  } catch (error) {
    reportCrash(error as Error)
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export function load<T>(key: string): T | null {
  let almostThere: string | null = null
  try {
    // For sensitive keys, try to load from SecureStore asynchronously
    if (isSecureKey(key)) {
      // Try to load from the synchronous cache first
      almostThere = loadString(key)

      // Start an asynchronous update of the cache for future calls
      loadSecure(key)
        .then((secureValue) => {
          if (secureValue) {
            storage.set(`secure_ref_${key}`, secureValue)
          }
        })
        .catch(() => {})
    } else {
      almostThere = loadString(key)
    }

    return JSON.parse(almostThere ?? "") as T
  } catch {
    return (almostThere as T) ?? null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export function remove(key: string): void {
  try {
    // For sensitive keys, also remove from SecureStore
    if (isSecureKey(key)) {
      removeSecure(key).catch(() => {})
      storage.delete(`secure_ref_${key}`)
      return
    }

    storage.delete(key)
  } catch {}
}

/**
 * Clears all storage except protected keys.
 * Use clearAll() for complete cleanup including protected keys.
 */
export function clear(): void {
  try {
    if (__DEV__) {
      console.log("[STORAGE] Performing selective clear (protecting system keys)")
    }

    // Get all keys from MMKV
    const allKeys = storage.getAllKeys()

    // Clear only non-protected keys
    allKeys.forEach((key) => {
      if (!isProtectedKey(key)) {
        storage.delete(key)
      }
    })

    // Clear SecureStore for sensitive keys (except protected ones)
    SECURE_KEYS.forEach((key) => {
      if (!isProtectedKey(key)) {
        removeSecure(key).catch(() => {})
      }
    })

    if (__DEV__) {
      console.log(
        `[STORAGE] Cleared ${allKeys.length - PROTECTED_KEYS.length} keys, protected ${PROTECTED_KEYS.length} system keys`,
      )
    }
  } catch (error) {
    reportCrash(error as Error)
  }
}

/**
 * Clears ALL storage including protected keys.
 * Use this only for complete app reset or uninstall scenarios.
 * @param includeEncryptionKey - Whether to also clear the encryption key (will require app restart)
 */
export function clearAll(includeEncryptionKey: boolean = false): void {
  try {
    if (__DEV__) {
      console.warn("[STORAGE] Performing complete clear (including protected keys)")
    }

    // Clear MMKV completely
    storage.clearAll()

    // Clear all SecureStore items
    const allKeysToRemove = [...SECURE_KEYS, ...PROTECTED_KEYS]

    if (!includeEncryptionKey) {
      // Keep the encryption key to avoid requiring app restart
      const encryptionKeyIndex = allKeysToRemove.indexOf("session-encryption-key")
      if (encryptionKeyIndex > -1) {
        allKeysToRemove.splice(encryptionKeyIndex, 1)
      }
    }

    allKeysToRemove.forEach((key) => {
      removeSecure(key).catch(() => {})
    })

    if (__DEV__) {
      console.warn(
        `[STORAGE] Complete clear performed. Encryption key ${includeEncryptionKey ? "included" : "preserved"}`,
      )
    }
  } catch (error) {
    reportCrash(error as Error)
  }
}

/**
 * Securely wipes sensitive authentication data
 */
export function clearAuthData(): void {
  try {
    if (__DEV__) {
      console.log("[STORAGE] Clearing authentication data")
    }

    const authKeys = ["cachedAuth", "password", "credentials", "token", "api_key", "biometricToken"]

    authKeys.forEach((key) => {
      // Remove from MMKV
      storage.delete(key)
      storage.delete(`secure_ref_${key}`)

      // Remove from SecureStore
      removeSecure(key).catch(() => {})
    })

    if (__DEV__) {
      console.log("[STORAGE] Authentication data cleared")
    }
  } catch (error) {
    reportCrash(error as Error)
  }
}

/**
 * Get storage usage statistics (for debugging and monitoring)
 */
export function getStorageStats(): {
  mmkvKeys: number
  secureKeys: number
  protectedKeys: number
  totalSize: number
} {
  try {
    const allKeys = storage.getAllKeys()
    const secureKeyCount = allKeys.filter((key) => key.startsWith("secure_ref_")).length
    const protectedKeyCount = allKeys.filter((key) => isProtectedKey(key)).length

    // Calculate approximate size (MMKV doesn't provide exact size)
    let totalSize = 0
    allKeys.forEach((key) => {
      const value = storage.getString(key)
      if (value) {
        totalSize += value.length
      }
    })

    return {
      mmkvKeys: allKeys.length,
      secureKeys: secureKeyCount,
      protectedKeys: protectedKeyCount,
      totalSize,
    }
  } catch {
    return {
      mmkvKeys: 0,
      secureKeys: 0,
      protectedKeys: 0,
      totalSize: 0,
    }
  }
}
