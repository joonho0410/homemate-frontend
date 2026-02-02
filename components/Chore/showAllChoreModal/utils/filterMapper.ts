import { ChoreRepeatType } from '@/types/chore/repeat'

export function mapRepeatFilterToRepeat(filter: ChoreRepeatType): {
  filter?: string
  repeat?: string
  repeatInterval?: number
} {
  switch (filter) {
    case '전체':
      return { filter: 'ALL' }
    case '한번':
      return { repeat: 'NONE', repeatInterval: 1 }
    case '매일':
      return { repeat: 'DAILY', repeatInterval: 1 }
    case '1주':
      return { repeat: 'WEEKLY', repeatInterval: 1 }
    case '2주':
      return { repeat: 'WEEKLY', repeatInterval: 2 }
    case '1개월':
      return { repeat: 'MONTHLY', repeatInterval: 1 }
    case '3개월':
      return { repeat: 'MONTHLY', repeatInterval: 3 }
    default:
      return {}
  }
}
