import { TextInput } from "react-native"
import { TextFieldAccessoryProps } from "@/components"

export interface ValidationErrors extends Map<string, string> {}

export interface SignUpFormProps {
  firstName: string
  lastName: string
  email: string
  password: string
  isPasswordHidden: boolean
  validationErrors: ValidationErrors
  isSigningUp: boolean
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  onGoogleSignIn: () => void
  passwordInput: React.RefObject<TextInput>
  lastNameInput: React.RefObject<TextInput>
  emailInput: React.RefObject<TextInput>
  PasswordRightAccessory: React.ComponentType<TextFieldAccessoryProps>
}

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  created_at: string
  updated_at: string
}
