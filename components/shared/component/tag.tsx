import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

export type TagProps = {
  text: string
  textColor?: string
  backgroundColor?: string
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  borderRadius?: number
  minWidth?: number
  height?: number
  fontSize?: number
  fontWeight?: TextStyle['fontWeight']
  style?: ViewStyle
  textStyle?: TextStyle
  isActive?: boolean
  activeStyle?: ViewStyle
}

export default function Tag({
  text,
  textColor = '#000000',
  backgroundColor = '#F0F0F0',
  padding,
  paddingHorizontal,
  paddingVertical,
  borderRadius = 6,
  minWidth = 42,
  height = 23,
  fontSize = 12,
  fontWeight = '400',
  style,
  textStyle,
  isActive = false,
  activeStyle,
}: TagProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          padding,
          paddingHorizontal,
          paddingVertical,
          borderRadius,
          minWidth,
          height,
        },
        style,
        isActive && activeStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize,
            fontWeight,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
})
