import { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'

import { toYMD } from '@/libs/utils/date'
import { SPACE_UI_OPTIONS } from '@/libs/utils/space'

import { ChoreFormData } from '../schemas/choreFormSchema'
import FormInputRow from './formInputs/FormInputRow'
import TimeDropdown from './formInputs/TimeDropdown'

const repeatOptions = [
  '한번',
  '매일',
  '1주마다',
  '2주마다',
  '매달',
  '3개월마다',
  '6개월마다',
  '매년',
]

interface FormCardProps {
  form: UseFormReturn<ChoreFormData, any>
}

export default function FormCard({ form }: FormCardProps) {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form

  const todayYMD = useMemo(() => toYMD(new Date()), [])

  const startDate = watch('startDate')
  const notifyOn = watch('notifyOn')

  return (
    <View style={styles.card}>
      {/* 공간 */}
      <FormInputRow
        type="select"
        control={control}
        name="space"
        label="공간"
        options={SPACE_UI_OPTIONS}
        placeholder="선택"
        disableSelectedHighlight
      />

      {/* 반복주기 */}
      <FormInputRow
        type="select"
        control={control}
        name="repeat"
        label="반복주기"
        options={repeatOptions}
        placeholder="선택"
        disableSelectedHighlight
      />

      {/* 시작일자 */}
      <FormInputRow
        type="calendar"
        control={control}
        name="startDate"
        label="시작일자"
        defaultDate={todayYMD}
      />

      {/* 완료일자 */}
      <FormInputRow
        type="calendar"
        control={control}
        name="endDate"
        label="완료일자"
        defaultDate={startDate ?? todayYMD}
        error={errors.endDate}
      />

      {/* 알림 토글 */}
      <FormInputRow
        type="toggle"
        control={control}
        name="notifyOn"
        label="알림"
        showDivider={false}
      >
        {notifyOn && (
          <TimeDropdown
            ampm={watch('ampm')}
            hour={watch('hour12')}
            minute={watch('minute')}
            onChange={({ ampm, hour, minute }) => {
              setValue('ampm', ampm)
              setValue('hour12', hour)
              setValue('minute', minute)
            }}
          />
        )}
      </FormInputRow>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
})
