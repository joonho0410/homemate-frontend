import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'

const MAX_LEN = 20

interface ChoreInputProps {
  value: string
  onChange: (text: string) => void
  hasForbiddenChar: boolean
}

export default function ChoreInput({ value, onChange, hasForbiddenChar }: ChoreInputProps) {
  return (
    <>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="집안일을 입력해주세요"
          placeholderTextColor="#9B9FA6"
          value={value}
          onChangeText={onChange}
          maxLength={MAX_LEN}
          style={[styles.textInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
        />
        <Text style={styles.counterText}>
          {value.length}자/{MAX_LEN}자
        </Text>
      </View>

      {hasForbiddenChar && <Text style={styles.warnText}>*특수문자를 제외해주세요</Text>}
    </>
  )
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E2025',
    paddingVertical: 12,
  },
  counterText: {
    fontSize: 12,
    color: '#9B9FA6',
    marginLeft: 8,
  },
  warnText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
})
