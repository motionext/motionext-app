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

import { Icon, Screen } from "@/components"
import { AppStackParamList } from "@/navigators"
import { useAuth } from "@/services/auth/useAuth"
import { useKeyboard } from "@/utils/useKeyboard"
import { translate } from "@/i18n"
import { showMessage } from "@/utils/showMessage"
import { colors, ThemedStyle } from "@/theme"
import { SignInHeader, SignInForm, SignInFooter } from "./components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ValidationErrors } from "./types"

const signInSchema = z.object({
  email: z.string().email(translate("auth:errors.invalidEmail")),
  password: z.string().min(1, translate("auth:errors.passwordRequired")),
})

export const SignInScreen: FC = observer(function SignInScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()
  const { signIn, authStatus, resetPassword, signInWithGoogle } = useAuth()
  const { isKeyboardVisible } = useKeyboard()
  const { themed } = useAppTheme()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(new Map())
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false)

  const passwordInput = useRef<TextInput>(null)

  const validateForm = useCallback(() => {
    const result = signInSchema.safeParse({ email, password })
    if (!result.success) {
      const errors: Map<string, string> = new Map()
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string
        errors.set(field, err.message)
      })
      setValidationErrors(errors)
      return false
    }
    setValidationErrors(new Map())
    return true
  }, [email, password])

  const onSignIn = async () => {
    if (!validateForm()) return

    try {
      setIsSigningIn(true)

      const response = await signIn({ email: email.toLowerCase(), password })

      if (response.error) {
        showMessage({
          title: translate("errors:title"),
          description: response.error.message,
          type: "error",
        })
        return
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translate("errors:unknown")
      showMessage({
        title: translate("errors:title"),
        description: errorMessage,
        type: "error",
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  const onForgotPassword = async () => {
    if (!email) {
      setValidationErrors(new Map([["email", translate("auth:errors.emailRequired")]]))
      return
    }

    try {
      setIsForgotPasswordLoading(true)

      const { error } = await resetPassword(email)

      if (error) {
        showMessage({
          title: translate("errors:title"),
          description: error.message,
          type: "error",
        })
        return
      }

      showMessage({
        title: translate("auth:resetPasswordSuccessTitle"),
        description: translate("auth:resetPasswordSuccessDescription"),
        type: "success",
      })

      // Clear the validation errors after the reset password request
      setValidationErrors(new Map())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translate("errors:unknown")
      showMessage({
        title: translate("errors:title"),
        description: errorMessage,
        type: "error",
      })
    } finally {
      setIsForgotPasswordLoading(false)
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
      <Icon
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
          <SignInHeader />
          <SignInForm
            email={email}
            password={password}
            isPasswordHidden={isPasswordHidden}
            validationErrors={validationErrors}
            isSigningIn={isSigningIn}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={onSignIn}
            onForgotPassword={onForgotPassword}
            onGoogleSignIn={onGoogleSignIn}
            passwordInput={passwordInput}
            PasswordRightAccessory={PasswordRightAccessory}
            isForgotPasswordLoading={isForgotPasswordLoading}
          />
        </View>
        <SignInFooter isKeyboardVisible={isKeyboardVisible} />
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
