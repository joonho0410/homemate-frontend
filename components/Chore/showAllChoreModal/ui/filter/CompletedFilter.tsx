import { CHORE_COMPLETED_MAP, CHORE_COMPLETED_TYPES } from '@/types/chore/completed'

import Dropdown from '@/components/shared/component/Dropdown'
import { useFilter } from '../../context/FilterContext'

export default function CompletedFilter() {
  const { completedFilter, setCompletedFilter } = useFilter()

  return (
    <Dropdown.Root>
      <Dropdown.Trigger>
        <Dropdown.Label>{CHORE_COMPLETED_MAP[completedFilter]}</Dropdown.Label>
      </Dropdown.Trigger>
      <Dropdown.Menu align="right">
        {CHORE_COMPLETED_TYPES.map((type) => (
          <Dropdown.Item
            key={type}
            onSelect={() => setCompletedFilter(type)}
            isSelected={completedFilter === type}
          >
            {CHORE_COMPLETED_MAP[type]}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown.Root>
  )
}
