import { useState, useCallback, useEffect } from "react"
import { Keyboard, KeyboardEvent, Platform } from "react-native"

export const useKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const handleKeyboardShow = useCallback((event: KeyboardEvent) => {
    setKeyboardHeight(event.endCoordinates.height)
    setIsKeyboardVisible(true)
  }, [])

  const handleKeyboardHide = useCallback(() => {
    setKeyboardHeight(0)
    setIsKeyboardVisible(false)
  }, [])

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

    const showListener = Keyboard.addListener(showEvent, handleKeyboardShow)
    const hideListener = Keyboard.addListener(hideEvent, handleKeyboardHide)

    return () => {
      showListener.remove()
      hideListener.remove()
    }
  }, [handleKeyboardShow, handleKeyboardHide])

  return { isKeyboardVisible, keyboardHeight }
}
