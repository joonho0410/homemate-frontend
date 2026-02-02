import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type FilterRowProps = {
  label: string
  children: ReactNode
}

export default function FilterRow({ label, children }: FilterRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.filterWrapper}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#686F79',
    minWidth: 24,
    minHeight: 21,
    lineHeight: 21,
  },
  filterWrapper: {
    flex: 1,
  },
})
