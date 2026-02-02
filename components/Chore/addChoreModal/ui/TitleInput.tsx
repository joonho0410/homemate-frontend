import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { Controller, UseFormReturn } from 'react-hook-form'

import { ChoreFormData } from '../schemas/choreFormSchema'

interface TitleInputProps {
  form: UseFormReturn<ChoreFormData, any>
  maxLength?: number
}

export default function TitleInput({ form, maxLength = 20 }: TitleInputProps) {
  const {
    control,
    formState: { errors },
  } = form

  return (
    <>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputRow}>
            <TextInput
              placeholder="집안일을 입력해주세요"
              placeholderTextColor="#9B9FA6"
              value={value}
              onChangeText={(text) => {
                // Limit to maxLength (handling emojis correctly)
                const limited = Array.from(text).slice(0, maxLength).join('')
                onChange(limited)
              }}
              onBlur={onBlur}
              maxLength={maxLength}
              style={[
                styles.textInput,
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
            />
            <Text style={styles.counterText}>
              {value.length}자/{maxLength}자
            </Text>
          </View>
        )}
      />

      {errors.title && <Text style={styles.warnText}>*{errors.title.message}</Text>}
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
