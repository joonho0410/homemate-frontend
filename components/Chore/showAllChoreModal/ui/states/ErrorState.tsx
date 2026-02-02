import { StyleSheet, Text, View } from 'react-native'

export default function ErrorState() {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>집안일을 불러오는데 실패했습니다</Text>
      <Text style={styles.errorSubText}>잠시 후 다시 시도해주세요</Text>
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
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
})
