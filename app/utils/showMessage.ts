import { Notifier } from "react-native-notifier"
import { Easing } from "react-native-reanimated"
import { NotifierComponents } from "react-native-notifier"

type MessageType = "success" | "error" | "info" | "warning"

interface ShowMessageProps {
  title?: string
  description?: string
  type?: MessageType
  duration?: number
  showAnimationDuration?: number
  showEasing?: typeof Easing.ease
  hideOnPress?: boolean
  component?: React.ComponentType<any>
  componentProps?: Record<string, any>
  onPress?: () => void
  onHide?: () => void
}

export function showMessage({
  title,
  description,
  type = "info",
  duration = 5000, // 5 seconds
  showAnimationDuration = 400, // 0.4 seconds
  showEasing = Easing.ease,
  hideOnPress = true,
  component = NotifierComponents.Alert,
  componentProps,
  onPress,
}: ShowMessageProps) {
  return Notifier.showNotification({
    title,
    description,
    duration,
    showAnimationDuration,
    showEasing,
    hideOnPress,
    Component: component,
    componentProps: {
      alertType: type,
      ...componentProps,
    },
    onPress,
  })
}
