import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { useMyPage } from '@/libs/hooks/mypage/useMyPage'
import { toRepeatLabel } from '@/libs/utils/repeat'

import type { responseChoreDetail, ResponseChore } from '@/types/chore'
import {
  apiToFormValues,
  choreDataToFormValues,
  ChoreFormData,
  choreFormSchema,
  getDefaultValues,
} from '../schemas/choreFormSchema'
import type { ChoreMode } from '../types'

interface UseChoreFormParams {
  mode: ChoreMode
  instanceDetail?: responseChoreDetail | null
  routineDetail?: ResponseChore['data'] | null
  selectedDate?: string
}

/**
 * 집안일 폼 초기화 및 유효성 검사만 담당하는 단순화된 훅
 * - 비즈니스 로직(submit, delete 등)은 Container에서 처리
 */
export function useChoreForm({
  mode,
  instanceDetail,
  routineDetail,
  selectedDate,
}: UseChoreFormParams) {
  const { data: user } = useMyPage()

  // Form 초기값 계산
  const initialValues = useMemo(() => {
    if (mode === 'edit-instance' && instanceDetail) {
      return apiToFormValues(instanceDetail)
    }
    if (mode === 'edit-routine' && routineDetail) {
      return choreDataToFormValues(routineDetail)
    }
    return getDefaultValues(selectedDate, user?.notificationTime)
  }, [mode, instanceDetail, routineDetail, selectedDate, user?.notificationTime])

  // React Hook Form 초기화
  const form = useForm<ChoreFormData>({
    resolver: zodResolver(choreFormSchema) as any,
    mode: 'onChange',
    defaultValues: initialValues,
  })

  const { reset } = form

  // 비동기 데이터 로드 후 form reset
  useEffect(() => {
    if (mode === 'edit-instance' && instanceDetail) {
      reset(apiToFormValues(instanceDetail))
    }
  }, [mode, instanceDetail, reset])

  useEffect(() => {
    if (mode === 'edit-routine' && routineDetail) {
      reset(choreDataToFormValues(routineDetail))
    }
  }, [mode, routineDetail, reset])

  const {
    formState: { isValid, isDirty },
  } = form

  // 원본 데이터 기준 반복 여부 (UpdateModal 표시 결정)
  const isRepeating = useMemo(() => {
    if (mode === 'edit-instance' && instanceDetail) {
      return (instanceDetail.repeatType ?? 'NONE') !== 'NONE'
    }
    if (mode === 'edit-routine' && routineDetail) {
      return (routineDetail.repeatType ?? 'NONE') !== 'NONE'
    }
    return false
  }, [mode, instanceDetail, routineDetail])

  // 원본 repeat 값 (analytics용)
  const originalRepeat = useMemo(() => {
    if (mode === 'edit-instance' && instanceDetail) {
      return toRepeatLabel(instanceDetail.repeatType, instanceDetail.repeatInterval) ?? ''
    }
    if (mode === 'edit-routine' && routineDetail) {
      return toRepeatLabel(routineDetail.repeatType, routineDetail.repeatInterval) ?? ''
    }
    return ''
  }, [mode, instanceDetail, routineDetail])

  // canSubmit: add 모드는 isValid만, edit 모드는 isDirty도 필요
  const canSubmit = isValid && (mode === 'add' || isDirty)

  return {
    form,
    isValid,
    isDirty,
    canSubmit,
    isRepeating,
    originalRepeat,
    userNotificationTime: user?.notificationTime,
    userId: user?.id,
  }
}
