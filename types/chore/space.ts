export const CHORE_SPACES_MAP = {
  ALL: '전체',
  KITCHEN: '주방',
  BATHROOM: '욕실',
  BEDROOM: '침실',
  PORCH: '현관',
} as const

export const CHORE_SPACE_TYPES = Object.keys(CHORE_SPACES_MAP) as ChoreSpaceType[]
export type ChoreSpaceType = keyof typeof CHORE_SPACES_MAP
