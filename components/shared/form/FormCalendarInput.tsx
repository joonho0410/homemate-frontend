import { useMemo } from 'react'
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { StyleSheet, Text, ViewStyle } from 'react-native'

import Dropdown from '../component/Dropdown'

import DatePickerCalendar from '@/components/Calendar/DatePickerCalendar'
import { toYMD } from '@/libs/utils/date'

interface FormCalendarInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  defaultDate?: string
  style?: ViewStyle
}

// yyyy-mm-dd 형식인지 확인
function isYMD(date: string | undefined | null): date is string {
  if (!date) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

// yyyy-mm-dd -> yy.mm.dd 변환
function toYYMMDD(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${y.slice(2)}.${m}.${d}`
}

// 내부 컴포넌트: Dropdown context 내에서 close 사용
function CalendarContent({
  value,
  defaultDate,
  todayYMD,
  onChange,
}: {
  value: string
  defaultDate?: string
  todayYMD: string
  onChange: (date: string) => void
}) {
  const { close } = Dropdown.useContext()
  const displayDate = isYMD(value) ? value : (defaultDate ?? todayYMD)

  const handleSelect = (date: string) => {
    onChange(date)
    close()
  }

  return <DatePickerCalendar selectedDate={displayDate} onSelect={handleSelect} isOpen={true} />
}

export default function FormCalendarInput<T extends FieldValues>({
  control,
  name,
  defaultDate,
  style,
}: FormCalendarInputProps<T>) {
  const todayYMD = useMemo(() => toYMD(new Date()), [])

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const displayDate = isYMD(value) ? value : (defaultDate ?? todayYMD)

        const handleOpen = () => {
          if (!isYMD(value)) {
            onChange(defaultDate ?? todayYMD)
          }
        }

        return (
          <Dropdown.Root>
            <Dropdown.Trigger style={[styles.dateBtn, style]} onPressIn={handleOpen}>
              <Text style={styles.dateBtnText}>{toYYMMDD(displayDate)}</Text>
            </Dropdown.Trigger>

            <Dropdown.Menu style={styles.calendarMenu} align="right">
              <CalendarContent
                value={value}
                defaultDate={defaultDate}
                todayYMD={todayYMD}
                onChange={onChange}
              />
            </Dropdown.Menu>
          </Dropdown.Root>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  dateBtn: {
    backgroundColor: '#EBF9F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dateBtnText: {
    fontSize: 14,
    color: '#46A1A6',
  },
  calendarMenu: {
    width: 340,
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
})
