import { QueryClient } from '@tanstack/react-query'
import { Dispatch } from '@reduxjs/toolkit'

import { getAcquiredBadges } from '@/libs/api/badge/getAcquiredBadges'
import { getBadgeDesc } from '@/libs/utils/getBadgeDesc'
import { getNewlyAcquiredBadgeByTime } from '@/libs/utils/getNewlyAcquiredBadgeByTime'
import { openAchievementModal } from '@/store/slices/achievementModalSlice'
import { ResponseBadge } from '@/types/badge'

const missionIcon = require('../../../../assets/images/icon/missionIcon.png')

/**
 * Handle badge and mission achievements after chore creation
 */
export async function handleBadgeAndMission(
  response: any,
  dispatch: Dispatch,
  queryClient: QueryClient
) {
  // Handle missions
  const completedMissions = response.missionResults?.filter((m: any) => m.completed) ?? []
  completedMissions.forEach((mission: any) => {
    dispatch(
      openAchievementModal({
        kind: 'mission',
        title: '미션 달성!',
        desc: `이달의 미션 \n ${mission.title} 미션을 완료했어요!`,
        icon: missionIcon,
        missionId: mission.id,
        missionName: mission.title,
      })
    )
  })

  // Handle badges
  const prevBadge = queryClient.getQueryData<ResponseBadge[]>(['badge', 'acquired'])
  const nextBadge = await queryClient.fetchQuery<ResponseBadge[]>({
    queryKey: ['badge', 'acquired'],
    queryFn: getAcquiredBadges,
  })
  const newlyAcquired = getNewlyAcquiredBadgeByTime(prevBadge, nextBadge)

  newlyAcquired?.forEach((badge) => {
    dispatch(
      openAchievementModal({
        kind: 'badge',
        title: `${badge.badgeTitle} 뱃지 획득`,
        desc: getBadgeDesc(badge, nextBadge),
        icon: badge.badgeImageUrl,
        badgeId: badge.badgeTitle,
        badgeName: badge.badgeTitle,
      })
    )
  })
}
