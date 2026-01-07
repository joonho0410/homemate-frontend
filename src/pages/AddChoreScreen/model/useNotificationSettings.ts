import { useEffect, useMemo, useState } from 'react'

import { toHHmm, toHHmmParts } from '@/libs/utils/time'
import { responseChoreDetail } from '@/types/chore'

import { NotificationSettings } from './types'

interface UseNotificationSettingsParams {
  userDefaultTime?: string
  detail?: responseChoreDetail
  isEdit: boolean
}

const toBool = (v: unknown) => v === true || v === 'Y' || v === 'y' || v === 1 || v === '1'

export function useNotificationSettings(params: UseNotificationSettingsParams) {
  const { userDefaultTime, detail, isEdit } = params

  // 사용자 기본 알림 시간 파싱
  const userNoti = useMemo(
    () => toHHmmParts(userDefaultTime), // "18:00" 같은 문자열 → { ampm, hour12, minute }
    [userDefaultTime]
  )

  // 알림 설정 상태
  const [enabled, setEnabled] = useState(false)
  const [ampm, setAmpm] = useState<'오전' | '오후'>(userNoti.ampm)
  const [hour12, setHour12] = useState<number>(userNoti.hour12)
  const [minute, setMinute] = useState<number>(userNoti.minute)

  // EDIT 모드에서 초기값 설정
  useEffect(() => {
    if (!isEdit || !detail) return
    setEnabled(toBool(detail.notificationYn))

    const parts = toHHmmParts(detail.notificationTime ?? '09:00')
    setAmpm(parts.ampm)
    setHour12(parts.hour12)
    setMinute(parts.minute)
  }, [isEdit, detail])

  // 추천 집안일에서 알림 설정 적용
  const applyRecommendation = (choreEnabled: boolean) => {
    if (choreEnabled) {
      setEnabled(true)
      setAmpm(userNoti.ampm)
      setHour12(userNoti.hour12)
      setMinute(userNoti.minute)
    } else {
      setEnabled(false)
    }
  }

  // 시간 설정
  const setTime = (params: { ampm: '오전' | '오후'; hour: number; minute: number }) => {
    setAmpm(params.ampm)
    setHour12(params.hour)
    setMinute(params.minute)
  }

  // 포맷된 시간 가져오기 (HH:mm 형식)
  const getFormattedTime = () => toHHmm(ampm, hour12, minute)

  // 알림 설정 객체
  const settings: NotificationSettings = {
    enabled,
    ampm,
    hour12,
    minute,
  }

  return {
    settings,
    setEnabled,
    setTime,
    getFormattedTime,
    applyRecommendation,
  }
}
