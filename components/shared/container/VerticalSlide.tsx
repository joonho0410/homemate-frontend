import { ReactNode } from 'react'
import { ScrollView, StyleSheet, ViewStyle } from 'react-native'

type Props = {
  children: ReactNode
  gap?: number
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  contentContainerStyle?: ViewStyle
  showsVerticalScrollIndicator?: boolean
}

export default function VerticalSlideContainer({
  children,
  gap = 0,
  padding,
  paddingHorizontal,
  paddingVertical,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
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
    flexDirection: 'column',
    alignItems: 'center',
  },
})
