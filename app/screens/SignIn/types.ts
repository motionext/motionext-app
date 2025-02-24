import { TextInput } from "react-native"
import { TextFieldAccessoryProps } from "@/components"

export interface ValidationErrors extends Map<string, string> {}

export interface SignInFormProps {
  email: string
  password: string
  isPasswordHidden: boolean
  validationErrors: ValidationErrors
  isSigningIn: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  onForgotPassword: () => void
  onGoogleSignIn: () => void
  passwordInput: React.RefObject<TextInput>
  PasswordRightAccessory: React.ComponentType<TextFieldAccessoryProps>
  isForgotPasswordLoading: boolean
}
