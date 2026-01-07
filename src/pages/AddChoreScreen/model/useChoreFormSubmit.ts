import { useQueryClient } from '@tanstack/react-query'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import { useDispatch } from 'react-redux'

import { getAcquiredBadges } from '@/libs/api/badge/getAcquiredBadges'
import { toApiError } from '@/libs/api/error'
import useCreateChore from '@/libs/hooks/chore/useCreateChore'
import { useDeleteChore } from '@/libs/hooks/chore/useDeleteChore'
import useUpdateChore from '@/libs/hooks/chore/useUpdateChore'
import { toYMD } from '@/libs/utils/date'
import { trackEvent } from '@/libs/utils/ga4'
import { getBadgeDesc } from '@/libs/utils/getBadgeDesc'
import { getNewlyAcquiredBadgeByTime } from '@/libs/utils/getNewlyAcquiredBadgeByTime'
import { toRepeatFields } from '@/libs/utils/repeat'
import { toSpaceApi } from '@/libs/utils/space'
import { openAchievementModal } from '@/store/slices/achievementModalSlice'
import { ResponseBadge } from '@/types/badge'

import { ChoreFormData, NotificationSettings } from './types'

interface UseChoreFormSubmitParams {
  isEdit: boolean
  instanceId?: number
  selectedDate?: string
  userId?: number
  initialValue?: any
  currentValue?: any
}

const missionIcon = require('@/assets/images/icon/missionIcon.png')

export function useChoreFormSubmit(params: UseChoreFormSubmitParams) {
  const { isEdit, instanceId, selectedDate, userId, initialValue, currentValue } = params

  const { mutate: createChore, isPending: creating } = useCreateChore()
  const { mutate: updateChore, isPending: updating } = useUpdateChore()
  const { mutate: deleteChore, isPending: deleting } = useDeleteChore()

  const dispatch = useDispatch()
  const qc = useQueryClient()

  const closeAddChore = () => {
    if (Platform.OS === 'web') {
      router.replace('/(tabs)/home')
    } else {
      router.back()
    }
  }

  // 생성 핸들러
  const handleCreate = (
    formData: ChoreFormData,
    notification: NotificationSettings,
    notificationTime: string,
    fromRecommend: boolean
  ) => {
    const todayYMD = toYMD(new Date())
    const baseDate = formData.startDate ?? todayYMD
    if (!formData.repeat) return

    const { repeatType, repeatInterval } = toRepeatFields(formData.repeat)
    const spaceApi = toSpaceApi(formData.space)
    if (!spaceApi) return

    const taskSource = fromRecommend ? 'RECOMMEND' : 'MANUAL'

    trackEvent('task_created', {
      user_id: userId,
      task_type: taskSource,
      title: formData.title.trim(),
      cycle: formData.repeat,
      reco_btn_click: fromRecommend,
    })

    createChore(
      {
        title: formData.title.trim(),
        notificationYn: notification.enabled,
        notificationTime,
        space: spaceApi,
        repeatType,
        repeatInterval,
        startDate: baseDate,
        endDate: formData.endDate ?? baseDate,
        recommendYn: false,
      },
      {
        onSuccess: async (resp) => {
          closeAddChore()
          const completedMissions = resp.missionResults?.filter((m) => m.completed) ?? []
          completedMissions.forEach((mission) => {
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

          const prevBadge = qc.getQueryData<ResponseBadge[]>(['badge', 'acquired'])
          const nextBadge = await qc.fetchQuery<ResponseBadge[]>({
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
        },
        onError: (error) => {
          const { code, message, details } = toApiError(error)
          console.warn('[createChore error]', code, details?.[0]?.message ?? message)
        },
      }
    )
  }

  // 수정 핸들러
  const handleUpdate = (
    formData: ChoreFormData,
    notification: NotificationSettings,
    notificationTime: string,
    applyToAfter: boolean,
    fromRecommend: boolean
  ) => {
    if (!instanceId) {
      console.warn('[update] instanceId가 없습니다.')
      return
    }

    const todayYMD = toYMD(new Date())
    const baseDate = formData.startDate ?? todayYMD
    if (!formData.repeat) return

    const { repeatType, repeatInterval } = toRepeatFields(formData.repeat)
    const spaceApi = toSpaceApi(formData.space)
    if (!spaceApi) return

    updateChore(
      {
        choreInstanceId: instanceId,
        dto: {
          title: formData.title.trim(),
          notificationYn: notification.enabled,
          notificationTime,
          space: spaceApi,
          repeatType,
          repeatInterval,
          recommendYn: false,
          startDate: baseDate,
          endDate: formData.endDate ?? baseDate,
          applyToAfter: Boolean(applyToAfter),
        },
      },
      {
        onSuccess: () => {
          if (initialValue) {
            const beforeCycle = initialValue.repeat ?? ''
            const afterCycle = currentValue.repeat ?? ''
            const cycleChanged = beforeCycle !== afterCycle

            const taskSource = fromRecommend ? 'RECOMMEND' : 'MANUAL'

            trackEvent('task_update', {
              user_id: userId,
              title: formData.title.trim(),
              task_type: taskSource,
              before_cycle: beforeCycle,
              after_cycle: afterCycle,
              reco_btn_click: fromRecommend,
              cycle_changed: cycleChanged,
            })
          }

          closeAddChore()
        },
        onError: (error) => {
          const { code, message, details } = toApiError(error)
          console.warn('[updateChore error]', code, details?.[0]?.message ?? message)
        },
      }
    )
  }

  // 삭제 핸들러
  const handleDelete = (applyToAfter: boolean) => {
    if (!isEdit || !instanceId) return
    if (!selectedDate) return

    deleteChore(
      { choreInstanceId: instanceId, selectedDate, applyToAfter },
      {
        onSuccess: () => {
          closeAddChore()
        },
        onError: (error) => {
          const { code, message, details } = toApiError(error)
          console.warn('[deleteChore error]', code, details?.[0]?.message ?? message)
        },
      }
    )
  }

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    isSubmitting: creating || updating,
    isDeleting: deleting,
  }
}
