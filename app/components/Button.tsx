import { ComponentType } from "react"
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native"

import type { ThemedStyle, ThemedStyleArray } from "@/theme"
import { $styles } from "@/theme"
import { Text, TextProps } from "@/components/Text"
import { useAppTheme } from "@/utils/useAppTheme"

type Presets = "default" | "filled" | "reversed"
type ColorType = "dark" | "light" | "auto"

export interface ButtonAccessoryProps {
  style: StyleProp<any>
  pressableState: PressableStateCallbackType
  disabled?: boolean
  colorStyle?: StyleProp<TextStyle>
}

export interface ButtonProps extends PressableProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps["tx"]
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: TextProps["text"]
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps["txOptions"]
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * An optional style override for the "pressed" state.
   */
  pressedStyle?: StyleProp<ViewStyle>
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "pressed" state.
   */
  pressedTextStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "disabled" state.
   */
  disabledTextStyle?: StyleProp<TextStyle>
  /**
   * One of the different types of button presets.
   */
  preset?: Presets
  /**
   * An optional component to render on the right side of the text.
   * Example: `RightAccessory={(props) => <View {...props} />}`
   */
  RightAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * An optional component to render on the left side of the text.
   * Example: `LeftAccessory={(props) => <View {...props} />}`
   */
  LeftAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * Children components.
   */
  children?: React.ReactNode
  /**
   * disabled prop, accessed directly for declarative styling reasons.
   * https://reactnative.dev/docs/pressable#disabled
   */
  disabled?: boolean
  /**
   * An optional style override for the disabled state
   */
  disabledStyle?: StyleProp<ViewStyle>
  /**
   * Defines the text color behavior after pressing
   * - dark: Forces dark text, left and right icons will be dark
   * - light: Forces light text, left and right icons will be light
   * - auto: Automatically chooses based on background (default)
   */
  colorType?: ColorType
}

/**
 * A component that allows users to take actions and make choices.
 * Wraps the Text component with a Pressable component.
 * @param {ButtonProps} props - The props for the `Button` component.
 * @returns {JSX.Element} The rendered `Button` component.
 * @example
 * <Button
 *   tx=""
 *   style={styles.button}
 *   textStyle={styles.buttonText}
 *   onPress={handleButtonPress}
 * />
 */
export function Button(props: ButtonProps) {
  const {
    tx,
    text,
    txOptions,
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    disabledTextStyle: $disabledTextStyleOverride,
    children,
    RightAccessory,
    LeftAccessory,
    disabled,
    colorType = "auto",
    disabledStyle: $disabledViewStyleOverride,
    ...rest
  } = props

  const { themed } = useAppTheme()

  const preset: Presets = props.preset ?? "default"
  /**
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<ViewStyle>} The view style based on the pressed state.
   */
  function $viewStyle({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> {
    return [
      themed($viewPresets[preset]),
      $viewStyleOverride,
      !!pressed && themed([$pressedViewPresets[preset], $pressedViewStyleOverride]),
      !!disabled && themed([$disabledViewPresets[preset], $disabledViewStyleOverride]),
    ]
  }
  /**
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<TextStyle>} The text style based on the pressed state.
   */
  function $textStyle({ pressed }: PressableStateCallbackType): StyleProp<TextStyle> {
    return [
      themed($textPresets[preset]),
      $textStyleOverride,
      !!pressed &&
        themed([
          $pressedTextPresets[preset],
          $pressedTextStyleOverride,
          $colorTypePresets[colorType],
        ]),
      !!disabled && $disabledTextStyleOverride,
    ]
  }

  /**
   * Returns the color style based on the current state
   */
  function $colorStyle(state: PressableStateCallbackType): StyleProp<TextStyle> {
    const { pressed } = state
    return pressed ? themed($colorTypePresets[colorType]) : {}
  }

  return (
    <Pressable
      style={$viewStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      {...rest}
      disabled={disabled}
    >
      {(state) => (
        <>
          {!!LeftAccessory && (
            <LeftAccessory
              style={[$leftAccessoryStyle, $colorStyle(state)]}
              pressableState={state}
              disabled={disabled}
            />
          )}

          <Text tx={tx} text={text} txOptions={txOptions} style={$textStyle(state)}>
            {children}
          </Text>

          {!!RightAccessory && (
            <RightAccessory
              style={[$rightAccessoryStyle, $colorStyle(state)]}
              pressableState={state}
              disabled={disabled}
            />
          )}
        </>
      )}
    </Pressable>
  )
}

const $baseViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 48,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  flexDirection: "row",
  gap: spacing.xs,
})

const $baseTextStyle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 17,
  lineHeight: 20,
  fontFamily: typography.primary.semiBold,
  textAlign: "center",
  flexShrink: 1,
  flexGrow: 0,
  zIndex: 2,
  letterSpacing: 0.3,
})

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.xs,
  zIndex: 1,
})
const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.xs,
  zIndex: 1,
})
const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      borderWidth: 0,
      borderColor: colors.palette.neutral300,
      backgroundColor: colors.palette.neutral100,
    }),
  ],
  filled: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.palette.primary500,
      shadowColor: colors.palette.primary500,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    }),
  ],
  reversed: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.palette.neutral900,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    }),
  ],
}

const $textPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseTextStyle],
  filled: [$baseTextStyle],
  reversed: [$baseTextStyle, ({ colors }) => ({ color: colors.palette.neutral100 })],
}

const $pressedViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: () => ({
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  }),
  filled: () => ({
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  }),
  reversed: () => ({
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  }),
}

const $pressedTextPresets: Record<Presets, ThemedStyle<TextStyle>> = {
  default: () => ({ opacity: 0.9 }),
  filled: () => ({ opacity: 0.9 }),
  reversed: () => ({ opacity: 0.9 }),
}

const $disabledViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: ({ colors }) => ({
    backgroundColor: colors.palette.neutral200,
    borderColor: colors.palette.neutral300,
    opacity: 0.6,
  }),
  filled: ({ colors }) => ({
    backgroundColor: colors.palette.neutral400,
    opacity: 0.6,
  }),
  reversed: ({ colors }) => ({
    backgroundColor: colors.palette.neutral700,
    opacity: 0.6,
  }),
}

const $colorTypePresets: Record<ColorType, ThemedStyle<TextStyle>> = {
  dark: () => ({
    color: "#000000",
    tintColor: "#000000",
  }),
  light: () => ({
    color: "#FFFFFF",
    tintColor: "#FFFFFF",
  }),
  auto: () => ({}), // mantém a cor padrão do preset
}
