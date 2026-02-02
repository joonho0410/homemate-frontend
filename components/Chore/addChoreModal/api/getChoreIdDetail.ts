import { api } from '@/libs/api/axios'
import { CHORE_ENDPOINTS } from '@/libs/api/endpoints'
import { ResponseChore } from '@/types/chore'

export type GetChoreIdDetailArgs = {
  choreId: number
}

export default async function getChoreIdDetail({ choreId }: GetChoreIdDetailArgs) {
  const { data } = await api.get<ResponseChore['data']>(CHORE_ENDPOINTS.DETAIL_CHOREID(choreId))

  return data
}
