import * as SecureStore from "expo-secure-store"

import { reportCrash } from "../crashReporting"

const CHUNK_SIZE = 1800 // Leaving some buffer below 2048 bytes for metadata
const CHUNK_PREFIX = "_chunk_"

/**
 * Splits a string into chunks of maximum size
 */
function splitIntoChunks(str: string): string[] {
  const chunks: string[] = []
  for (let i = 0; i < str.length; i += CHUNK_SIZE) {
    chunks.push(str.slice(i, i + CHUNK_SIZE))
  }
  return chunks
}

/**
 * Saves data in chunks if it exceeds the size limit
 */
export async function saveSecureChunked(key: string, value: string): Promise<void> {
  try {
    // If the value is small enough, store it directly
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value)
      return
    }

    // Split the value into chunks
    const chunks = splitIntoChunks(value)

    // Store the number of chunks
    await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString())

    // Store each chunk
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}${CHUNK_PREFIX}${i}`, chunks[i])
    }
  } catch (error) {
    reportCrash(error as Error)
  }
}

/**
 * Loads chunked data from secure storage
 */
export async function loadSecureChunked(key: string): Promise<string | null> {
  try {
    // First try to load as a single value
    const value = await SecureStore.getItemAsync(key)
    if (value !== null) {
      return value
    }

    // Check if we have chunks
    const numChunksStr = await SecureStore.getItemAsync(`${key}_chunks`)
    if (!numChunksStr) {
      return null
    }

    const numChunks = parseInt(numChunksStr, 10)
    const chunks: string[] = []

    // Load all chunks
    for (let i = 0; i < numChunks; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}${CHUNK_PREFIX}${i}`)
      if (chunk === null) {
        return null // If any chunk is missing, return null
      }
      chunks.push(chunk)
    }

    return chunks.join("")
  } catch (error) {
    reportCrash(error as Error)
    return null
  }
}

/**
 * Removes chunked data from secure storage
 */
export async function removeSecureChunked(key: string): Promise<void> {
  try {
    // Try to remove as single value first
    await SecureStore.deleteItemAsync(key)

    // Check if we have chunks
    const numChunksStr = await SecureStore.getItemAsync(`${key}_chunks`)
    if (!numChunksStr) {
      return
    }

    const numChunks = parseInt(numChunksStr, 10)

    // Remove all chunks
    for (let i = 0; i < numChunks; i++) {
      await SecureStore.deleteItemAsync(`${key}${CHUNK_PREFIX}${i}`)
    }

    // Remove the chunks count
    await SecureStore.deleteItemAsync(`${key}_chunks`)
  } catch (error) {
    reportCrash(error as Error)
  }
}
