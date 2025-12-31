import { StyleSheet, Text, View } from 'react-native'

import HomeCalendar from '@/components/Calendar/HomeCalendar'
import { formatKoreanDate } from '@/libs/utils/date'
import { useChoreByDate, useChoreCalendar } from '@entities/chore'
import { useMyPage } from '@entities/user'

import ChoreListItem from './ChoreListItem'
import { useChoreCalendarState } from '../model/useChoreCalendarState'

export default function ChoreCalendarWidget() {
  const { selectedDate, setSelectedDate, range, handleMonthChange } = useChoreCalendarState()
  const { data: user } = useMyPage()

  const { data: dotDates = [] } = useChoreCalendar(range.start, range.end)
  const { data: choresData = [], isLoading, isError } = useChoreByDate(selectedDate)
  const choresList = choresData ?? []

  return (
    <>
      <HomeCalendar
        onSelect={setSelectedDate}
        dotDates={dotDates}
        onMonthChangeRange={handleMonthChange}
      />

      <View style={styles.flex}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>{formatKoreanDate(selectedDate)}</Text>
          <Text style={styles.listHeaderSub}>집안일</Text>
        </View>

        <View style={styles.listBox}>
          {isLoading && <Text>집안일 내역을 불러오는 중입니다.</Text>}
          {isError && <Text>집안일 내역 불러오기에 실패했습니다.</Text>}
          {!isLoading && !isError && choresList.length === 0 ? (
            <Text style={styles.itemTitle}>
              {user?.nickname || '사용자'}님의 하루 집안일을 계획해보세요
            </Text>
          ) : (
            choresList.map((item, index) => (
              <ChoreListItem
                key={item.id}
                item={item}
                selectedDate={selectedDate}
                isLast={index === choresList.length - 1}
              />
            ))
          )}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listHeaderRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 },
  listHeaderTitle: { fontSize: 18, fontWeight: '700' },
  listHeaderSub: { fontSize: 16 },
  listBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  itemTitle: { fontSize: 14 },
})
