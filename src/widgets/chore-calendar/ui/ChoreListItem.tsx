import { useRouter } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { getRepeatKey, REPEAT_STYLE } from '@/constants/choreRepeatStyles'
import { styleFromRepeatColor } from '@/libs/utils/repeat'
import { ChoreCheckbox } from '@features/chore'

interface ChoreListItemProps {
  item: any
  selectedDate: string
  isLast?: boolean
}

export default function ChoreListItem({ item, selectedDate, isLast }: ChoreListItemProps) {
  const router = useRouter()
  const key = getRepeatKey(item.repeatType, item.repeatInterval)
  const repeat = REPEAT_STYLE[key] ?? REPEAT_STYLE['NONE-0']

  return (
    <View style={[styles.itemRow, !isLast && styles.mb12]}>
      <View style={styles.itemLeftRow}>
        <View
          style={[
            styles.badge,
            styleFromRepeatColor(repeat.color),
            item.status === 'COMPLETED' ? styles.badgeDone : styleFromRepeatColor(repeat.color),
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.status === 'COMPLETED' ? styles.badgeDone : styleFromRepeatColor(repeat.color),
            ]}
          >
            {repeat.label}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: '/add-chore',
              params: {
                mode: 'edit',
                instanceId: String(item.id),
                choreId: String(item.choreId),
                selectedDate,
              },
            })
          }
        >
          <Text
            style={[
              styles.itemTitle,
              item.status === 'COMPLETED' ? styles.itemTitleDone : styles.itemTitleActive,
            ]}
          >
            {item.titleSnapshot}
          </Text>
        </TouchableOpacity>
      </View>
      <ChoreCheckbox chore={item} selectedDate={selectedDate} size={20} />
    </View>
  )
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mb12: { marginBottom: 12 },
  itemLeftRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 23,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    textAlign: 'center',
  },
  badgeDone: { backgroundColor: '#CDCFD2', color: '#9B9FA6' },
  itemTitle: { fontSize: 14 },
  itemTitleActive: { color: '#000000' },
  itemTitleDone: { color: '#CDCFD2', textDecorationLine: 'line-through' },
})
