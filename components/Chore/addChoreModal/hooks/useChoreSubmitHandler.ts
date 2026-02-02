import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'

import { toApiError } from '@/libs/api/error'
import useCreateChore from '@/libs/hooks/chore/useCreateChore'
import useUpdateChore from '@/libs/hooks/chore/useUpdateChore'
import { toYMD } from '@/libs/utils/date'
import { toRepeatFields } from '@/libs/utils/repeat'
import { toSpaceApi } from '@/libs/utils/space'
import { toHHmm } from '@/libs/utils/time'

import type { ChoreFormData } from '../schemas/choreFormSchema'
import type { ChoreMode } from '../types'
import { handleBadgeAndMission } from '../utils/achievementHelpers'
import { trackChoreCreated, trackChoreUpdated } from '../utils/analytics'

interface UseChoreSubmitParams {
  mode: ChoreMode
  instanceId?: number
  choreId?: number
  originalRepeat: string
  fromRecommendChip: boolean
  userId?: number
  closeModal: () => void
}

/**
 * Submit 로직을 추출한 커스텀 훅
 * - payload 생성
 * - mode별 mutation 호출
 * - analytics 트래킹
 * - success/error 콜백 처리
 */
export function useChoreSubmitHandler({
  mode,
  instanceId,
  choreId,
  originalRepeat,
  fromRecommendChip,
  userId,
  closeModal,
}: UseChoreSubmitParams) {
  const dispatch = useDispatch()
  const qc = useQueryClient()
  const { mutate: createChore, isPending: creating } = useCreateChore()
  const { mutate: updateChore, isPending: updating } = useUpdateChore()
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false)

  /**
   * Form 데이터를 API payload로 변환
   */
  const buildPayload = useCallback((data: ChoreFormData) => {
    const todayYMD = toYMD(new Date())
    const hhmm = toHHmm(data.ampm, data.hour12, data.minute)
    const baseDate = data.startDate ?? todayYMD

    if (!data.repeat) return null

    const { repeatType, repeatInterval } = toRepeatFields(data.repeat)
    const spaceApi = toSpaceApi(data.space)
    if (!spaceApi) return null

    return {
      title: data.title.trim(),
      notificationYn: data.notifyOn,
      notificationTime: hhmm,
      space: spaceApi,
      repeatType,
      repeatInterval,
      startDate: baseDate,
      endDate: data.endDate ?? baseDate,
      recommendYn: false,
    }
  }, [])

  /**
   * ADD 모드 처리
   */
  const handleAdd = useCallback(
    (data: ChoreFormData, payload: ReturnType<typeof buildPayload>) => {
      if (!payload) return

      const taskSource = fromRecommendChip ? 'RECOMMEND' : 'MANUAL'

      trackChoreCreated({
        user_id: userId,
        task_type: taskSource,
        title: data.title.trim(),
        cycle: data.repeat!,
        reco_btn_click: fromRecommendChip,
      })

      setIsLocalSubmitting(true)
      createChore(payload, {
        onSuccess: async (resp) => {
          closeModal()
          await handleBadgeAndMission(resp, dispatch, qc)
        },
        onError: (error) => {
          const { code, message, details } = toApiError(error)
          console.warn('[createChore error]', code, details?.[0]?.message ?? message)
        },
        onSettled: () => {
          setIsLocalSubmitting(false)
        },
      })
    },
    [createChore, closeModal, dispatch, qc, fromRecommendChip, userId]
  )

  /**
   * EDIT-ROUTINE 모드 처리 (루틴 전체 수정)
   */
  const handleEditRoutine = useCallback(
    (data: ChoreFormData, payload: ReturnType<typeof buildPayload>) => {
      if (!payload || !choreId) {
        console.warn('[edit-routine] choreId가 없습니다.')
        return
      }

      updateChore(
        {
          choreInstanceId: choreId,
          dto: {
            ...payload,
            applyToAfter: true, // 항상 전체 적용
          },
        },
        {
          onSuccess: () => {
            trackChoreUpdated({
              user_id: userId,
              title: data.title.trim(),
              task_type: 'MANUAL',
              before_cycle: originalRepeat,
              after_cycle: data.repeat ?? '',
              reco_btn_click: false,
              cycle_changed: originalRepeat !== (data.repeat ?? ''),
            })
            closeModal()
          },
          onError: (error) => {
            const { code, message, details } = toApiError(error)
            console.warn('[updateChore error]', code, details?.[0]?.message ?? message)
          },
        }
      )
    },
    [updateChore, choreId, closeModal, userId, originalRepeat]
  )

  /**
   * EDIT-INSTANCE 모드 처리
   */
  const handleEditInstance = useCallback(
    (data: ChoreFormData, payload: ReturnType<typeof buildPayload>, applyToAfter: boolean) => {
      if (!payload || !instanceId) {
        console.warn('[edit-instance] instanceId가 없습니다.')
        return
      }

      updateChore(
        {
          choreInstanceId: instanceId,
          dto: {
            ...payload,
            applyToAfter,
          },
        },
        {
          onSuccess: () => {
            const afterCycle = data.repeat ?? ''

            trackChoreUpdated({
              user_id: userId,
              title: data.title.trim(),
              task_type: fromRecommendChip ? 'RECOMMEND' : 'MANUAL',
              before_cycle: originalRepeat,
              after_cycle: afterCycle,
              reco_btn_click: fromRecommendChip,
              cycle_changed: originalRepeat !== afterCycle,
            })
            closeModal()
          },
          onError: (error) => {
            const { code, message, details } = toApiError(error)
            console.warn('[updateChore error]', code, details?.[0]?.message ?? message)
          },
        }
      )
    },
    [updateChore, instanceId, closeModal, originalRepeat, fromRecommendChip, userId]
  )

  /**
   * 메인 submit 함수
   */
  const submitChore = useCallback(
    (data: ChoreFormData, applyToAfter?: boolean) => {
      const payload = buildPayload(data)
      if (!payload) return

      if (mode === 'add') {
        handleAdd(data, payload)
      } else if (mode === 'edit-routine') {
        handleEditRoutine(data, payload)
      } else {
        handleEditInstance(data, payload, Boolean(applyToAfter))
      }
    },
    [mode, buildPayload, handleAdd, handleEditRoutine, handleEditInstance]
  )

  return {
    submitChore,
    isSubmitting: creating || updating || isLocalSubmitting,
  }
}
