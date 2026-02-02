import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

type Props = {
  visible: boolean
  onClose: () => void
  onUpdateOnly: () => void | Promise<void>
  onUpdateAll: () => void | Promise<void>
  loading?: boolean
}

export default function UpdateModal({
  visible,
  onClose,
  onUpdateOnly,
  onUpdateAll,
  loading = false,
}: Props) {
  const [isPressing, setIsPressing] = useState(false)
  const isDisabled = loading || isPressing

  const handleUpdateOnly = async () => {
    if (isDisabled) return
    setIsPressing(true)
    try {
      await onUpdateOnly()
    } finally {
      setIsPressing(false)
    }
  }

  const handleUpdateAll = async () => {
    if (isDisabled) return
    setIsPressing(true)
    try {
      await onUpdateAll()
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
      <View style={styles.container} pointerEvents="box-none">
        <Pressable
          onPress={!isDisabled ? onClose : undefined}
          style={styles.backdrop}
        />

        <View style={styles.sheet}>
          <Text style={styles.sheetHandle} />

          <View style={styles.gap}>
            <View style={styles.gap}>
              <View style={styles.mb8}>
                <Pressable
                  onPress={handleUpdateOnly}
                  disabled={isDisabled}
                  style={[styles.primaryBtnTextWrap, isDisabled && styles.disabledBtn]}
                >
                  <Text style={[styles.primaryBtnText, isDisabled && styles.disabledBtnText]}>이 일정만 수정</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleUpdateAll}
                disabled={isDisabled}
                style={[styles.primaryBtnTextWrap, isDisabled && styles.disabledBtn]}
              >
                <Text style={[styles.primaryBtnText, isDisabled && styles.disabledBtnText]}>향후 일정 수정</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={!isDisabled ? onClose : undefined} disabled={isDisabled} style={styles.mt12}>
            <Text style={styles.cancelBtnText}>취소</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
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
    position: 'relative',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E6E7E9',
    marginBottom: 12,
  },
  gap: { gap: 8 },

  primaryBtnTextWrap: {
    width: '100%',
    height: 52,
    backgroundColor: '#DDF4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryBtnText: { color: '#46A1A6', fontWeight: '600', fontSize: 16 },
  disabledBtn: {
    backgroundColor: '#E6E7E9',
  },
  disabledBtnText: {
    color: '#B4B7BC',
  },

  mt12: { marginTop: 12 },
  mb8: { marginBottom: 8 },

  cancelBtnText: {
    width: '100%',
    height: 52,
    backgroundColor: '#040F200D',
    borderRadius: 12,
    textAlign: 'center',
    paddingVertical: 12,
    color: '#9B9FA6',
    fontWeight: '600',
    fontSize: 16,
  },
})
