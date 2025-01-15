import { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackParamList, AppStackScreenProps } from "@/navigators"
import { Screen, Text, Button } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { $styles, type ThemedStyle } from "@/theme"
import { NavigationProp } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"

interface VerifyEmailScreenProps extends AppStackScreenProps<"VerifyEmail"> {}

export const VerifyEmailScreen: FC<VerifyEmailScreenProps> = observer(function VerifyEmailScreen() {
  const { themed } = useAppTheme()
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <View style={themed($topContainer)}>
        <Text tx="verifyEmailScreen:title" preset="heading" />
        <Button onPress={() => navigation.navigate("SignIn")} tx="verifyEmailScreen:button" />
      </View>
    </Screen>
  )
})
const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})
