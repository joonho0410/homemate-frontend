import { useFilter } from '@/components/Chore/showAllChoreModal/context/FilterContext'
import HorizontalSlideContainer from '@/components/shared/container/HorizontalSlide'
import { CHORE_REPEAT_TYPES } from '@/types/chore/repeat'

import FilterItem from './FilterItem'

export default function RepeatFilter() {
  return (
    <HorizontalSlideContainer gap={8} paddingHorizontal={0}>
      <RepeatFilterList />
    </HorizontalSlideContainer>
  )
}

function RepeatFilterList() {
  const { repeatFilter, setRepeatFilter } = useFilter()

  return (
    <>
      {CHORE_REPEAT_TYPES.map((type) => (
        <FilterItem
          key={type}
          label={type}
          isActive={repeatFilter === type}
          onPress={() => setRepeatFilter(type)}
        />
      ))}
    </>
  )
}
