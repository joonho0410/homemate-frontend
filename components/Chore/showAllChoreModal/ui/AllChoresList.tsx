import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'

import VerticalSlideContainer from '@/components/shared/container/VerticalSlide'
import { ResponseChore } from '@/types/chore'

import { useFilter } from '../context/FilterContext'
import { useChoreByFilter } from '../hooks/useChoreByFilter'
import { mapRepeatFilterToRepeat } from '../utils/filterMapper'
import ChoreCard from './ChoreCard'
import ErrorState from './states/ErrorState'
import LoadingState from './states/LoadingState'

import { StyleSheet } from 'react-native'
import CompletedFilter from './filter/CompletedFilter'

export default function AllChoresContainer() {
  const { spaceFilter, repeatFilter, completedFilter } = useFilter()

  const {
    filter: _filter,
    repeat: _repeat,
    repeatInterval: _repeatInterval,
  } = mapRepeatFilterToRepeat(repeatFilter)

  const {
    data: chores,
    isLoading,
    isError,
  } = useChoreByFilter({
    filter: spaceFilter === 'ALL' ? 'ALL' : 'SPACE',
    space: spaceFilter === 'ALL' ? undefined : spaceFilter,
    repeat: _repeat,
    repeatInterval: _repeatInterval,
    status: completedFilter === 'ALL' ? undefined : completedFilter,
  })

  if (isLoading) return <LoadingState />
  if (isError || !chores) return <ErrorState />

  return <AllChoresPresentation chores={chores} />
}

function AllChoresPresentation({ chores }: { chores: ResponseChore['data'][] }) {
  const router = useRouter()

  const handleChorePress = (chore: ResponseChore['data']) => {
    router.push({
      pathname: '/add-chore',
      params: {
        mode: 'editChore',
        choreId: String(chore.id),
      },
    })
  }

  return (
    <View>
      {/* Header Info, CompletedFilter */}
      <View style={styles.container}>
        <Text style={styles.countText}>총 집안일 {chores.length}개</Text>
        <CompletedFilter />
      </View>
      {/* ChoreList */}
      <VerticalSlideContainer gap={12} paddingVertical={0}>
        {chores.map((chore) => (
          <ChoreCard key={chore.id} onPress={() => handleChorePress(chore)} {...chore} />
        ))}
      </VerticalSlideContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
})
