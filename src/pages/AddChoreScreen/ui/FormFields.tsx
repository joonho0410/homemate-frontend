import { Dispatch, SetStateAction } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import ChoreDropdown from '@/components/Dropdown/ChoreDropdown'
import TimeDropdown from '@/components/Dropdown/TimeDropdown'
import Toggle from '@/components/Toggle'

interface FormFieldsProps {
  // Space
  space: string | null
  spaceOptions: string[]
  onSpaceChange: (value: string | null) => void

  // Repeat
  repeat: string | null
  repeatOptions: string[]
  onRepeatChange: (value: string | null) => void

  // Dates
  startDate: string | null
  endDate: string | null
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onStartDatePress: () => void
  onEndDatePress: () => void

  // Notification
  notifyOn: boolean
  onNotifyChange: (value: boolean) => void
  ampm: '오전' | '오후'
  hour12: number
  minute: number
  onTimeChange: (params: { ampm: '오전' | '오후'; hour: number; minute: number }) => void

  // Dropdown
  activeDropdown: string | null
  setActiveDropdown: Dispatch<SetStateAction<string | null>>

  // Helpers
  toYYMMDD: (s?: string | null) => string
}

export default function FormFields(props: FormFieldsProps) {
  const {
    space,
    spaceOptions,
    onSpaceChange,
    repeat,
    repeatOptions,
    onRepeatChange,
    startDate,
    endDate,
    onStartDatePress,
    onEndDatePress,
    notifyOn,
    onNotifyChange,
    ampm,
    hour12,
    minute,
    onTimeChange,
    activeDropdown,
    setActiveDropdown,
    toYYMMDD,
  } = props

  return (
    <View style={styles.card}>
      {/* 공간 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>공간</Text>
        <ChoreDropdown
          id="space"
          options={spaceOptions}
          value={space}
          onChange={onSpaceChange}
          placeholder="선택"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </View>

      <View style={styles.divider} />

      {/* 반복주기 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>반복주기</Text>
        <ChoreDropdown
          id="repeat"
          options={repeatOptions}
          value={repeat}
          onChange={onRepeatChange}
          placeholder="선택"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </View>

      <View style={styles.divider} />

      {/* 시작 날짜 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>시작 날짜</Text>
        <Pressable onPress={onStartDatePress}>
          <Text style={styles.dateText}>{toYYMMDD(startDate)}</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* 종료 날짜 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>종료 날짜</Text>
        <Pressable onPress={onEndDatePress}>
          <Text style={styles.dateText}>{toYYMMDD(endDate)}</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* 알림 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>알림</Text>
        <Toggle value={notifyOn} onChange={onNotifyChange} />
      </View>

      {notifyOn && (
        <>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.label}>알림 시간</Text>
            <TimeDropdown
              ampm={ampm}
              hour={hour12}
              minute={minute}
              onChange={onTimeChange}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E2025',
  },
  dateText: {
    fontSize: 16,
    color: '#686F79',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E8EB',
  },
})
