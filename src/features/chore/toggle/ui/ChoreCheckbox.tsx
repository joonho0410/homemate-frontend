import Checkbox from '@/components/Checkbox'
import { trackEvent } from '@/libs/utils/ga4'
import { toRepeatLabel2 } from '@/libs/utils/repeat'
import { usePatchChoreStatus } from '@entities/chore'
import { useMyPage } from '@entities/user'

interface ChoreCheckboxProps {
  chore: {
    id: number
    status: string
    registrationType: string
    titleSnapshot: string
    repeatType: string
    repeatInterval: number
  }
  selectedDate: string
  size?: number
}

export default function ChoreCheckbox({ chore, selectedDate, size = 20 }: ChoreCheckboxProps) {
  const { mutate: choreStatus } = usePatchChoreStatus(selectedDate)
  const { data: user } = useMyPage()

  const handleToggle = () => {
    const wasCompleted = chore.status === 'COMPLETED'
    const nextCompleted = !wasCompleted

    // 서버 상태 변경
    choreStatus(chore.id)

    // 완료로 바뀌는 순간에만 GA4 태깅
    if (nextCompleted) {
      trackEvent('task_completed', {
        user_id: user?.id,
        task_type: chore.registrationType,
        title: chore.titleSnapshot,
        cycle: toRepeatLabel2(chore.repeatType, chore.repeatInterval),
      })
    }
  }

  return (
    <Checkbox checked={chore.status === 'COMPLETED'} onChange={handleToggle} size={size} />
  )
}
