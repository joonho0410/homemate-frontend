import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

export default function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>집안일을 불러오는 중...</Text>
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
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
})
