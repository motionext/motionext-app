import { storage } from "@/utils/storage"

export function getAllStoredData(): string {
  const allKeys = storage.getAllKeys()
  return allKeys.map((key) => `${key}: ${storage.getString(key)}`).join("\n")
}

export function clearAllStoredData(): void {
  storage.clearAll()
}
