import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useRef } from 'react'
import { Image, Platform, StyleSheet, View } from 'react-native'

import NotificationBell from '@/components/notification/NotificationBell'
import TabSafeScroll from '@/components/TabSafeScroll'
import { toYMD } from '@/libs/utils/date'
import { trackEvent } from '@/libs/utils/ga4'
import { useChoreByDate } from '@entities/chore'
import { useMyPage } from '@entities/user'
import { ChoreCalendarWidget } from '@widgets/chore-calendar'
import { FirstSetupModal } from '@widgets/notification-setup'

import ProgressCard from './ui/ProgressCard'

export default function HomeScreen() {
  const androidTop = Platform.OS === 'android' ? 50 : 0

  const todayStr = useMemo(() => {
    const t = new Date()
    return toYMD(t)
  }, [])

  const { data: todayChores = [] } = useChoreByDate(todayStr)
  const { data: user } = useMyPage()

  // 이미 태깅한 상태임을 표시하기 위함
  const notiTrackedRef = useRef(false)

  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (!user?.id) return
    if (notiTrackedRef.current) return

    const search = window.location.search

    if (!search) return

    const params = new URLSearchParams(search)
    const fromPush = params.get('from_push')
    const taskType = params.get('task_type')

    if (fromPush === '1') {
      trackEvent('noti_open', {
        user_id: user.id,
        task_type: taskType ?? 'unknown',
      })

      notiTrackedRef.current = true

      params.delete('from_push')
      params.delete('task_type')

      const newSearch = params.toString()
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash

      window.history.replaceState(null, '', newUrl)
    }
  }, [user?.id])

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F8FA" />
      <TabSafeScroll contentContainerStyle={{ paddingTop: androidTop }}>
        <View style={styles.headerRow}>
          <Image
            source={require('@/assets/images/logo/logo.png')}
            style={{ width: 125, height: 24 }}
            resizeMode="contain"
          />
          <NotificationBell />
        </View>

        <View style={styles.contentWrap}>
          <ProgressCard chores={todayChores} userName={user?.nickname} />
          <ChoreCalendarWidget />
        </View>
      </TabSafeScroll>

      <FirstSetupModal />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FA' },
  headerRow: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 38,
  },
  contentWrap: { flexDirection: 'column', gap: 16 },
})
