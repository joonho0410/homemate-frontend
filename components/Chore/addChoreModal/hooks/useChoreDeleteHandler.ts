import { useCallback } from 'react'

import { toApiError } from '@/libs/api/error'
import { useDeleteChore } from '@/libs/hooks/chore/useDeleteChore'
import { useDeleteChoreByChoreId } from '@/libs/hooks/chore/useDeleteChoreByChoreId'

import { trackChoreDeleted } from '../utils/analytics'
import type { ChoreMode } from '../types'

interface UseChoreDeleteParams {
  mode: ChoreMode
  instanceId?: number
  choreId?: number
  selectedDate?: string
  userId?: number
  closeModal: () => void
}

/**
 * Delete 로직을 추출한 커스텀 훅
 * - mode별 분기 처리
 * - edit-routine: choreId 기준 삭제 (deleteChoreByChoreId)
 * - edit-instance: instanceId 기준 삭제 (deleteChore)
 * - analytics 트래킹
 * - success/error 콜백 처리
 */
export function useChoreDeleteHandler({
  mode,
  instanceId,
  choreId,
  selectedDate,
  userId,
  closeModal,
}: UseChoreDeleteParams) {
  const { mutate: deleteChore, isPending: deletingInstance } = useDeleteChore()
  const { mutate: deleteChoreByChoreId, isPending: deletingRoutine } = useDeleteChoreByChoreId()

  const handleDelete = useCallback(
    (shouldApplyToAfter: boolean) => {
      // edit-routine 모드: choreId 기준 삭제
      // - applyToAfter=true: 전체 삭제
      // - applyToAfter=false: 단일 삭제
      if (mode === 'edit-routine') {
        if (!choreId) {
          console.warn('[edit-routine delete] choreId가 없습니다.')
          return
        }

        deleteChoreByChoreId(
          { choreId, applyToAfter: shouldApplyToAfter },
          {
            onSuccess: () => {
              trackChoreDeleted({ user_id: userId })
              closeModal()
            },
            onError: (error) => {
              const { code, message, details } = toApiError(error)
              console.warn('[deleteChoreByChoreId error]', code, details?.[0]?.message ?? message)
            },
          }
        )
        return
      }

      // edit-instance 모드: instanceId 기준 단일 삭제
      if (!instanceId || !selectedDate) {
        console.warn('[edit-instance delete] instanceId 또는 selectedDate가 없습니다.')
        return
      }

      deleteChore(
        { choreInstanceId: instanceId, selectedDate, applyToAfter: false },
        {
          onSuccess: () => {
            trackChoreDeleted({ user_id: userId })
            closeModal()
          },
          onError: (error) => {
            const { code, message, details } = toApiError(error)
            console.warn('[deleteChore error]', code, details?.[0]?.message ?? message)
          },
        }
      )
    },
    [mode, choreId, instanceId, selectedDate, deleteChore, deleteChoreByChoreId, userId, closeModal]
  )

  return {
    handleDelete,
    deleting: deletingInstance || deletingRoutine,
  }
}
