import { FC, useCallback, useEffect, useRef, useState } from "react"
import {
  ImageStyle,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"
import { CommonActions, NavigationProp, useNavigation } from "@react-navigation/native"
import { z } from "zod"

import { PressableIcon, Screen } from "@/components"
import { AppStackParamList } from "@/navigators"
import { useAuth } from "@/services/auth/useAuth"
import { useKeyboard } from "@/utils/useKeyboard"
import { translate } from "@/i18n"
import { showMessage } from "@/utils/showMessage"
import { colors, ThemedStyle } from "@/theme"
import { SignUpHeader, SignUpForm, SignUpFooter } from "./components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ValidationErrors } from "./types"
import { save } from "@/utils/storage"

// Esquema de validação mais robusto com Zod
const signUpSchema = z.object({
  firstName: z
    .string()
    .min(1, translate("auth:errors.firstNameRequired"))
    .max(50, translate("auth:errors.firstNameTooLong"))
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, translate("auth:errors.invalidFirstName"))
    .transform((val) => val.trim()),

  lastName: z
    .string()
    .min(1, translate("auth:errors.lastNameRequired"))
    .max(50, translate("auth:errors.lastNameTooLong"))
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, translate("auth:errors.invalidLastName"))
    .transform((val) => val.trim()),

  email: z
    .string()
    .min(1, translate("auth:errors.emailRequired"))
    .max(100, translate("auth:errors.emailTooLong"))
    .email(translate("auth:errors.invalidEmail"))
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string()
    .min(8, translate("auth:errors.passwordTooShort"))
    .max(100, translate("auth:errors.passwordTooLong")),
})

// Tipo para os dados validados
type SignUpFormData = z.infer<typeof signUpSchema>

export const SignUpScreen: FC = observer(function SignUpScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()
  const { signUp, authStatus, signInWithGoogle } = useAuth()
  const { isKeyboardVisible } = useKeyboard()
  const { themed } = useAppTheme()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(new Map())
  const [isSigningUp, setIsSigningUp] = useState(false)

  const lastNameInput = useRef<TextInput>(null)
  const emailInput = useRef<TextInput>(null)
  const passwordInput = useRef<TextInput>(null)

  const validateField = useCallback((field: keyof SignUpFormData, value: string): boolean => {
    try {
      signUpSchema.shape[field].parse(value)
      setValidationErrors((prev) => {
        const next = new Map(prev)
        next.delete(field)
        return next
      })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors((prev) => {
          const next = new Map(prev)
          error.errors.forEach((err) => {
            next.set(field, err.message)
          })
          return next
        })
      }
      return false
    }
  }, [])

  const validateForm = useCallback((): SignUpFormData | null => {
    try {
      const result = signUpSchema.parse({
        firstName,
        lastName,
        email,
        password,
      })
      setValidationErrors(new Map())
      return result
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = new Map<string, string>()
        error.errors.forEach((err) => {
          const field = err.path[0] as string
          newErrors.set(field, err.message)
        })
        setValidationErrors(newErrors)
      }
      return null
    }
  }, [firstName, lastName, email, password])

  const handleFirstNameChange = (value: string) => {
    setFirstName(value)
    validateField("firstName", value)
  }

  const handleLastNameChange = (value: string) => {
    setLastName(value)
    validateField("lastName", value)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    validateField("email", value)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    validateField("password", value)
  }

  const onSignUp = async () => {
    const validatedData = validateForm()
    if (!validatedData) return

    try {
      setIsSigningUp(true)
      const { data, error } = await signUp({
        email: validatedData.email,
        password: validatedData.password,
      })

      if (error) {
        setValidationErrors(new Map([["global", error.message]]))
        return
      }

      // If the sign-up was successful and we have a user, save the profile
      if (data.user) {
        await save("pendingProfile", {
          userId: data.user.id,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
        })
      }

      navigation.navigate("VerifyEmail")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translate("errors:unknown")
      setValidationErrors(new Map([["global", errorMessage]]))
    } finally {
      setIsSigningUp(false)
    }
  }

  const onGoogleSignIn = async () => {
    try {
      const success = await signInWithGoogle()

      if (!success) {
        showMessage({
          title: translate("errors:title"),
          description: translate("auth:errors.googleSignInFailed"),
          type: "error",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translate("errors:unknown")
      showMessage({
        title: translate("errors:title"),
        description: errorMessage,
        type: "error",
      })
    }
  }

  const PasswordRightAccessory = useCallback(
    (props: any) => (
      <PressableIcon
        style={themed($eyeIcon)}
        icon={isPasswordHidden ? "view" : "hidden"}
        color={colors.palette.neutral800}
        containerStyle={props.style}
        size={20}
        onPress={() => setIsPasswordHidden(!isPasswordHidden)}
      />
    ),
    [isPasswordHidden, themed],
  )

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        }),
      )
    }
  }, [authStatus, navigation])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={themed($keyboardAvoidingView)}
    >
      <Screen preset="fixed" contentContainerStyle={themed($root)} safeAreaEdges={["top"]}>
        <View style={themed($content)}>
          <SignUpHeader />
          <SignUpForm
            firstName={firstName}
            lastName={lastName}
            email={email}
            password={password}
            isPasswordHidden={isPasswordHidden}
            validationErrors={validationErrors}
            isSigningUp={isSigningUp}
            onFirstNameChange={handleFirstNameChange}
            onLastNameChange={handleLastNameChange}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
            onSubmit={onSignUp}
            onGoogleSignIn={onGoogleSignIn}
            passwordInput={passwordInput}
            lastNameInput={lastNameInput}
            emailInput={emailInput}
            PasswordRightAccessory={PasswordRightAccessory}
          />
        </View>
        <SignUpFooter isKeyboardVisible={isKeyboardVisible} />
      </Screen>
    </KeyboardAvoidingView>
  )
})

const $keyboardAvoidingView: ViewStyle = {
  flex: 1,
}

const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.lg,
})

const $eyeIcon: ThemedStyle<ImageStyle> = ({ colors }) => ({
  tintColor: colors.palette.neutral900,
})
