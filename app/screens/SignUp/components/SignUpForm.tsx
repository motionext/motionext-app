import { FC, useState, useEffect } from "react"
import { ScrollView, View, Image, ViewStyle, ImageStyle, ActivityIndicator } from "react-native"
import { Button, TextField, Divider } from "@/components"
import { translate } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import type { SignUpFormProps } from "../types"
import { PasswordStrengthMeter, PasswordStrength } from "@/components/PasswordStrengthMeter"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"

const googleIcon = require("../../../../assets/icons/google.png")

export const SignUpForm: FC<SignUpFormProps> = ({
  firstName,
  lastName,
  email,
  password,
  isPasswordHidden,
  validationErrors,
  isSigningUp,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleSignIn,
  passwordInput,
  lastNameInput,
  emailInput,
  PasswordRightAccessory,
}) => {
  const { themed, theme } = useAppTheme()
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>("weak")

  // Animated value to control the transition
  const buttonAnimationProgress = useSharedValue(0)

  // Updates the animation value when the password strength changes
  useEffect(() => {
    buttonAnimationProgress.value = withTiming(passwordStrength === "excellent" ? 1 : 0, {
      duration: 500,
    })
  }, [passwordStrength, buttonAnimationProgress])

  // Animated style for the button
  const animatedButtonStyle = useAnimatedStyle(() => {
    const backgroundColor =
      passwordStrength === "excellent"
        ? withTiming(theme.colors.tint, { duration: 300 })
        : withTiming(theme.colors.palette.neutral400, { duration: 300 })

    return {
      backgroundColor,
    }
  })

  const isSubmitDisabled = isSigningUp || passwordStrength !== "excellent"

  return (
    <ScrollView
      style={themed($scrollView)}
      contentContainerStyle={themed($scrollContent)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={themed($container)}>
        <Button
          preset="filled"
          style={themed($googleButton)}
          LeftAccessory={() => <Image source={googleIcon} style={themed($googleIcon)} />}
          text={translate("common:google")}
          onPress={onGoogleSignIn}
        />

        <Divider text={translate("landingScreen:or")} />

        <View style={themed($formFields)}>
          {/* First Name and Last Name on the same line */}
          <View style={themed($rowContainer)}>
            <TextField
              containerStyle={[themed($textField), themed($halfWidth)]}
              label={translate("auth:signUp.firstName")}
              autoCapitalize="words"
              autoComplete="name-given"
              autoCorrect={false}
              value={firstName}
              onChangeText={onFirstNameChange}
              status={validationErrors.get("firstName") ? "error" : undefined}
              helper={validationErrors.get("firstName")}
              onSubmitEditing={() => lastNameInput.current?.focus()}
              returnKeyType="next"
            />

            <TextField
              ref={lastNameInput}
              containerStyle={[themed($textField), themed($halfWidth)]}
              label={translate("auth:signUp.lastName")}
              autoCapitalize="words"
              autoComplete="name-family"
              autoCorrect={false}
              value={lastName}
              onChangeText={onLastNameChange}
              status={validationErrors.get("lastName") ? "error" : undefined}
              helper={validationErrors.get("lastName")}
              onSubmitEditing={() => emailInput.current?.focus()}
              returnKeyType="next"
            />
          </View>

          <TextField
            ref={emailInput}
            containerStyle={themed($textField)}
            label={translate("auth:signUp.email")}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={onEmailChange}
            status={validationErrors.get("email") ? "error" : undefined}
            helper={validationErrors.get("email")}
            onSubmitEditing={() => passwordInput.current?.focus()}
            returnKeyType="next"
          />

          <TextField
            ref={passwordInput}
            containerStyle={themed($textField)}
            label={translate("auth:signUp.password")}
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect={false}
            secureTextEntry={isPasswordHidden}
            value={password}
            onChangeText={onPasswordChange}
            status={validationErrors.get("password") ? "error" : undefined}
            helper={validationErrors.get("password")}
            onSubmitEditing={onSubmit}
            returnKeyType="done"
            RightAccessory={PasswordRightAccessory}
          />
          <PasswordStrengthMeter password={password} onStrengthChange={setPasswordStrength} />

          <View style={themed($buttonWrapper)}>
            <Animated.View style={[animatedButtonStyle, themed($buttonContainer)]}>
              <Button
                tx="auth:signUp.button"
                preset="reversed"
                style={themed($button)}
                onPress={onSubmit}
                disabled={isSubmitDisabled}
                RightAccessory={() =>
                  isSigningUp ? (
                    <View style={themed($spinnerContainer)}>
                      <ActivityIndicator size="small" color={themed($spinnerColor)} />
                    </View>
                  ) : null
                }
              />
            </Animated.View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const $scrollView: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  flexGrow: 1,
  justifyContent: "center",
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  width: "100%",
})

const $formFields: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
})

const $rowContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.sm,
})

const $halfWidth: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $textField: ViewStyle = {
  minHeight: 85,
}

const $googleButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderWidth: 0.75,
  borderColor: colors.border,
  maxWidth: "100%",
  minHeight: 50,
  borderRadius: 8,
  marginBottom: spacing.xs,
})

const $googleIcon: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  height: 24,
  width: 24,
  marginRight: spacing.sm,
})

const $spinnerContainer: ViewStyle = {
  marginLeft: 8,
}

const $spinnerColor = "#fff"

const $button: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "transparent",
})

const $buttonContainer: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 8,
  overflow: "hidden",
})

const $buttonWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  borderRadius: 8,
  overflow: "hidden",
})
