import { useFilter } from '@/components/Chore/showAllChoreModal/context/FilterContext'
import HorizontalSlideContainer from '@/components/shared/container/HorizontalSlide'
import { CHORE_SPACE_TYPES, CHORE_SPACES_MAP } from '@/types/chore/space'

import FilterItem from './FilterItem'

export default function SpaceFilter() {
  return (
    <HorizontalSlideContainer gap={8} paddingHorizontal={0}>
      <SpaceFilterList />
    </HorizontalSlideContainer>
  )
}

function SpaceFilterList() {
  const { spaceFilter, setSpaceFilter } = useFilter()

  return (
    <>
      {CHORE_SPACE_TYPES.map((type) => (
        <FilterItem
          key={type}
          label={CHORE_SPACES_MAP[type]}
          isActive={spaceFilter === type}
          onPress={() => setSpaceFilter(type)}
        />
      ))}
    </>
  )
}
