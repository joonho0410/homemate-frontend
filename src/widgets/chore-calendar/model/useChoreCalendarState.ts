import { useMemo, useState } from 'react'

import { getMonthRange, toYMD } from '@/libs/utils/date'

export function useChoreCalendarState() {
  const todayStr = useMemo(() => {
    const t = new Date()
    return toYMD(t)
  }, [])

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [range, setRange] = useState(() => getMonthRange(selectedDate))

  const handleMonthChange = (start: string, end: string) => {
    setRange({ start, end })
  }

  return {
    selectedDate,
    setSelectedDate,
    range,
    handleMonthChange,
    todayStr,
  }
}
