import { api } from '../axios'
import { CHORE_ENDPOINTS } from '../endpoints'

/**
 * choreId 기준으로 집안일 삭제 (루틴 전체 삭제)
 */
export async function deleteChoreByChoreId(choreId: number, applyToAfter: boolean) {
  const { data } = await api.delete(CHORE_ENDPOINTS.DELETE_BY_CHORE_ID(choreId), {
    params: { applyToAfter },
  })

  return data
}
