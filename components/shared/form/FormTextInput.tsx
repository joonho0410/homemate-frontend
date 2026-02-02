import { Platform, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native'
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'

interface FormTextInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  placeholder?: string
  maxLength?: number
  showCounter?: boolean
  style?: ViewStyle
}

export default function FormTextInput<T extends FieldValues>({
  control,
  name,
  placeholder = '입력해주세요',
  maxLength = 20,
  showCounter = true,
  style,
}: FormTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <>
          <View style={[styles.inputRow, style]}>
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#9B9FA6"
              value={value}
              onChangeText={(text) => {
                const limited = Array.from(text).slice(0, maxLength).join('')
                onChange(limited)
              }}
              onBlur={onBlur}
              maxLength={maxLength}
              style={[styles.textInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
            />
            {showCounter && (
              <Text style={styles.counterText}>
                {(value as string)?.length || 0}자/{maxLength}자
              </Text>
            )}
          </View>
          {error && <Text style={styles.errorText}>*{error.message}</Text>}
        </>
      )}
    />
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
  errorText: {
    fontSize: 12,
    color: '#FF4838',
    marginBottom: 12,
    paddingLeft: 12,
  },
})
