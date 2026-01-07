import { useEffect, useMemo, useState } from 'react'

import { toYMD } from '@/libs/utils/date'
import { toRepeatLabel } from '@/libs/utils/repeat'
import { toSpaceUi } from '@/libs/utils/space'
import { responseChoreDetail } from '@/types/chore'
import { RandomChoreList } from '@/types/recommend'

import { ChoreFormData } from './types'

interface UseChoreFormDataParams {
  isEdit: boolean
  detail?: responseChoreDetail
  selectedDate?: string
}

const isYMD = (s: string | null | undefined): boolean => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)

export function useChoreFormData(params: UseChoreFormDataParams) {
  const { isEdit, detail, selectedDate } = params

  const todayYMD = useMemo(() => toYMD(new Date()), [])

  // Form 데이터 상태
  const [title, setTitle] = useState('')
  const [space, setSpace] = useState<string | null>(null)
  const [repeat, setRepeat] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  // ADD 모드 초기값 설정
  useEffect(() => {
    if (isEdit) return
    const base = isYMD(selectedDate) ? (selectedDate as string) : todayYMD
    setStartDate(base)
    setEndDate(base)
  }, [isEdit, selectedDate, todayYMD])

  // EDIT 모드 초기값 설정
  useEffect(() => {
    if (!isEdit || !detail) return
    setTitle(detail.title ?? '')
    setSpace(toSpaceUi(detail.space) ?? null)
    setRepeat(toRepeatLabel(detail.repeatType, detail.repeatInterval))
    setStartDate(detail.startDate ?? null)
    setEndDate(detail.endDate ?? null)
  }, [isEdit, detail])

  // 추천 집안일 자동 채우기
  const applyRecommendation = (chore: RandomChoreList) => {
    setTitle(chore.titleKo)
    setSpace(toSpaceUi(chore.space))
    setRepeat(toRepeatLabel(chore.repeatType, chore.repeatInterval))
    setStartDate(chore.startDate)
    setEndDate(chore.endDate)
  }

  // Form 초기화
  const resetForm = () => {
    setTitle('')
    setSpace(null)
    setRepeat(null)
    const base = todayYMD
    setStartDate(base)
    setEndDate(base)
  }

  // Form 데이터 객체
  const formData: ChoreFormData = {
    title,
    space,
    repeat,
    startDate,
    endDate,
  }

  return {
    formData,
    setTitle,
    setSpace,
    setRepeat,
    setStartDate,
    setEndDate,
    resetForm,
    applyRecommendation,
    todayYMD,
  }
}
