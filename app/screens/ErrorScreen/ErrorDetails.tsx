import { ErrorInfo } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { Button, Icon, Screen, Text } from "../../components"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

export interface ErrorDetailsProps {
  error: Error
  errorInfo: ErrorInfo | null
  onReset(): void
}

/**
 * Renders the error details screen.
 * @param {ErrorDetailsProps} props - The props for the `ErrorDetails` component.
 * @returns {JSX.Element} The rendered `ErrorDetails` component.
 */
export function ErrorDetails(props: ErrorDetailsProps) {
  const { themed } = useAppTheme()
  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($contentContainer)}
    >
      <Icon icon="ladybug" size={64} />
      <Text style={themed($heading)} preset="subheading" tx="errorScreen:title" />
      <Text style={themed($subtitle)} tx="errorScreen:friendlySubtitle" />

      <Button
        preset="reversed"
        style={themed($resetButton)}
        onPress={props.onReset}
        tx="errorScreen:reset"
      />
    </Screen>
  )
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center", // Centers content vertically
  paddingHorizontal: spacing.lg,
  flex: 1,
})

const $heading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
})

const $resetButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  paddingHorizontal: spacing.xxl,
  borderRadius: spacing.xs,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.lg,
  color: colors.textDim,
})
