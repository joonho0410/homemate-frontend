import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import Checkbox from '@/components/Checkbox'
import TimeDropdown from '@/components/Dropdown/TimeDropdown'
import NotificationBell from '@/components/notification/NotificationBell'
import TabSafeScroll from '@/components/TabSafeScroll'
import { getRepeatKey, REPEAT_STYLE } from '@/constants/choreRepeatStyles'
import { useAuth } from '@/contexts/AuthContext'
import { registerFCMToken } from '@/libs/firebase/fcm'
import { useChoreByDate } from '@/libs/hooks/chore/useChoreByDate'
import { useChoreCalendar } from '@/libs/hooks/chore/useChoreCalendar'
import { usePatchChoreStatus } from '@/libs/hooks/chore/usePatchChoreStatus'
import { useFirstNotiStatus } from '@/libs/hooks/mypage/useFirstNotiStatus'
import { useFirstNotiTimeSetting } from '@/libs/hooks/mypage/useFirstNotiTimeSetting'
import { useMyPage } from '@/libs/hooks/mypage/useMyPage'
import { formatKoreanDate, getMonthRange, toYMD } from '@/libs/utils/date'
import { trackEvent } from '@/libs/utils/ga4'
import { styleFromRepeatColor, toRepeatLabel2 } from '@/libs/utils/repeat'
import { toHHmm, toHHmmParts } from '@/libs/utils/time'

import { getSteps, STORAGE_KEY } from '@/components/installGuide'
import HomeCalendar from '../../components/Calendar/HomeCalendar'

export default function HomeScreen() {
  const router = useRouter()
  const { token } = useAuth() // 토큰 준비 이후에만 초기화 로직 실행

  const androidTop = Platform.OS === 'android' ? 50 : 0

  // ----- 상태관리 -----
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [ampm, setAmpm] = useState<'오전' | '오후'>('오후')
  const [hour, setHour] = useState(7)
  const [minute, setMinute] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const todayStr = useMemo(() => {
    const t = new Date()
    return toYMD(t)
  }, [])

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [range, setRange] = useState(() => getMonthRange(selectedDate))

  // ----- api 훅 -----
  const { data: firstNotiStatus } = useFirstNotiStatus()
  const { mutateAsync: firstNotiTimeSetting } = useFirstNotiTimeSetting()

  const { data: dotDates = [] } = useChoreCalendar(range.start, range.end)
  const { data: choresData = [], isLoading, isError } = useChoreByDate(selectedDate)
  const choresList = choresData ?? []

  const { data: todayChores = [] } = useChoreByDate(todayStr)
  const { mutate: choreStatus } = usePatchChoreStatus(selectedDate)
  const { data: user } = useMyPage()

  // 이미 태깅한 상태임을 표시하기 위함
  const notiTrackedRef = useRef(false)

  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (!user?.id) return
    if (notiTrackedRef.current) return // 중복 방지

    // 현재 URL의 query string 읽기 -> ?from_push=1&task_type=category 만 읽어옴
    const search = window.location.search

    if (!search) return

    //URLSearchParams 로 파싱
    const params = new URLSearchParams(search)
    const fromPush = params.get('from_push')
    const taskType = params.get('task_type')

    if (fromPush === '1') {
      //ga4 태깅
      trackEvent('noti_open', {
        user_id: user.id,
        task_type: taskType ?? 'unknown',
      })

      notiTrackedRef.current = true

      //  URL 정리 (쿼리 제거)
      params.delete('from_push')
      params.delete('task_type')

      const newSearch = params.toString()
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash

      window.history.replaceState(null, '', newUrl)
    }
  }, [user?.id])

  // 첫 방문 시 웹앱 설치 안내 모달 표시
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const steps = getSteps()
    if (!steps?.length) return
    if (localStorage.getItem(STORAGE_KEY)) return
    router.replace({ pathname: '/(modals)/installGuide', params: { from: '/(tabs)/home' } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // iOS PWA 판별 함수
  const isIosPwa = () => {
    if (Platform.OS !== 'web') return
    if (typeof window === 'undefined') return

    const ua = window.navigator.userAgent || ''
    const isIos = /iPhone|iPad|iPod/i.test(ua)

    // 홈 화면에 추가된 PWA인지 확인
    const isStandalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      // 구형 iOS PWA용 (Safari standalone)
      (window.navigator as any).standalone === true

    return isIos && isStandalone
  }

  useEffect(() => {
    if (!token || !firstNotiStatus) return

    const { firstSetupCompleted, notificationTime } = firstNotiStatus

    if (!firstSetupCompleted) {
      const { ampm, hour12, minute } = toHHmmParts(notificationTime) // 알림 시간 기본값 셋팅

      setAmpm(ampm)
      setHour(hour12)
      setMinute(minute)
      setShowSetupModal(true)
    }
  }, [token, firstNotiStatus])

  // iOS PWA 환경인 경우에만 토큰 등록
  useEffect(() => {
    if (!isIosPwa()) return

    // 토큰 준비 안 됐을 경우 중단
    if (!token) return

    // 웹 알림 권한이 허용된 경우에만 토큰 등록
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      ;(async () => {
        try {
          await registerFCMToken(token)
        } catch (e) {
          console.error('iOS PWA 홈 진입 시 FCM 토큰 등록 실패: ', e)
        }
      })()
    }
  }, [token])

  // 최초 알림 설정 허용하기 버튼
  const handleAllowNotification = async () => {
    try {
      // 1. iOS PWA인 경우에만 웹 알림 권한 체크 + 요청
      if (isIosPwa()) {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const current = Notification.permission as NotificationPermission

          if (current === 'default') {
            // 아직 선택 안 한 상태 → 여기서 처음으로 시스템 팝업 띄움
            const result = await Notification.requestPermission()

            if (result !== 'granted') {
              alert(
                '알림 권한이 허용되지 않아 알림을 받을 수 없어요.\n' +
                  '언제든지 Safari 설정에서 다시 허용할 수 있어요.'
              )

              return
            }
          } else if (current === 'denied') {
            // 이미 한 번 거절한 상태

            alert(
              '현재 브라우저에서 알림이 차단되어 있어요.\n' +
                '설정 > Safari > 알림에서 권한을 허용해 주세요.'
            )
          }

          // 2. 권한이 허용된 상태에서만 FCM 토큰 등록 시도
          if (Notification.permission === 'granted') {
            await registerFCMToken(token ?? '')
          }
        }
      }

      const notificationTime = toHHmm(ampm, hour, minute)

      await firstNotiTimeSetting({ notificationTime })

      setShowSetupModal(false)
      alert('알림 설정이 완료되었습니다!')
      router.replace('/(tabs)/home')
    } catch (err) {
      console.error('최초 알림 설정 실패:', err)
    }
  }

  // 체크했을 때 GA4 이벤트 보내는 핸들러
  const handleToggleChore = (item: any) => {
    // 현재 상태 기준으로 완료 여부 체크
    const wasCompleted = item.status === 'COMPLETED'
    const nextCompleted = !wasCompleted

    // 먼저 서버에 상태 변경 호출
    choreStatus(item.id)

    // 완료로 바꿔는 순간에만 GA4 태깅
    if (nextCompleted) {
      trackEvent('task_completed', {
        user_id: user?.id,
        task_type: item.registrationType,
        title: item.titleSnapshot,
        cycle: toRepeatLabel2(item.repeatType, item.repeatInterval),
      })
    }
  }

  const progress = useMemo(() => {
    const total = todayChores.length
    if (!total) return 0
    const done = todayChores.filter((c) => c.status === 'COMPLETED').length
    return Math.round((done / total) * 100)
  }, [todayChores])

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F8FA" />
      <TabSafeScroll contentContainerStyle={{ paddingTop: androidTop }}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/images/logo/logo.svg')}
            style={{ width: 125, height: 24 }}
            resizeMode="contain"
          />
          <NotificationBell />
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.homeCard}>
            <View style={styles.rowBetween}>
              <View style={styles.colGap2}>
                <Text style={styles.helloTitle}>안녕하세요, {user?.nickname || '사용자'}님!</Text>
                <Text style={styles.baseText}>
                  오늘의 집안일을 <Text style={styles.progressNum}>{progress}%</Text> 완료했어요.
                </Text>
              </View>
              <Image
                source={require('../../assets/images/card/card-img.svg')}
                style={{ width: 70, height: 70 }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, borderRadius: 9999 }]} />
            </View>
          </View>

          <HomeCalendar
            onSelect={setSelectedDate}
            dotDates={dotDates}
            onMonthChangeRange={(start, end) => setRange({ start, end })}
          />

          <View style={styles.flex}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderTitle}>{formatKoreanDate(selectedDate)}</Text>
              <Text style={styles.listHeaderSub}>집안일</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/show-allChore',
                  })
                }
              >
                <Text>더보기</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listBox}>
              {isLoading && <Text>집안일 내역을 불러오는 중입니다.</Text>}
              {isError && <Text>집안일 내역 불러오기에 실패했습니다.</Text>}
              {!isLoading && !isError && choresList.length === 0 ? (
                <Text style={styles.itemTitle}>
                  {user?.nickname || '사용자'}님의 하루 집안일을 계획해보세요
                </Text>
              ) : (
                choresList.map((item, index) => {
                  const key = getRepeatKey(item.repeatType, item.repeatInterval)
                  const repeat = REPEAT_STYLE[key] ?? REPEAT_STYLE['NONE-0']

                  return (
                    <View
                      key={item.id}
                      style={[styles.itemRow, index !== choresList.length - 1 && styles.mb12]}
                    >
                      <View style={styles.itemLeftRow}>
                        <View
                          style={[
                            styles.badge,
                            styleFromRepeatColor(repeat.color),
                            item.status === 'COMPLETED'
                              ? styles.badgeDone
                              : styleFromRepeatColor(repeat.color),
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              item.status === 'COMPLETED'
                                ? styles.badgeDone
                                : styleFromRepeatColor(repeat.color),
                            ]}
                          >
                            {repeat.label}
                          </Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() =>
                            router.push({
                              pathname: '/add-chore',
                              params: {
                                mode: 'edit',
                                instanceId: String(item.id),
                                choreId: String(item.choreId),
                                selectedDate,
                              },
                            })
                          }
                        >
                          <Text
                            style={[
                              styles.itemTitle,
                              item.status === 'COMPLETED'
                                ? styles.itemTitleDone
                                : styles.itemTitleActive,
                            ]}
                          >
                            {item.titleSnapshot}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Checkbox
                        checked={item.status === 'COMPLETED'}
                        onChange={() => handleToggleChore(item)}
                        size={20}
                      />
                    </View>
                  )
                })
              )}
            </View>
          </View>
        </View>
      </TabSafeScroll>

      {/* 알림 최초 설정 모달 */}
      <Modal visible={showSetupModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'visible',
            }}
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>알림을 언제 보내드릴까요?</Text>
              <Text style={styles.modalDesc}>
                가입 시 한 번만 설정하면, {'\n'}
                새로운 일정도 자동으로 그 시간에 알려드려요.
              </Text>

              <TimeDropdown
                ampm={ampm}
                hour={hour}
                minute={minute}
                onChange={(v) => {
                  setAmpm(v.ampm)
                  setHour(v.hour)
                  setMinute(v.minute)
                }}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />

              <Text style={styles.modalDesc}>
                알림 설정 및 시간은 {'\n'}
                <Text style={styles.highlightText}>마이페이지</Text>에서 수정할 수 있어요.
              </Text>

              <TouchableOpacity onPress={handleAllowNotification} style={styles.allowBtn}>
                <Text style={styles.allowText}>알림 허용하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  flex: { flex: 1 },
  listHeaderRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 },
  listHeaderTitle: { fontSize: 18, fontWeight: '700' },
  listHeaderSub: { fontSize: 16 },
  listBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mb12: { marginBottom: 12 },
  itemLeftRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 23,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    textAlign: 'center',
  },

  badgeDone: { backgroundColor: '#CDCFD2', color: '#9B9FA6' },
  itemTitle: { fontSize: 14 },
  itemTitleActive: { color: '#000000' },
  itemTitleDone: { color: '#CDCFD2', textDecorationLine: 'line-through' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    overflow: 'visible',
    maxHeight: '80%',
    zIndex: 999,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalDesc: { fontSize: 14, textAlign: 'center', marginVertical: 24 },
  allowBtn: {
    backgroundColor: '#57C9D0',
    borderRadius: 12,
    paddingVertical: 15,
    width: '100%',
  },
  allowText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  highlightText: { color: '#46A1A6' },
})
