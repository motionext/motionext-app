import { FC } from "react"
import {
  ScrollView,
  View,
  Image,
  TextStyle,
  ViewStyle,
  ImageStyle,
  ActivityIndicator,
} from "react-native"
import { Button, Text, TextField, Divider } from "@/components"
import { translate } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import type { SignInFormProps } from "../types"

const googleIcon = require("../../../../assets/icons/google.png")

export const SignInForm: FC<SignInFormProps> = ({
  email,
  password,
  isPasswordHidden,
  validationErrors,
  isSigningIn,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  onGoogleSignIn,
  passwordInput,
  PasswordRightAccessory,
  isForgotPasswordLoading,
}) => {
  const { themed } = useAppTheme()

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
          text="Google"
          onPress={onGoogleSignIn}
        />

        <Divider text={translate("landingScreen:or")} />

        <View style={themed($formFields)}>
          <TextField
            containerStyle={themed($textField)}
            label={translate("auth:signIn.email")}
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
            label={translate("auth:signIn.password")}
            autoCapitalize="none"
            autoComplete="password"
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

          <Text
            tx="auth:resetPassword"
            size="sm"
            style={[
              themed($forgotPassword),
              { opacity: $forgotPasswordOpacity(isForgotPasswordLoading) },
            ]}
            onPress={onForgotPassword}
            disabled={isForgotPasswordLoading}
          />

          <Button
            tx="auth:signIn.button"
            preset="reversed"
            style={themed($button)}
            onPress={onSubmit}
            disabled={isSigningIn}
            RightAccessory={() =>
              isSigningIn ? (
                <View style={themed($spinnerContainer)}>
                  <ActivityIndicator size="small" color={themed($spinnerColor)} />
                </View>
              ) : null
            }
          />
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

const $textField: ViewStyle = {
  minHeight: 85,
}

const $googleButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  maxWidth: "100%",
  minHeight: 50,
})

const $googleIcon: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  width: 24,
  height: 24,
  marginRight: spacing.sm,
})

const $forgotPassword: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  textAlign: "right",
  alignSelf: "flex-end",
})

const $spinnerContainer: ViewStyle = {
  marginLeft: 8,
}

const $spinnerColor: ThemedStyle<string> = ({ colors }) => colors.palette.crayola

const $forgotPasswordOpacity = (isForgotPasswordLoading: boolean): number =>
  isForgotPasswordLoading ? 0.5 : 1

const $button: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  color: colors.palette.neutral100,
})
