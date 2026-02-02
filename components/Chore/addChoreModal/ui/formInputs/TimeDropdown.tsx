import { ScrollView, StyleSheet, Text, View } from 'react-native'

import Dropdown from '@/components/shared/component/Dropdown'

type AmPm = '오전' | '오후'

type TimeValue = {
  ampm: AmPm
  hour: number
  minute: number
}

type Props = TimeValue & {
  onChange: (value: TimeValue) => void
}

const AMPM_OPTIONS: AmPm[] = ['오전', '오후']
const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1) // [1, 2, ... 12]
const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5) // [0, 5, ... 55]

export default function TimeDropdown({ ampm, hour, minute, onChange }: Props) {
  return (
    <View style={styles.container}>
      {/* 오전/오후 */}
      <View style={styles.mr14}>
        <Dropdown.Root>
          <Dropdown.Trigger style={styles.box}>
            <Text style={styles.boxText}>{ampm}</Text>
          </Dropdown.Trigger>

          <Dropdown.Menu style={styles.menu} align="left">
            {AMPM_OPTIONS.map((opt) => (
              <Dropdown.Item
                key={opt}
                onSelect={() => onChange({ ampm: opt, hour, minute })}
                isSelected={opt === ampm}
                style={styles.option}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Root>
      </View>

      {/* 시 */}
      <View style={styles.hourContainer}>
        <Dropdown.Root>
          <Dropdown.Trigger style={styles.box}>
            <Text style={styles.boxText}>{hour}</Text>
          </Dropdown.Trigger>

          <Dropdown.Menu style={[styles.menu, styles.scrollMenu]} align="left">
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {hourOptions.map((opt) => (
                <Dropdown.Item
                  key={opt}
                  onSelect={() => onChange({ ampm, hour: opt, minute })}
                  isSelected={opt === hour}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </Dropdown.Item>
              ))}
            </ScrollView>
          </Dropdown.Menu>
        </Dropdown.Root>
        <Text style={styles.unitText}>시</Text>
      </View>

      {/* 분 */}
      <View style={styles.minuteContainer}>
        <Dropdown.Root>
          <Dropdown.Trigger style={styles.box}>
            <Text style={styles.boxText}>{String(minute).padStart(2, '0')}</Text>
          </Dropdown.Trigger>

          <Dropdown.Menu style={[styles.menu, styles.scrollMenu]} align="left">
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {minuteOptions.map((opt) => (
                <Dropdown.Item
                  key={opt}
                  onSelect={() => onChange({ ampm, hour, minute: opt })}
                  isSelected={opt === minute}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{String(opt).padStart(2, '0')}</Text>
                </Dropdown.Item>
              ))}
            </ScrollView>
          </Dropdown.Menu>
        </Dropdown.Root>
        <Text style={styles.unitText}>분</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 16,
  },
  mr14: {
    marginRight: 14,
  },
  hourContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 5,
  },
  minuteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  box: {
    backgroundColor: '#EBF9F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 75,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxText: {
    color: '#46A1A6',
    fontSize: 14,
  },
  menu: {
    minWidth: 75,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#57C9D0',
  },
  scrollMenu: {
    maxHeight: 160,
  },
  scroll: {
    maxHeight: 152,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 4,
  },
  optionText: {
    color: '#46A1A6',
    fontSize: 14,
  },
  unitText: {
    fontSize: 14,
    marginTop: 10,
    marginLeft: 5,
    color: '#686F79',
  },
})
