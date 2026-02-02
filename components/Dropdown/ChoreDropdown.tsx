import { useRef, useState } from 'react'
import {
  Image,
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type DropdownProps = {
  options: string[]
  value: string | null
  onChange: (v: string) => void
  placeholder?: string
}

type Anchor = { x: number; y: number; w: number; h: number } | null

export default function ChoreDropdown({
  options,
  value,
  onChange,
  placeholder,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const triggerRef = useRef<View>(null)
  const [anchor, setAnchor] = useState<Anchor>(null)

  const close = () => setIsOpen(false)

  const measureTrigger = () => {
    const inst = triggerRef.current as any
    if (inst && typeof inst.measureInWindow === 'function') {
      inst.measureInWindow((x: number, y: number, w: number, h: number) => {
        setAnchor({ x, y, w, h })
      })
    }
  }

  const open = () => {
    setIsOpen(true)
    setTimeout(measureTrigger, 0)
  }

  const toggle = () => {
    if (isOpen) close()
    else open()
  }

  const onTriggerLayout = (_e: LayoutChangeEvent) => {
    if (isOpen) setTimeout(measureTrigger, 0)
  }

  const MENU_WIDTH = 160
  const menuStyle = () => {
    if (!anchor) return { top: 0, left: 0, width: MENU_WIDTH }
    const top = anchor.y + anchor.h + 8
    const left = Math.max(8, anchor.x + anchor.w - MENU_WIDTH)
    return { top, left, width: MENU_WIDTH }
  }

  return (
    <>
      <View ref={triggerRef} onLayout={onTriggerLayout}>
        <Pressable onPress={toggle} style={styles.pressable}>
          <Text style={styles.label}>
            {value != null && value !== '' ? value : (placeholder ?? '선택')}
          </Text>
          <Image
            source={require('../../assets/images/arrow/dropdown.svg')}
            style={styles.icon}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* 최상위 레이어 Modal */}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={close} pointerEvents="box-only" />

          <View style={[styles.dropdown, menuStyle()]} pointerEvents="auto">
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((opt, i) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    onChange(opt)
                    close()
                  }}
                  style={styles.itemPressable}
                >
                  <Text style={styles.option}>{opt}</Text>
                  {i < options.length - 1 && <View style={styles.divider} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemPressable: {
    paddingVertical: 2,
  },
  label: { color: '#686F79', fontSize: 14 },
  icon: { width: 12, height: 22 },

  modalRoot: {
    ...StyleSheet.absoluteFillObject,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },

  dropdown: {
    position: 'absolute',
    zIndex: 2,
    elevation: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  option: { fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: '#E6E7E9',
    marginTop: 8,
    marginBottom: 8,
  },
})
