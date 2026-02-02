import { useQuery } from '@tanstack/react-query'

import getChoreIdDetail, { GetChoreIdDetailArgs } from '../api/getChoreIdDetail'
type ResponseType = Awaited<ReturnType<typeof getChoreIdDetail>>

export function useChoreIdDetail({ choreId }: GetChoreIdDetailArgs) {
  return useQuery<ResponseType>({
    queryKey: ['chore', 'idDetail', choreId],
    queryFn: () => getChoreIdDetail({ choreId }),
    enabled: !!choreId,

    // 4. 캐싱 및 리패치 전략
    staleTime: 60 * 1000, // 1분간은 신선한 데이터로 간주
    gcTime: 5 * 60 * 1000, // (이전의 cacheTime) 5분간 메모리에 유지

    placeholderData: (previousData) => previousData, // 부드러운 UI 전환

    // 특별한 이유가 없다면 mount시 리패치는 true(기본값)를 권장합니다.
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  })
}
