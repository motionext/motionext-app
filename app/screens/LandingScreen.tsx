// React and React Native imports
import { FC } from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

// Third party libraries
import { BlurView } from "expo-blur"

// Components
import { AutoImage } from "@/components/AutoImage"
import { Button, Screen } from "@/components"
import { HeaderLogo } from "@/components/HeaderLogo"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"

// Navigation
import { AppStackParamList, AppStackScreenProps } from "@/navigators"

// Theme and styles
import { $styles, type ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

// Services and hooks
import { useNavigation } from "@react-navigation/native"
import { NavigationProp } from "@react-navigation/native"
import { useAuth } from "@/services/auth/useAuth"

const landingImage = require("../../assets/images/landing-page/background.png")

interface LandingScreenProps extends AppStackScreenProps<"Welcome"> {}

export const LandingScreen: FC<LandingScreenProps> = observer(function LandingScreen() {
  const { themed, theme } = useAppTheme()
  const { signInWithGoogle } = useAuth()

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()

  const handleGoogleSignIn = async () => {
    const success = await signInWithGoogle()
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    }
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$styles.flex1}
      statusBarStyle="light"
      backgroundColor="#000"
    >
      <View style={[themed($topContainer), $bottomContainerInsets]}>
        <HeaderLogo style={themed($headerLogo)} tintColor="dark" />
        <AutoImage source={landingImage} style={themed($landingImage)} />
      </View>
      <View style={themed($bottomContainer)}>
        <AutoImage source={landingImage} style={themed($landingImage)} />
        <BlurView intensity={10} style={$blurViewStyle}>
          <View style={themed($contentContainer)}>
            <Button
              tx="landingScreen:continueWithMail"
              LeftAccessory={(props) => (
                <Icon
                  icon="mail"
                  size={24}
                  color={props.pressableState.pressed ? theme.colors.palette.neutral700 : "#fff"}
                  {...props}
                />
              )}
              onPress={() => navigation.navigate("SignIn")}
              style={themed($customButtonStyle)}
              textStyle={themed($customButtonText)}
              pressedTextStyle={themed($customButtonTextPressed)}
            />
            <View style={themed($dividerContainer)}>
              <View style={themed($line)} />
              <Text tx="landingScreen:or" style={themed($orText)} />
              <View style={themed($line)} />
            </View>
            <View style={themed($socialButtonsContainer)}>
              <Button
                tx="common:google"
                LeftAccessory={(props) => <Icon icon="google" size={20} {...props} />}
                onPress={handleGoogleSignIn}
                style={themed($socialButtonStyle)}
                textStyle={themed($socialButtonText)}
              />
            </View>
          </View>
        </BlurView>
      </View>
    </Screen>
  )
})

const $headerLogo: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  marginBottom: spacing.md,
})

const $topContainer: ThemedStyle<ViewStyle> = () => ({
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: 0,
  width: "100%",
  alignItems: "center",
})

const $landingImage: ThemedStyle<ImageStyle> = () => ({
  flex: 1,
  width: "100%",
  height: "100%",
  alignSelf: "center",
  resizeMode: "cover",
})

const $customButtonStyle: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: "90%",
  alignSelf: "center",
  paddingVertical: spacing.sm,
  borderRadius: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.crayola,
})

const $customButtonText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  color: "#fff",
  marginLeft: spacing.sm,
  fontSize: 16,
  fontWeight: "bold",
})

const $dividerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginVertical: spacing.sm,
  width: "80%",
  alignSelf: "center",
})

const $line: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.border,
  marginHorizontal: spacing.sm,
})

const $orText: ThemedStyle<TextStyle> = () => ({
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
})

const $socialButtonsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.md,
  width: "90%",
  alignSelf: "center",
})

const $socialButtonStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  maxWidth: "100%",
  paddingVertical: spacing.sm,
  borderRadius: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
})

const $socialButtonText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginLeft: spacing.sm,
  fontSize: 16,
  fontWeight: "bold",
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: spacing.lg,
  width: "100%",
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  padding: spacing.md,
  justifyContent: "center",
  width: "100%",
})

const $customButtonTextPressed: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.neutral700, // Color of the text when pressed
  marginLeft: spacing.sm,
  fontSize: 16,
  fontWeight: "bold",
})

const $blurViewStyle: ViewStyle = {
  flex: 1,
  width: "100%",
}
