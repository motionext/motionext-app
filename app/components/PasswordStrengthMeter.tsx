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
  2: "weak",
  3: "medium",
  4: "strong",
  5: "excellent",
}

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "password123",
  "admin",
  "qwerty",
  "letmein",
  "welcome",
  "monkey",
  "1234567890",
  "abc123",
  "password1",
  "123456789",
  "welcome123",
  "admin123",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "user",
  "login",
  "senha",
  "123123",
  "000000",
  "111111",
  "654321",
]

// Common patterns to avoid
const WEAK_PATTERNS = [
  /^(.)\1+$/, // All same character
  /^(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/, // Sequential numbers
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
  /^(qwe|asd|zxc|wer|sdf|xcv|ert|dfg|cvb|rty|fgh|vbn|tyu|ghj|bnm|yui|hjk|nmk|uio|jkl|iop|kl;|op\[)/i, // Keyboard patterns
]

export const PasswordStrengthMeter: FC<PasswordStrengthMeterProps> = ({
  password,
  onStrengthChange,
}) => {
  const { themed, theme } = useAppTheme()

  const getStrength = (pass: string): { strength: number; label: string } => {
    if (!pass) return { strength: 0, label: translate("passwordStrength:veryWeak") }

    let strength = 0

    // Basic length check
    if (pass.length >= 8) strength += 1
    if (pass.length >= 12) strength += 1 // Bonus for longer passwords

    // Character variety checks
    if (/[a-z]/.test(pass)) strength += 1
    if (/[A-Z]/.test(pass)) strength += 1
    if (/[0-9]/.test(pass)) strength += 1
    if (/[^a-zA-Z0-9]/.test(pass)) strength += 1 // Special characters

    // Advanced checks
    const hasVariety =
      (pass.match(/[a-z]/g) || []).length > 0 &&
      (pass.match(/[A-Z]/g) || []).length > 0 &&
      (pass.match(/[0-9]/g) || []).length > 0

    if (hasVariety && pass.length >= 10) strength += 1

    // Penalties for weak patterns
    const lowerPass = pass.toLowerCase()

    // Check against common passwords
    if (COMMON_PASSWORDS.includes(lowerPass)) {
      strength = Math.max(0, strength - 3)
    }

    // Check for common patterns
    for (const pattern of WEAK_PATTERNS) {
      if (pattern.test(lowerPass)) {
        strength = Math.max(0, strength - 2)
        break
      }
    }

    // Check for repeated characters (more than 50% repetition)
    const uniqueChars = new Set(pass.toLowerCase()).size
    const repetitionRatio = uniqueChars / pass.length
    if (repetitionRatio < 0.5 && pass.length > 4) {
      strength = Math.max(0, strength - 1)
    }

    // Check for dictionary words (basic check)
    if (pass.length > 4 && /^[a-zA-Z]+$/.test(pass)) {
      // If it's only letters, it might be a dictionary word
      strength = Math.max(0, strength - 1)
    }

    // Cap strength at maximum
    strength = Math.min(5, strength)

    const labels = [
      translate("passwordStrength:veryWeak"),
      translate("passwordStrength:weak"),
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

    if (index >= Math.ceil(currentStrength / 1.25)) return theme.colors.palette.neutral300

    switch (Math.ceil(currentStrength / 1.25)) {
      case 1:
        return "#dc2626" // very weak - red
      case 2:
        return "#ea580c" // weak - orange
      case 3:
        return "#ca8a04" // medium - yellow
      case 4:
        return "#16a34a" // strong - green
      case 5:
        return "#059669" // excellent - dark green
      default:
        return theme.colors.palette.neutral300
    }
  }

  const getStrengthDescription = (pass: string): string => {
    if (!pass) return translate("passwordStrength:empty")

    const issues: string[] = []

    if (pass.length < 8) issues.push(translate("passwordStrength:requirements.minLength"))
    if (!/[a-z]/.test(pass)) issues.push(translate("passwordStrength:requirements.lowercase"))
    if (!/[A-Z]/.test(pass)) issues.push(translate("passwordStrength:requirements.uppercase"))
    if (!/[0-9]/.test(pass)) issues.push(translate("passwordStrength:requirements.number"))

    // Check for common passwords
    if (COMMON_PASSWORDS.includes(pass.toLowerCase())) {
      return "Evite passwords comuns"
    }

    // Check for weak patterns
    for (const pattern of WEAK_PATTERNS) {
      if (pattern.test(pass.toLowerCase())) {
        return "Evite padrões previsíveis"
      }
    }

    if (issues.length > 0) {
      return issues[0] // Return first issue
    }

    if (pass.length < 12) {
      return "Considere usar 12+ caracteres"
    }

    if (!/[^a-zA-Z0-9]/.test(pass)) {
      return "Adicione símbolos especiais (!@#$%)"
    }

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
    onStrengthChange?.(strengthMap[Math.ceil(strength / 1.25)])
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
