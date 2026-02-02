import { ReactNode } from 'react'
import { ScrollView, StyleSheet, ViewStyle } from 'react-native'

type Props = {
  children: ReactNode
  gap?: number
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  contentContainerStyle?: ViewStyle
  showsHorizontalScrollIndicator?: boolean
}

export default function HorizontalSlideContainer({
  children,
  gap = 0,
  padding,
  paddingHorizontal,
  paddingVertical,
  contentContainerStyle,
  showsHorizontalScrollIndicator = false,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      style={styles.scrollView}
      contentContainerStyle={[
        styles.contentContainer,
        {
          gap,
          padding,
          paddingHorizontal,
          paddingVertical,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
