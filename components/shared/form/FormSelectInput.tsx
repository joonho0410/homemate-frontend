import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { Image, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import Dropdown from '../component/Dropdown'

interface CustomStyles {
  trigger?: ViewStyle
  triggerText?: TextStyle
  menu?: ViewStyle
  item?: ViewStyle
  itemText?: TextStyle
}

interface FormSelectInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  options: string[]
  placeholder?: string
  style?: ViewStyle
  customStyles?: CustomStyles
  /** 선택된 아이템의 하이라이트 스타일 비활성화 */
  disableSelectedHighlight?: boolean
}

export default function FormSelectInput<T extends FieldValues>({
  control,
  name,
  options,
  placeholder = '선택',
  style,
  customStyles,
  disableSelectedHighlight = false,
}: FormSelectInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <Dropdown.Root>
          <Dropdown.Trigger style={[styles.trigger, customStyles?.trigger, style]}>
            <Text style={[styles.triggerText, customStyles?.triggerText]}>
              {value != null && value !== '' ? value : placeholder}
            </Text>
            <Image
              source={require('../../../assets/images/arrow/dropdown.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </Dropdown.Trigger>

          <Dropdown.Menu style={[styles.menu, customStyles?.menu]} align="right">
            {options.map((opt, i) => (
              <View key={opt}>
                <Dropdown.Item
                  onSelect={() => onChange(opt)}
                  isSelected={!disableSelectedHighlight && value === opt}
                  style={[styles.item, customStyles?.item]}
                >
                  <Text style={[styles.itemText, customStyles?.itemText]}>{opt}</Text>
                </Dropdown.Item>
                {i < options.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Dropdown.Menu>
        </Dropdown.Root>
      )}
    />
  )
}

// 기본 스타일 (ChoreDropdown 스타일)
const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerText: {
    color: '#686F79',
    fontSize: 14,
  },
  icon: {
    width: 12,
    height: 22,
  },
  menu: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minWidth: 160,
  },
  item: {
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  itemText: {
    fontSize: 14,
    color: '#111111',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E7E9',
    marginVertical: 8,
  },
})

// TimeDropdown 스타일 (필요시 customStyles로 주입)
export const timeDropdownStyles: CustomStyles = {
  trigger: {
    backgroundColor: '#EBF9F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 75,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
  },
  triggerText: {
    color: '#46A1A6',
  },
  menu: {
    minWidth: 75,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#57C9D0',
    borderRadius: 8,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 4,
  },
  itemText: {
    color: '#46A1A6',
  },
}
