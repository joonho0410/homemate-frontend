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
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  textInput: {
    fontSize: 14,
    flex: 1,
    minWidth: 0,
    padding: 0,
    color: '#000',
  },
  counterText: {
    fontSize: 12,
    color: '#B4B7BC',
  },
  warnText: {
    fontSize: 12,
    color: '#FF4838',
    marginBottom: 12,
    paddingLeft: 12,
  },
})
