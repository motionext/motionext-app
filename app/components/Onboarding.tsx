import { useCallback, useRef, useEffect } from "react"
import { Dimensions, ViewStyle, ImageStyle, TextStyle, View, StatusBar } from "react-native"
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import Animated, {
  useAnimatedStyle,
  interpolate,
  useAnimatedScrollHandler,
  useSharedValue,
  Extrapolate,
} from "react-native-reanimated"
import { onboardingSteps } from "@/config/onboarding"
import { useAppTheme } from "@/utils/useAppTheme"
import { AutoImage } from "./AutoImage"
import { Text } from "@/components"
import type { ThemedStyle } from "@/theme"
import { storage } from "@/utils/storage"
import { translate, type TxKeyPath } from "@/i18n"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const AnimatedScrollView = Animated.createAnimatedComponent(Animated.ScrollView)

export interface OnboardingProps {
  isVisible: boolean
  onDismiss: () => void
}

const OnboardingDot = ({
  index,
  scrollX,
}: {
  index: number
  scrollX: Animated.SharedValue<number>
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ]
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP)
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP)
    const scale = interpolate(scrollX.value, inputRange, [1, 1.2, 1], Extrapolate.CLAMP)
    return { width, opacity, transform: [{ scale }] }
  })

  const { themed } = useAppTheme()
  return <Animated.View style={[themed($paginationDot), animatedStyle]} />
}

interface OnboardingStep {
  image: any
  titleTx: TxKeyPath
  descriptionTx: TxKeyPath
}

const OnboardingPage = ({
  page,
  index,
  scrollX,
}: {
  page: OnboardingStep
  index: number
  scrollX: Animated.SharedValue<number>
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ]
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolate.CLAMP)
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolate.CLAMP)
    return { transform: [{ scale }], opacity }
  })

  const { themed } = useAppTheme()
  return (
    <View style={$pageContainer}>
      <Animated.View style={[themed($contentWrapper), animatedStyle]}>
        {index === 0 ? (
          <>
            <Text preset="heading" style={themed($welcomeTitle)}>
              {translate("onboarding:overview.title")}
            </Text>
            <Text preset="subheading" tx={page.descriptionTx} style={themed($welcomeDescription)} />
          </>
        ) : (
          <>
            <AutoImage source={page.image} style={themed($image)} />
            <Text tx={page.titleTx} style={themed($title)} />
            <Text tx={page.descriptionTx} style={themed($description)} />
          </>
        )}
      </Animated.View>
    </View>
  )
}

export const Onboarding = ({ isVisible, onDismiss }: OnboardingProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const scrollX = useSharedValue(0)
  const { theme, themed } = useAppTheme()

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        storage.set("hasSeenOnboarding", "true")
        onDismiss()
      }
    },
    [onDismiss],
  )

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },
  })

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present()
    }
  }, [isVisible])

  return (
    <>
      <StatusBar translucent />

      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          onChange={handleSheetChanges}
          handleIndicatorStyle={themed($handle)}
          backgroundStyle={{
            backgroundColor: theme.colors.background,
          }}
        >
          <BottomSheetView style={themed($contentContainer)}>
            <AnimatedScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              decelerationRate="fast"
              style={themed($scrollView)}
            >
              {onboardingSteps.map((page, index) => (
                <OnboardingPage key={index} page={page} index={index} scrollX={scrollX} />
              ))}
            </AnimatedScrollView>
            <View style={themed($paginationContainer)}>
              {onboardingSteps.map((_, index) => (
                <OnboardingDot key={index} index={index} scrollX={scrollX} />
              ))}
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </>
  )
}

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  position: "relative",
})

const $scrollView: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $pageContainer: ViewStyle = {
  width: SCREEN_WIDTH,
  alignItems: "center",
  justifyContent: "center",
}

const $contentWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xl,
  paddingBottom: spacing.xxl * 2,
  width: "100%",
})

const $image: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  width: SCREEN_WIDTH * 0.6,
  height: SCREEN_WIDTH * 0.6,
  marginBottom: spacing.xl,
})

const $title: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontSize: 40,
  fontWeight: "bold",
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.md,
  lineHeight: 45,
})

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 18,
  color: colors.textDim,
  textAlign: "center",
  marginHorizontal: spacing.lg,
  lineHeight: 24,
  marginBottom: spacing.xs,
})

const $handle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 4,
  borderRadius: 4,
  backgroundColor: colors.tint,
  opacity: 0.5,
})

const $paginationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.lg,
  position: "absolute",
  bottom: spacing.xl,
  left: 0,
  right: 0,
})

const $paginationDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 8,
  borderRadius: 12,
  backgroundColor: colors.tint,
  marginHorizontal: 4,
  overflow: "hidden",
})

const $welcomeTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginVertical: spacing.md,
  fontSize: Math.min(48, SCREEN_WIDTH * 0.12),
  lineHeight: Math.min(56, SCREEN_WIDTH * 0.14),
  textAlign: "center",
})

const $welcomeDescription: ThemedStyle<TextStyle> = () => ({
  marginVertical: 20,
  fontSize: 20,
  lineHeight: 28,
  marginHorizontal: 20,
})
