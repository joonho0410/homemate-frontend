import { StyleSheet, View } from 'react-native'
import FilterRow from './filter/FilterRow'
import RepeatFilter from './filter/RepeatFilter'
import SpaceFilter from './filter/SpaceFilter'

export default function AllChoreFilters() {
  return (
    <View style={styles.filterSection}>
      <FilterRow label="주기">
        <RepeatFilter />
      </FilterRow>
      <FilterRow label="공간">
        <SpaceFilter />
      </FilterRow>
    </View>
  )
}

const styles = StyleSheet.create({
  filterSection: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 8,
    gap: 10,
  },
})
