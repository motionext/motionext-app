import { TextInput } from "react-native"
import { TextFieldAccessoryProps } from "@/components"

export interface ValidationErrors extends Map<string, string> {}

export interface SignUpFormProps {
  email: string
  password: string
  isPasswordHidden: boolean
  validationErrors: ValidationErrors
  isSigningUp: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  onGoogleSignIn: () => void
  passwordInput: React.RefObject<TextInput>
  PasswordRightAccessory: React.ComponentType<TextFieldAccessoryProps>
}
