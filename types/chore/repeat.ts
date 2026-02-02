export const CHORE_REPEAT_TYPES = ['전체', '한번', '매일', '1주', '2주', '1개월', '3개월'] as const
export type ChoreRepeatType = (typeof CHORE_REPEAT_TYPES)[number]
