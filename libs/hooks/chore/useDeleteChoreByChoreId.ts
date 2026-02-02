import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteChoreByChoreId } from '@/libs/api/chore/deleteChoreByChoreId'

type DeleteByChoreIdParams = {
  choreId: number
  applyToAfter?: boolean
}

/**
 * choreId 기준으로 집안일 삭제하는 mutation hook
 * - edit-routine 모드에서 사용
 */
export function useDeleteChoreByChoreId() {
  const qc = useQueryClient()

  return useMutation<void, unknown, DeleteByChoreIdParams>({
    mutationFn: ({ choreId, applyToAfter = true }) =>
      deleteChoreByChoreId(choreId, applyToAfter),

    onSuccess: (_data, { choreId }) => {
      // 해당 날짜 리스트 새로고침
      qc.invalidateQueries({ queryKey: ['chore', 'byDate'], exact: false })

      // 캘린더 새로고침
      qc.invalidateQueries({ queryKey: ['chore', 'calendar'] })

      // choreId 관련 캐시 무효화
      qc.invalidateQueries({ queryKey: ['chore', 'idDetail', choreId] })
      qc.invalidateQueries({ queryKey: ['chore', 'category'], exact: false })

      qc.invalidateQueries({ queryKey: ['mission', 'monthly'] })
      qc.invalidateQueries({ queryKey: ['badge', 'acquired'] })
      qc.invalidateQueries({ queryKey: ['badge', 'top', 'three'] })
    },
  })
}
