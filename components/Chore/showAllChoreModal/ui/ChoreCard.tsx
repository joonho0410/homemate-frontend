import { Pressable, StyleSheet, Text, View } from 'react-native'

import Tag from '@/components/shared/component/tag'
import { RepeatType } from '@/types/chore'

type ChoreCardProps = {
  id: number
  title: string
  startDate: string
  endDate: string
  space: string
  notificationTime: string | null
  repeatType: RepeatType
  repeatInterval: number
  onPress?: () => void
}

export default function ChoreCard({
  title,
  startDate,
  endDate,
  space,
  notificationTime,
  repeatType,
  repeatInterval,
  onPress,
}: ChoreCardProps) {
  const repeatLabel = getRepeatLabel(repeatType, repeatInterval)
  const { textColor, backgroundColor } = getRepeatColor(repeatType)

  const formattedDate = `${formatDate(startDate)} ~ ${formatDate(endDate)}`
  const locationTime = `${space} / ${notificationTime || '알림 없음'}`

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Tag
            text={repeatLabel}
            textColor={textColor}
            backgroundColor={backgroundColor}
            paddingHorizontal={8}
            paddingVertical={4}
            borderRadius={6}
            fontSize={12}
          />
          <View style={styles.textSection}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.locationText}>{locationTime}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

function getRepeatLabel(repeatType: RepeatType, interval: number): string {
  switch (repeatType) {
    case 'NONE':
      return '한번'
    case 'DAILY':
      return '매일'
    case 'WEEKLY':
      return interval === 1 ? '1주' : `${interval}주`
    case 'MONTHLY':
      return interval === 1 ? '1개월' : `${interval}개월`
    case 'YEARLY':
      return `${interval}년`
    default:
      return '기타'
  }
}

function getRepeatColor(repeatType: RepeatType): { textColor: string; backgroundColor: string } {
  switch (repeatType) {
    case 'NONE':
      return { textColor: '#1D4ED8', backgroundColor: '#DBEAFE' } // blue
    case 'DAILY':
      return { textColor: '#047857', backgroundColor: '#D1FAE5' } // green
    case 'WEEKLY':
      return { textColor: '#92400E', backgroundColor: '#FEF3C7' } // amber
    case 'MONTHLY':
      return { textColor: '#6B21A8', backgroundColor: '#EDE9FE' } // purple
    case 'YEARLY':
      return { textColor: '#0F766E', backgroundColor: '#CCFBF1' } // teal
    default:
      return { textColor: '#374151', backgroundColor: '#E5E7EB' } // gray
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  textSection: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  arrowIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '300',
  },
})
