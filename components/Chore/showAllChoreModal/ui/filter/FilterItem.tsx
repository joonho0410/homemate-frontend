import { Pressable, StyleSheet, Text, View } from 'react-native'

type FilterItemProps = {
  label: string
  isActive: boolean
  onPress: () => void
}

export default function FilterItem({ label, isActive, onPress }: FilterItemProps) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.tag, isActive && styles.activeTag]}>
        <Text style={[styles.text, isActive && styles.activeText]}>{label}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tag: {
    width: 42,
    height: 23,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E6E7E9',
  },
  activeTag: {
    backgroundColor: '#79D4D9',
    borderWidth: 0,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#9B9FA6',
  },
  activeText: {
    color: '#FFFFFF',
  },
})
