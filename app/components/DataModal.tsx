import { FC } from "react"
import { Modal, View, FlatList, TouchableOpacity, ViewStyle, TextStyle } from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import { BlurView } from "expo-blur"

import { useAppTheme } from "@/utils/useAppTheme"
import { Icon, Text } from "@/components"
import { ThemedStyle } from "@/theme"
import { translate } from "@/i18n"

interface DataModalProps {
  visible: boolean
  data: string
  onClose: () => void
  title?: string
  emptyText?: string
}

interface DataItem {
  id: string
  key: string
  value: string
}

export const DataModal: FC<DataModalProps> = ({
  visible,
  data,
  onClose,
  title = "",
  emptyText = translate("emptyStateComponent:generic.heading"),
}) => {
  const { themed, theme } = useAppTheme()

  // Transform the data into a more structured format
  const dataArray: DataItem[] = data
    .split("\n")
    .filter((item) => item.trim() !== "")
    .map((item, index) => {
      const [key, value] = item.split(": ").map((part) => part.trim())
      return {
        id: `${index}`,
        key: key || "Unknown",
        value: value || item,
      }
    })

  const renderItem = ({ item, index }: { item: DataItem; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)} style={themed($itemContainer)}>
      <View style={themed($keyContainer)}>
        <Text style={themed($keyText)}>{item.key}</Text>
      </View>
      <View style={themed($valueContainer)}>
        <Text style={themed($valueText)}>{item.value}</Text>
      </View>
    </Animated.View>
  )

  const renderEmptyState = () => (
    <View style={themed($emptyContainer)}>
      <Icon icon="warning" size={48} color={theme.colors.palette.neutral500} />
      <Text style={themed($emptyText)}>{emptyText}</Text>
    </View>
  )

  return (
    <Modal visible={visible} transparent animationType="none">
      <BlurView intensity={20} style={themed($overlay)}>
        <Animated.View entering={FadeIn.duration(200)} style={themed($container)}>
          <View style={themed($header)}>
            <Text style={themed($title)}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={themed($closeButton)}>
              <Icon icon="x" size={24} color={theme.colors.palette.neutral800} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={dataArray}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={themed($listContent)}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={themed($separator)} />}
          />
        </Animated.View>
      </BlurView>
    </Modal>
  )
}

const $overlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "90%",
  maxHeight: "75%",
  backgroundColor: colors.background,
  borderRadius: 24,
  overflow: "hidden",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.4,
  shadowRadius: 30,
  elevation: 15,
})

const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
  backgroundColor: colors.background,
})

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "bold",
  color: colors.palette.primary500,
})

const $closeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
})

const $itemContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginVertical: spacing.xs,
  borderRadius: 12,
  backgroundColor: colors.background,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
})

const $keyContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary100,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
})

const $keyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "bold",
  color: colors.palette.primary500,
})

const $valueContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral100,
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
})

const $valueText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  color: colors.text,
})

const $separator: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: spacing.sm,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.xl,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  fontSize: 16,
  color: colors.palette.neutral500,
  textAlign: "center",
})
