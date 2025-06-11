import { View, ViewStyle, TextStyle } from "react-native"
import Animated, { withSpring, useAnimatedStyle } from "react-native-reanimated"
import { FC, useEffect } from "react"

import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { translate } from "@/i18n"

import { Text } from "./Text"

export type PasswordStrength = "weak" | "medium" | "strong" | "excellent"

interface PasswordStrengthMeterProps {
  password: string
  onStrengthChange?: (strength: PasswordStrength) => void
}

const strengthMap: Record<number, PasswordStrength> = {
  0: "weak",
  1: "weak",
  2: "medium",
  3: "strong",
  4: "excellent",
}

export const PasswordStrengthMeter: FC<PasswordStrengthMeterProps> = ({
  password,
  onStrengthChange,
}) => {
  const { themed, theme } = useAppTheme()

  const getStrength = (pass: string): { strength: number; label: string } => {
    if (!pass) return { strength: 0, label: translate("passwordStrength:veryWeak") }

    let strength = 0
    if (pass.length >= 8) strength += 1
    if (/[a-z]/.test(pass)) strength += 1
    if (/[A-Z]/.test(pass)) strength += 1
    if (/[0-9]/.test(pass)) strength += 1

    const labels = [
      translate("passwordStrength:veryWeak"),
      translate("passwordStrength:weak"),
      translate("passwordStrength:medium"),
      translate("passwordStrength:strong"),
      translate("passwordStrength:veryStrong"),
    ]
    return { strength, label: labels[strength] }
  }

  const { strength, label } = getStrength(password)

  const getSegmentColor = (index: number, currentStrength: number) => {
    "worklet" //? https://docs.swmansion.com/react-native-reanimated/docs/guides/worklets/

    if (index >= currentStrength) return theme.colors.palette.neutral300

    switch (currentStrength) {
      case 1:
        return "#fa671d" // weak
      case 2:
        return "#fcad4f" // medium
      case 3:
        return "#0bb98a" // strong
      case 4:
        return "#1f7962" // excellent
      default:
        return "#D3D3D3" // neutral
    }
  }

  const getStrengthDescription = (pass: string): string => {
    if (!pass) return translate("passwordStrength:empty")

    const hasMinLength = pass.length >= 8
    const hasLowerCase = /[a-z]/.test(pass)
    const hasUpperCase = /[A-Z]/.test(pass)
    const hasNumbers = /[0-9]/.test(pass)

    if (!hasMinLength) return translate("passwordStrength:requirements.minLength")
    if (!hasLowerCase) return translate("passwordStrength:requirements.lowercase")
    if (!hasUpperCase) return translate("passwordStrength:requirements.uppercase")
    if (!hasNumbers) return translate("passwordStrength:requirements.number")

    return translate("passwordStrength:requirements.perfect")
  }

  const animatedStyle0 = useAnimatedStyle(() => ({
    backgroundColor: withSpring(getSegmentColor(0, strength), { damping: 15, stiffness: 70 }),
  }))
  const animatedStyle1 = useAnimatedStyle(() => ({
    backgroundColor: withSpring(getSegmentColor(1, strength), { damping: 15, stiffness: 70 }),
  }))
  const animatedStyle2 = useAnimatedStyle(() => ({
    backgroundColor: withSpring(getSegmentColor(2, strength), { damping: 15, stiffness: 70 }),
  }))
  const animatedStyle3 = useAnimatedStyle(() => ({
    backgroundColor: withSpring(getSegmentColor(3, strength), { damping: 15, stiffness: 70 }),
  }))

  useEffect(() => {
    onStrengthChange?.(strengthMap[strength])
  }, [strength, onStrengthChange])

  return (
    <View style={themed($container)}>
      <View style={themed($labelContainer)}>
        <Text size="xs" weight="medium" style={themed($strengthLabel)}>
          {label}
        </Text>
      </View>
      <View style={themed($meterContainer)}>
        {[...Array(4)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              themed($segment),
              themed($segmentBase),
              [animatedStyle0, animatedStyle1, animatedStyle2, animatedStyle3][i],
            ]}
          />
        ))}
      </View>
      <Text size="xs" style={themed($description)}>
        {getStrengthDescription(password)}
      </Text>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxs,
  marginTop: -spacing.xs,
})

const $labelContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "flex-start",
})

const $meterContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $segment: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $segmentBase: ThemedStyle<ViewStyle> = () => ({
  height: 4,
  borderRadius: 2,
  marginHorizontal: 2,
})

const $strengthLabel: ThemedStyle<TextStyle> = () => ({
  textTransform: "uppercase",
  letterSpacing: 0.5,
})

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
