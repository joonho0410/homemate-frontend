import { StyleSheet, Text, View } from 'react-native'

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>해당하는 집안일이 없어요</Text>
      <Text style={styles.emptySubText}>다른 카테고리를 선택해보세요</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
})
