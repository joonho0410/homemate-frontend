import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import ChoreDropdown from '@/components/Dropdown/ChoreDropdown'
import TimeDropdown from '@/components/Dropdown/TimeDropdown'
import Toggle from '@/components/Toggle'
import {
  DateFieldProps,
  NotificationFieldProps,
  SelectFieldProps,
  UIStateProps,
} from '@/src/pages/AddChoreScreen/model/types'

interface FormFieldsProps {
  spaceField: SelectFieldProps
  repeatField: SelectFieldProps
  dateField: DateFieldProps
  notificationField: NotificationFieldProps
  uiState: UIStateProps
  utils: { toYYMMDD: (s?: string | null) => string }
}

export default function FormFields(props: FormFieldsProps) {
  const { spaceField, repeatField, dateField, notificationField, uiState, utils } = props

  return (
    <View style={styles.card}>
      {/* 공간 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>공간</Text>
        <ChoreDropdown
          id="space"
          options={spaceField.options}
          value={spaceField.value}
          onChange={spaceField.onChange}
          placeholder="선택"
          activeDropdown={uiState.activeDropdown}
          setActiveDropdown={uiState.setActiveDropdown}
        />
      </View>

      <View style={styles.divider} />

      {/* 반복주기 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>반복주기</Text>
        <ChoreDropdown
          id="repeat"
          options={repeatField.options}
          value={repeatField.value}
          onChange={repeatField.onChange}
          placeholder="선택"
          activeDropdown={uiState.activeDropdown}
          setActiveDropdown={uiState.setActiveDropdown}
        />
      </View>

      <View style={styles.divider} />

      {/* 시작일자 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>시작일자</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={dateField.onStartPress}
          style={styles.dateBtn}
        >
          <Text style={styles.dateBtnText}>{utils.toYYMMDD(dateField.start)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 완료일자 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>완료일자</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={dateField.onEndPress} style={styles.dateBtn}>
          <Text style={styles.dateBtnText}>{utils.toYYMMDD(dateField.end)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 알림 토글 */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>알림</Text>
        <Toggle value={notificationField.enabled} onChange={notificationField.onToggle} />
      </View>

      {notificationField.enabled && (
        <TimeDropdown
          ampm={notificationField.ampm}
          hour={notificationField.hour12}
          minute={notificationField.minute}
          onChange={notificationField.onTimeChange}
          activeDropdown={uiState.activeDropdown}
          setActiveDropdown={uiState.setActiveDropdown}
        />
      )}
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
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
})
