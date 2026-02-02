import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { RepeatType } from '@/types/chore'

type Props = {
  visible: boolean
  onClose: () => void
  onDeleteOnly: () => void | Promise<void>
  onDeleteAll: () => void | Promise<void>
  loading?: boolean
  repeatType?: RepeatType
}

export default function DeleteModal({
  visible,
  onClose,
  onDeleteOnly,
  onDeleteAll,
  loading = false,
  repeatType = 'NONE',
}: Props) {
  const [isPressing, setIsPressing] = useState(false)
  const isDisabled = loading || isPressing
  const noneRepeat = repeatType === 'NONE'

  const handleDeleteOnly = async () => {
    if (isDisabled) return
    setIsPressing(true)
    try {
      await onDeleteOnly()
    } finally {
      setIsPressing(false)
    }
  }

  const handleDeleteAll = async () => {
    if (isDisabled) return
    setIsPressing(true)
    try {
      await onDeleteAll()
    } finally {
      setIsPressing(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable onPress={!isDisabled ? onClose : undefined} style={styles.backdrop} />
      <View style={styles.sheet}>
        <Text style={styles.sheetHandle} />

        {noneRepeat ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>일정을 삭제하시겠습니까?</Text>
          </View>
        ) : (
          <Pressable
            onPress={handleDeleteOnly}
            disabled={isDisabled}
            style={[styles.primaryBtn, styles.mb8, isDisabled && styles.disabledBtn]}
          >
            <Text style={[styles.primaryBtnText, isDisabled && styles.disabledBtnText]}>
              이 일정만 삭제
            </Text>
          </Pressable>
        )}

        {noneRepeat ? (
          <Pressable
            onPress={handleDeleteOnly}
            disabled={isDisabled}
            style={[styles.primaryBtn, styles.mb8, isDisabled && styles.disabledBtn]}
          >
            <Text style={[styles.primaryBtnText, isDisabled && styles.disabledBtnText]}>
              일정 삭제
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleDeleteAll}
            disabled={isDisabled}
            style={[styles.primaryBtn, styles.mb8, isDisabled && styles.disabledBtn]}
          >
            <Text style={[styles.primaryBtnText, isDisabled && styles.disabledBtnText]}>
              향후 일정 삭제
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={!isDisabled ? onClose : undefined}
          disabled={isDisabled}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>취소</Text>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E6E7E9',
    marginBottom: 12,
  },

  // banner for NONE
  banner: {
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    height: 48,
    marginBottom: 8,
    borderRadius: 0,
  },
  bannerText: {
    color: '#686F79',
    fontSize: 14,
  },

  // primary buttons
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#DDF4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: '#46A1A6',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledBtn: {
    backgroundColor: '#E6E7E9',
  },
  disabledBtnText: {
    color: '#B4B7BC',
  },
  mb8: { marginBottom: 8 },

  // cancel button
  cancelBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#040F200D',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontWeight: '600',
    fontSize: 16,
  },
})
