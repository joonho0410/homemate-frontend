import { useMemo } from 'react'

import { isDateCompare } from '@/libs/utils/date'
import { toHHmm, toHHmmParts } from '@/libs/utils/time'
import { toRepeatLabel } from '@/libs/utils/repeat'
import { toSpaceUi } from '@/libs/utils/space'
import { responseChoreDetail } from '@/types/chore'

import { ChoreFormData, NotificationSettings } from './types'

interface UseChoreFormValidationParams {
  formData: ChoreFormData
  notification: NotificationSettings
  isEdit: boolean
  detail?: responseChoreDetail
  isLoading: boolean
}

// 이모지(특수문자) 불가
const EMOJI_RE = /[\p{Extended_Pictographic}]/u
const toBool = (v: unknown) => v === true || v === 'Y' || v === 'y' || v === 1 || v === '1'

export function useChoreFormValidation(params: UseChoreFormValidationParams) {
  const { formData, notification, isEdit, detail, isLoading } = params

  // 이모지 검사
  const hasForbiddenChar = useMemo(() => EMOJI_RE.test(formData.title), [formData.title])

  // 날짜 범위 유효성
  const isDateRangeValid = isDateCompare(formData.startDate, formData.endDate)

  // 기본 유효성 검사
  const isFormValid = useMemo(() => {
    return (
      !hasForbiddenChar &&
      Boolean(formData.title.trim()) &&
      Boolean(formData.space) &&
      Boolean(formData.repeat) &&
      Boolean(formData.startDate) &&
      isDateRangeValid &&
      (!notification.enabled ||
        (notification.ampm && notification.hour12 && notification.minute >= 0))
    )
  }, [hasForbiddenChar, formData, notification, isDateRangeValid])

  // EDIT 모드에서 초기값 계산
  const initialValue = useMemo(() => {
    if (!isEdit || !detail) return undefined
    const parts = toHHmmParts(detail.notificationTime ?? '09:00')
    return {
      title: (detail.title ?? '').trim(),
      notificationYn: toBool(detail.notificationYn),
      notificationTime: toHHmm(parts.ampm, parts.hour12, parts.minute),
      space: toSpaceUi(detail.space) ?? null,
      repeat: toRepeatLabel(detail.repeatType, detail.repeatInterval),
      startDate: detail.startDate ?? null,
      endDate: detail.endDate ?? detail.startDate ?? null,
    }
  }, [isEdit, detail])

  // EDIT 모드에서 현재값 계산
  const currentValue = useMemo(() => {
    const hhmm = toHHmm(notification.ampm, notification.hour12, notification.minute)
    return {
      title: formData.title.trim(),
      notificationYn: notification.enabled,
      notificationTime: hhmm,
      space: formData.space,
      repeat: formData.repeat,
      startDate: formData.startDate,
      endDate: formData.endDate ?? formData.startDate,
    }
  }, [formData, notification])

  // 변경 여부 검사
  const isChanged = useMemo(() => {
    if (!isEdit) return true
    if (!initialValue) return false

    const same = (a: any, b: any) => String(a ?? '') === String(b ?? '')

    if (!same(initialValue.title, currentValue.title)) return true
    if (initialValue.notificationYn !== currentValue.notificationYn) return true

    if (currentValue.notificationYn) {
      if (!same(initialValue.notificationTime, currentValue.notificationTime)) return true
    }

    if (!same(initialValue.space, currentValue.space)) return true
    if (!same(initialValue.repeat, currentValue.repeat)) return true

    const initStart = initialValue.startDate ?? null
    const currStart = currentValue.startDate ?? null
    const initEnd = initialValue.endDate ?? initialValue.startDate ?? null
    const currEnd = currentValue.endDate ?? currentValue.startDate ?? null

    if (!same(initStart, currStart)) return true
    if (!same(initEnd, currEnd)) return true

    return false
  }, [isEdit, initialValue, currentValue])

  // 제출 가능 여부
  const canSubmit = isFormValid && (!isEdit || isChanged)

  return {
    hasForbiddenChar,
    isDateRangeValid,
    isFormValid,
    canSubmit,
    isChanged,
    initialValue,
    currentValue,
  }
}
