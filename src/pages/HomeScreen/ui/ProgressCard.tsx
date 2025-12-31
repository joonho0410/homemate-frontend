import { useMemo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

interface ProgressCardProps {
  chores: any[]
  userName?: string
}

export default function ProgressCard({ chores, userName }: ProgressCardProps) {
  const progress = useMemo(() => {
    const total = chores.length
    if (!total) return 0
    const done = chores.filter((c) => c.status === 'COMPLETED').length
    return Math.round((done / total) * 100)
  }, [chores])

  return (
    <View style={styles.homeCard}>
      <View style={styles.rowBetween}>
        <View style={styles.colGap2}>
          <Text style={styles.helloTitle}>안녕하세요, {userName || '사용자'}님!</Text>
          <Text style={styles.baseText}>
            오늘의 집안일을 <Text style={styles.progressNum}>{progress}%</Text> 완료했어요.
          </Text>
        </View>
        <Image
          source={require('@/assets/images/card/card-img.png')}
          style={{ width: 70, height: 70 }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%`, borderRadius: 9999 }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  homeCard: {
    backgroundColor: '#DDF4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  colGap2: { flexDirection: 'column', gap: 8 },
  helloTitle: { fontWeight: '600', fontSize: 18 },
  baseText: { fontSize: 14 },
  progressNum: { fontWeight: '700', color: '#46A1A6' },
  progressBar: {
    marginTop: 12,
    marginBottom: 8,
    height: 6,
    width: '100%',
    borderRadius: 9999,
    backgroundColor: '#F5FCFC',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#57C9D0' },
})
