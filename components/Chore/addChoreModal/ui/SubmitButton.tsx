import { useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

interface SubmitButtonProps {
  onPress: () => void | Promise<void>
  disabled: boolean
  label: string
}

export default function SubmitButton({ onPress, disabled, label }: SubmitButtonProps) {
  const [isPressing, setIsPressing] = useState(false)
  const isDisabled = disabled || isPressing

  const handlePress = async () => {
    if (isDisabled) return
    setIsPressing(true)
    try {
      await onPress()
    } finally {
      setIsPressing(false)
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={[styles.submitBtn, isDisabled ? styles.submitBtnDisabled : styles.submitBtnActive]}
    >
      <Text style={[styles.submitText, isDisabled ? styles.submitTextDisabled : styles.submitTextActive]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  submitBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitBtnActive: {
    backgroundColor: '#57C9D0',
  },
  submitBtnDisabled: {
    backgroundColor: '#E6E7E9',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitTextActive: {
    color: '#FFFFFF',
  },
  submitTextDisabled: {
    color: '#B4B7BC',
  },
})
