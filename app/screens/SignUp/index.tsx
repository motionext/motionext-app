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
import { SignUpHeader, SignUpForm, SignUpFooter } from "./components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ValidationErrors } from "./types"

const signUpSchema = z.object({
  email: z.string().email(translate("auth:errors.invalidEmail")),
  password: z.string().min(1, translate("auth:errors.passwordRequired")),
})

export const SignUpScreen: FC = observer(function SignUpScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()
  const { signUp, authStatus, signInWithGoogle } = useAuth()
  const { isKeyboardVisible } = useKeyboard()
  const { themed } = useAppTheme()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(new Map())
  const [isSigningUp, setIsSigningUp] = useState(false)

  const passwordInput = useRef<TextInput>(null)

  const validateForm = useCallback(() => {
    const result = signUpSchema.safeParse({ email, password })
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

  const onSignUp = async () => {
    if (!validateForm()) return

    try {
      setIsSigningUp(true)
      const { error } = await signUp({
        email: email.toLowerCase(),
        password,
      })

      if (error) {
        setValidationErrors(new Map([["global", error.message]]))
        return
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
          <SignUpHeader />
          <SignUpForm
            email={email}
            password={password}
            isPasswordHidden={isPasswordHidden}
            validationErrors={validationErrors}
            isSigningUp={isSigningUp}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={onSignUp}
            onGoogleSignIn={onGoogleSignIn}
            passwordInput={passwordInput}
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
