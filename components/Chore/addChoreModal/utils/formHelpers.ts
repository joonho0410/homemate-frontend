/**
 * 다양한 타입을 boolean으로 변환
 */
export function toBool(v: unknown): boolean {
  return v === true || v === 'Y' || v === 'y' || v === 1 || v === '1'
}

/**
 * 폼 변경 감지
 */
export function detectFormChange(
  initial: {
    title: string
    space: string | null
    repeat: string | null
    startDate: string | null
    endDate: string | null
    notifyOn: boolean
    ampm: '오전' | '오후'
    hour12: number
    minute: number
  } | undefined,
  current: {
    title: string
    space: string | null
    repeat: string | null
    startDate: string | null
    endDate: string | null
    notifyOn: boolean
    ampm: '오전' | '오후'
    hour12: number
    minute: number
  }
): boolean {
  if (!initial) return false

  return (
    current.title !== initial.title ||
    current.space !== initial.space ||
    current.repeat !== initial.repeat ||
    current.startDate !== initial.startDate ||
    current.endDate !== initial.endDate ||
    current.notifyOn !== initial.notifyOn ||
    (current.notifyOn &&
      (current.ampm !== initial.ampm ||
        current.hour12 !== initial.hour12 ||
        current.minute !== initial.minute))
  )
}
