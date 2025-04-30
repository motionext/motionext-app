import NetInfo from "@react-native-community/netinfo"
import { z } from "zod"
import { load, save } from "@/utils/storage"
import { UserProfile } from "@/screens/SignUp/types"
import { supabase } from "@/services/auth/supabase"

const CACHE_KEY_PREFIX = "userProfile_"

class UserService {
  /**
   * Gets the user profile by ID
   * @param userId - The unique identifier for the user
   */
  async getProfileById(userId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      // Validate user ID
      if (!z.string().uuid().safeParse(userId).success) {
        return { data: null, error: new Error("Invalid user ID") }
      }

      // Check connectivity
      const networkState = await NetInfo.fetch()
      const isConnected = networkState.isConnected

      let cachedProfile: UserProfile | null = null

      // If offline, try to fetch from cache first
      if (!isConnected) {
        cachedProfile = await this.getCachedProfile(userId)

        if (cachedProfile) {
          return { data: cachedProfile, error: null }
        }
      }

      // If online or no cache, fetch from API
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      // If successful, cache the data
      if (data && !error) {
        await this.cacheProfile(userId, data)
      }

      // If there is a network error and we have a cache, use it as a fallback
      if (error && !isConnected) {
        cachedProfile = await this.getCachedProfile(userId)
        if (cachedProfile) {
          return { data: cachedProfile, error: null }
        }
      }

      return { data, error: null }
    } catch (error) {
      // If offline, try to use cache as a last resort
      const networkState = await NetInfo.fetch()
      if (!networkState.isConnected) {
        const cachedProfile = await this.getCachedProfile(userId)
        if (cachedProfile) {
          return { data: cachedProfile, error: null }
        }
      }

      return { data: null, error: error as Error }
    }
  }

  // Cache the profile
  private async cacheProfile(userId: string, profile: UserProfile) {
    await save(`${CACHE_KEY_PREFIX}${userId}`, profile)
  }

  // Retrieve the profile from cache
  private async getCachedProfile(userId: string): Promise<UserProfile | null> {
    return (await load(`${CACHE_KEY_PREFIX}${userId}`)) as UserProfile | null
  }
}

export const userService = new UserService()
