import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import TimeDropdown from '@/components/Dropdown/TimeDropdown'
import { useAuth } from '@/contexts/AuthContext'
import { registerFCMToken } from '@/libs/firebase/fcm'
import { toHHmm, toHHmmParts } from '@/libs/utils/time'
import { useFirstNotiStatus, useFirstNotiTimeSetting } from '@entities/notification'

// iOS PWA 판별 함수
const isIosPwa = () => {
  if (Platform.OS !== 'web') return
  if (typeof window === 'undefined') return

  const ua = window.navigator.userAgent || ''
  const isIos = /iPhone|iPad|iPod/i.test(ua)

  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator as any).standalone === true

  return isIos && isStandalone
}

export default function FirstSetupModal() {
  const router = useRouter()
  const { token } = useAuth()

  const [showSetupModal, setShowSetupModal] = useState(false)
  const [ampm, setAmpm] = useState<'오전' | '오후'>('오후')
  const [hour, setHour] = useState(7)
  const [minute, setMinute] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const { data: firstNotiStatus } = useFirstNotiStatus()
  const { mutateAsync: firstNotiTimeSetting } = useFirstNotiTimeSetting()

  useEffect(() => {
    if (!token || !firstNotiStatus) return

    const { firstSetupCompleted, notificationTime } = firstNotiStatus

    if (!firstSetupCompleted) {
      const { ampm, hour12, minute } = toHHmmParts(notificationTime)

      setAmpm(ampm)
      setHour(hour12)
      setMinute(minute)
      setShowSetupModal(true)
    }
  }, [token, firstNotiStatus])

  // iOS PWA 환경인 경우에만 토큰 등록
  useEffect(() => {
    if (!isIosPwa()) return
    if (!token) return

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

  const handleAllowNotification = async () => {
    try {
      // 1. iOS PWA인 경우에만 웹 알림 권한 체크 + 요청
      if (isIosPwa()) {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const current = Notification.permission as NotificationPermission

          if (current === 'default') {
            const result = await Notification.requestPermission()

            if (result !== 'granted') {
              alert(
                '알림 권한이 허용되지 않아 알림을 받을 수 없어요.\n' +
                  '언제든지 Safari 설정에서 다시 허용할 수 있어요.'
              )

              return
            }
          } else if (current === 'denied') {
            alert(
              '현재 브라우저에서 알림이 차단되어 있어요.\n' +
                '설정 > Safari > 알림에서 권한을 허용해 주세요.'
            )
          }

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

  return (
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
  )
}

const styles = StyleSheet.create({
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
