import { ReactNode } from 'react'
import { Control, Controller, FieldError, FieldPath, FieldValues } from 'react-hook-form'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'

import { FormCalendarInput, FormSelectInput } from '@/components/shared/form'
import Toggle from '@/components/Toggle'

interface BaseProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  showDivider?: boolean
  error?: FieldError
  style?: ViewStyle
}

interface SelectInputProps<T extends FieldValues> extends BaseProps<T> {
  type: 'select'
  options: string[]
  placeholder?: string
  disableSelectedHighlight?: boolean
}

interface CalendarInputProps<T extends FieldValues> extends BaseProps<T> {
  type: 'calendar'
  defaultDate?: string
}

interface ToggleInputProps<T extends FieldValues> extends BaseProps<T> {
  type: 'toggle'
  children?: ReactNode
}

type FormInputRowProps<T extends FieldValues> =
  | SelectInputProps<T>
  | CalendarInputProps<T>
  | ToggleInputProps<T>

/**
 * 폼 입력 행 공통 컴포넌트
 * - 라벨 + 입력 컴포넌트 레이아웃
 * - 구분선 및 에러 메시지 처리
 */
export default function FormInputRow<T extends FieldValues>(props: FormInputRowProps<T>) {
  const { control, name, label, showDivider = true, error, style, type } = props

  const needsRelative = type === 'calendar'

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <FormSelectInput
            control={control}
            name={name}
            options={(props as SelectInputProps<T>).options}
            placeholder={(props as SelectInputProps<T>).placeholder}
            disableSelectedHighlight={(props as SelectInputProps<T>).disableSelectedHighlight}
          />
        )

      case 'calendar':
        return (
          <FormCalendarInput
            control={control}
            name={name}
            defaultDate={(props as CalendarInputProps<T>).defaultDate}
          />
        )

      case 'toggle':
        return (
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
              <Toggle value={value as boolean} onChange={onChange} />
            )}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      <View style={[styles.rowBetween, needsRelative && styles.relative, style]}>
        <Text style={styles.label}>{label}</Text>
        {renderInput()}
      </View>

      {error && <Text style={styles.errorMsg}>{error.message}</Text>}

      {type === 'toggle' && (props as ToggleInputProps<T>).children}

      {showDivider && <View style={styles.divider} />}
    </>
  )
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relative: {
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#363F4D',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E7E9',
    marginVertical: 12,
  },
  errorMsg: {
    fontSize: 12,
    color: '#FF0707',
    marginTop: 8,
  },
})
