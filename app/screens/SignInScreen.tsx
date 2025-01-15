import { ComponentType, FC, useMemo, useRef, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { z } from "zod"
import { Image, ImageStyle, Pressable, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { AppStackParamList, AppStackScreenProps } from "app/navigators"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "app/components"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { colors, spacing } from "app/theme"
import { useAuth } from "app/services/auth/useAuth"
import { NavigationProp } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"

const logo = require("../../assets/images/logo.png")

// TODO: translate strings, and add more rules
const signInSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z.string().min(1, "Password cannot be blank"),
})

interface SignInScreenProps extends AppStackScreenProps<"SignIn"> {}

// TODO: Improve design of the email templates in Supabase
export const SignInScreen: FC<SignInScreenProps> = observer(function SignInScreen() {
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()
  const { signIn, signUp, authStatus } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map())

  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const isLoading = isSigningIn || isSigningUp

  const passwordInput = useRef<TextInput>(null)

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    }
  }, [authStatus, navigation])

  const validateForm = () => {
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
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsPasswordHidden(!isPasswordHidden)}
          />
        )
      },
    [isPasswordHidden],
  )

  const onSignIn = async () => {
    if (!validateForm()) return

    try {
      setIsSigningIn(true)
      const response = await signIn({ email, password })

      if (response.error) {
        setValidationErrors(new Map([["global", response.error.message]]))
        return
      }
    } catch (error) {
      reportError(error as Error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setValidationErrors(new Map([["global", errorMessage]]))
    } finally {
      setIsSigningIn(false)
    }
  }

  // TODO: Separate sign up flow
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

      // If there's no error, navigate to VerifyEmail
      navigation.navigate("VerifyEmail")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setValidationErrors(new Map([["global", errorMessage]]))
    } finally {
      setIsSigningUp(false)
    }
  }

  const onForgotPassword = () => {
    // Forgot Password Flow
    // TODO: Implement forget password flow
    if (__DEV__) {
      console.log("[AUTH] Forgot Password Flow")
    }
  }

  // TODO: Add dark mode support
  return (
    <Screen contentContainerStyle={$root} preset="auto" safeAreaEdges={["top"]}>
      <View style={$container}>
        <View style={$topContainer}>
          <Image style={$logo} source={logo} resizeMode="contain" />
        </View>
        <View style={[$bottomContainer, $bottomContainerInsets]}>
          {validationErrors.get("global") && (
            <Text style={$errorText}>{validationErrors.get("global")}</Text>
          )}

          <View>
            <TextField
              containerStyle={$textField}
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              inputMode="email"
              defaultValue={email}
              onChangeText={setEmail}
              readOnly={isLoading}
              onSubmitEditing={() => passwordInput.current?.focus()}
              returnKeyType="next"
              helper={validationErrors.get("email")}
              status={validationErrors.get("email") ? "error" : undefined}
            />
            <TextField
              containerStyle={$textField}
              label="Password"
              autoCapitalize="none"
              autoComplete="current-password" // TODO: use 'new-password' on sign-uo flow
              autoCorrect={false}
              defaultValue={password}
              onChangeText={setPassword}
              readOnly={isLoading}
              onSubmitEditing={onSignIn}
              returnKeyType="done"
              RightAccessory={PasswordRightAccessory}
              secureTextEntry={isPasswordHidden}
              helper={validationErrors.get("password")}
              status={validationErrors.get("password") ? "error" : undefined}
            />
          </View>
          <View>
            <Button onPress={onSignIn} disabled={isLoading}>
              {isSigningIn ? "Signing In..." : "Sign In"}
            </Button>
            <Pressable style={$forgotPassword} onPress={onForgotPassword} disabled={isLoading}>
              <Text preset="bold">Forgot Password?</Text>
            </Pressable>
            <Text style={$buttonDivider}>- or -</Text>
            <Button preset="reversed" onPress={onSignUp} disabled={isLoading}>
              {isSigningUp ? "Signing Up..." : "Sign Up"}
            </Button>
          </View>
          <View style={$cap} />
        </View>
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  minHeight: "100%",
  backgroundColor: colors.palette.neutral100,
}

const $container: ViewStyle = {
  backgroundColor: colors.background,
}

const $topContainer: ViewStyle = {
  height: 200,
  justifyContent: "center",
  alignItems: "center",
}

const $bottomContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  paddingBottom: spacing.xl,
  paddingHorizontal: spacing.lg,
}

const $cap: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  height: spacing.xl,
  position: "absolute",
  top: -spacing.xl,
  left: 0,
  right: 0,
}

const $textField: ViewStyle = {
  marginBottom: spacing.md,
}

const $forgotPassword: ViewStyle = {
  marginVertical: spacing.md,
}

const $buttonDivider: TextStyle = {
  textAlign: "center",
  marginVertical: spacing.md,
}

const $logo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
}

const $errorText: TextStyle = {
  color: colors.error,
}
