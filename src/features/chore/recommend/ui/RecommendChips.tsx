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
    paddingVertical: 12,
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: '#DDF4F6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
    marginBottom: 12,
  },
  chipText: {
    color: '#46A1A6',
    fontSize: 12,
    fontWeight: 600 as any,
  },
  resetBtn: {
    backgroundColor: '#79D4D9',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
    marginBottom: 12,
  },
  resetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: 600 as any,
    color: 'white',
    paddingLeft: 10,
  },
})
