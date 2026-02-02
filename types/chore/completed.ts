export const CHORE_COMPLETED_MAP = {
  ALL: '전체',
  PENDING: '진행중',
  COMPLETED: '완료',
} as const

export const CHORE_COMPLETED_TYPES = Object.keys(CHORE_COMPLETED_MAP) as ChoreCompletedType[]
export type ChoreCompletedType = keyof typeof CHORE_COMPLETED_MAP
