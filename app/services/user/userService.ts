import { supabase } from "@/services/auth/supabase"
import { UserProfile } from "@/screens/SignUp/types"
import { z } from "zod"

// User profile validation schema
const userProfileSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "First name contains invalid characters")
    .transform((val) => val.trim()),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Last name contains invalid characters")
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, "Email is required")
    .max(100, "Email cannot exceed 100 characters")
    .email("Invalid email")
    .transform((val) => val.toLowerCase().trim()),
})

type UserProfileInput = z.infer<typeof userProfileSchema> & {
  signupToken?: string
}

/**
 * Service to manage user profiles in Supabase
 */
export const userService = {
  /**
   * Creates the user profile
   * @param userId - The unique identifier for the user
   * @param firstName - The user's first name
   * @param lastName - The user's last name
   * @param email - The user's email address
   */
  async createProfile({
    userId,
    firstName,
    lastName,
    email,
    signupToken,
  }: UserProfileInput): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      // Validate input data
      const validatedData = userProfileSchema.parse({
        userId,
        firstName,
        lastName,
        email,
      })

      // Generate an token, if not provided
      const token = signupToken
      const { data, error } = await supabase.rpc("secure_signup_profile", {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        signup_token: token,
        user_email: validatedData.email,
        user_id: validatedData.userId,
      })

      if (error) {
        return { data: null, error }
      }

      // Fetch the newly created profile
      if (data.success) {
        return await this.getProfileById(userId)
      }

      return { data: null, error: new Error(data.error || "Unknown error") }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

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

      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },
}
