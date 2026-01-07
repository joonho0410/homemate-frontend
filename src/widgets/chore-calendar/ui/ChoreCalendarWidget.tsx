import { StyleSheet, Text, View } from 'react-native'

import HomeCalendar from '@/components/Calendar/HomeCalendar'
import { formatKoreanDate } from '@/libs/utils/date'
import { useChoreByDate, useChoreCalendar } from '@entities/chore'
import { useMyPage } from '@entities/user'

import { useChoreCalendarState } from '../model/useChoreCalendarState'
import ChoreListItem from './ChoreListItem'

function ChoreListLoading() {
  return (
    <View style={styles.listBox}>
      <Text>집안일 내역을 불러오는 중입니다.</Text>
    </View>
  )
}

function ChoreListError() {
  return (
    <View style={styles.listBox}>
      <Text>집안일 내역 불러오기에 실패했습니다.</Text>
    </View>
  )
}

function ChoreListEmpty({ userName }: { userName?: string }) {
  return (
    <View style={styles.listBox}>
      <Text style={styles.itemTitle}>{userName || '사용자'}님의 하루 집안일을 계획해보세요</Text>
    </View>
  )
}

function Header({ selectedDate }: { selectedDate: string }) {
  return (
    <View style={styles.listHeaderRow}>
      <Text style={styles.listHeaderTitle}>{formatKoreanDate(selectedDate)}</Text>
      <Text style={styles.listHeaderSub}>집안일</Text>
    </View>
  )
}

function ChoreList({ selectedDate }: { selectedDate: string }) {
  const { data: choresData = [], isLoading, isError } = useChoreByDate(selectedDate)
  const { data: user } = useMyPage()
  const choresList = choresData ?? []
  const isChoreEmpty = choresList.length === 0

  if (isLoading) return <ChoreListLoading />
  if (isError) return <ChoreListError />
  if (isChoreEmpty) return <ChoreListEmpty userName={user?.nickname} />

  return (
    <View style={styles.listBox}>
      {choresList.map((item, index) => (
        <ChoreListItem
          key={item.id}
          item={item}
          selectedDate={selectedDate}
          isLast={index === choresList.length - 1}
        />
      ))}
    </View>
  )
}

export default function ChoreCalendarWidget() {
  const { selectedDate, setSelectedDate, range, handleMonthChange } = useChoreCalendarState()
  const { data: dotDates = [] } = useChoreCalendar(range.start, range.end)

  return (
    <>
      <HomeCalendar
        onSelect={setSelectedDate}
        dotDates={dotDates}
        onMonthChangeRange={handleMonthChange}
      />
      <View style={styles.flex}>
        <Header selectedDate={selectedDate} />
        <ChoreList selectedDate={selectedDate} />
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
