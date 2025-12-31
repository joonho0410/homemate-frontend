import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import useRandomChores from '@/libs/hooks/recommend/useRandomChores'

interface RecommendChipsProps {
  onSelectChore: (choreId: number) => void
}

export default function RecommendChips({ onSelectChore }: RecommendChipsProps) {
  const { data: randomChores = [], isLoading, isRefetching, refetch } = useRandomChores()

  if (isLoading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      {(randomChores ?? []).map((item: any) => (
        <Pressable key={item.id} style={styles.chip} onPress={() => onSelectChore(item.id)}>
          <Text style={styles.chipText}>{item.titleKo}</Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.resetBtn}
        onPress={() => refetch()}
        disabled={isRefetching || isLoading}
      >
        <View style={styles.resetContent}>
          <Image
            source={require('@/assets/images/icon/refresh.png')}
            style={{ width: 16, height: 16 }}
            resizeMode="contain"
          />
          <Text style={styles.resetBtnText}>새로고침하기</Text>
        </View>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingRow: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    backgroundColor: '#F8F8FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 14,
    color: '#1E2025',
  },
  resetBtn: {
    backgroundColor: '#F8F8FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetBtnText: {
    fontSize: 14,
    color: '#686F79',
  },
})
