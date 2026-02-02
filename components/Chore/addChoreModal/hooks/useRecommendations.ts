import { useEffect, useMemo, useState } from 'react'
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form'

import useRandomChoreInfo from '@/libs/hooks/recommend/useRandomChoreInfo'
import useRandomChores from '@/libs/hooks/recommend/useRandomChores'
import { toRepeatLabel } from '@/libs/utils/repeat'
import { toSpaceUi } from '@/libs/utils/space'
import { toHHmmParts } from '@/libs/utils/time'

import { ChoreFormData } from '../schemas/choreFormSchema'
import type { RecommendationsData } from '../types'

interface UseRecommendationsParams {
  enabled: boolean
  setValue: UseFormSetValue<ChoreFormData>
  trigger: UseFormTrigger<ChoreFormData>
  setFromRecommendChip: (from: boolean) => void
  userDefaultTime?: string
}

/**
 * 추천 집안일 관련 hooks 통합
 * RHF의 setValue를 받아서 추천 칩 선택 시 자동으로 form을 채웁니다
 * enabled가 false면 null을 반환합니다
 */
export function useRecommendations({
  enabled,
  setValue,
  trigger,
  setFromRecommendChip,
  userDefaultTime,
}: UseRecommendationsParams): RecommendationsData | null {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: randomChores = [], isLoading, isRefetching, refetch } = useRandomChores()

  const { data: selectedChoreInfo } = useRandomChoreInfo(selectedId as number)

  // Auto-fill form when a recommendation is selected
  useEffect(() => {
    if (!selectedChoreInfo) return

    setFromRecommendChip(true)

    // Fill form fields using RHF's setValue (without validation)
    const options = { shouldDirty: true }

    setValue('title', selectedChoreInfo.titleKo, options)
    setValue('space', toSpaceUi(selectedChoreInfo.space) || null, options)
    setValue(
      'repeat',
      toRepeatLabel(selectedChoreInfo.repeatType, selectedChoreInfo.repeatInterval),
      options
    )
    setValue('startDate', selectedChoreInfo.startDate || null, options)
    setValue('endDate', selectedChoreInfo.endDate || null, options)

    if (selectedChoreInfo.choreEnabled && userDefaultTime) {
      const { ampm, hour12, minute } = toHHmmParts(userDefaultTime)
      setValue('notifyOn', true, options)
      setValue('ampm', ampm, options)
      setValue('hour12', hour12, options)
      setValue('minute', minute, options)
    } else {
      setValue('notifyOn', false, options)
    }

    // Trigger validation once after all values are set
    trigger()
  }, [selectedChoreInfo, setValue, trigger, setFromRecommendChip, userDefaultTime])

  return useMemo(() => {
    if (!enabled) return null
    return {
      randomChores,
      isLoading,
      isRefetching,
      onSelect: setSelectedId,
      onRefresh: refetch,
    }
  }, [enabled, randomChores, isLoading, isRefetching, refetch])
}
