import { api } from '@/libs/api/axios'
import { CHORE_ENDPOINTS } from '@/libs/api/endpoints'
import { ResponseChore } from '@/types/chore'

export type GetChoreByFilterArgs = {
  filter?: string
  space?: string
  repeat?: string
  repeatInterval?: number
  status?: string
}

export default async function getChoreByFilter({
  filter,
  space,
  repeat,
  repeatInterval,
  status,
}: GetChoreByFilterArgs) {
  const { data } = await api.get<ResponseChore['data'][]>(CHORE_ENDPOINTS.CATEGORY, {
    params: { filter, space, repeat, repeatInterval, status },
  })

  return data
}
