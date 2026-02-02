import { createContext, ReactNode, useContext, useRef, useState } from 'react'
import { Modal, Pressable, StyleSheet, StyleProp, Text, View, ViewStyle } from 'react-native'

const Dropdown = { Root, Trigger, Menu, Item, Label, useContext: useDropdownContext }
export default Dropdown

// Compound Compoents
function Root({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)

  return (
    <DropdownContext.Provider value={{ isOpen, open, close, toggle, position, setPosition }}>
      {children}
    </DropdownContext.Provider>
  )
}

function Trigger({
  children,
  style,
  onPressIn,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  onPressIn?: () => void
}) {
  const triggerRef = useRef<View>(null)
  const { toggle, setPosition } = useDropdownContext()

  const handlePress = () => {
    onPressIn?.()
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setPosition({ x, y, width, height })
      toggle()
    })
  }

  return (
    <Pressable ref={triggerRef} onPress={handlePress} style={style}>
      {children}
    </Pressable>
  )
}

function Label({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.label, style]}>
      {typeof children === 'string' ? <Text style={styles.labelText}>{children}</Text> : children}
      <Text style={styles.arrow}>▼</Text>
    </View>
  )
}

type MenuProps = {
  children: ReactNode
  style?: ViewStyle
  align?: 'left' | 'right'
}

function Menu({ children, style, align = 'left' }: MenuProps) {
  const { isOpen, close, position } = useDropdownContext()
  const [menuWidth, setMenuWidth] = useState(0)

  if (!isOpen) return null

  // 오른쪽 정렬: 메뉴의 오른쪽 끝을 트리거의 오른쪽 끝에 맞춤
  const leftPosition =
    align === 'right' && menuWidth > 0 ? position.x + position.width - menuWidth : position.x

  return (
    <Modal transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <View
          style={[
            styles.menu,
            { top: position.y + position.height + 4, left: leftPosition },
            style,
          ]}
          onLayout={(e) => setMenuWidth(e.nativeEvent.layout.width)}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  )
}

type ItemProps = {
  children: ReactNode
  onSelect: () => void
  isSelected?: boolean
  style?: ViewStyle
}

function Item({ children, onSelect, isSelected, style }: ItemProps) {
  const { close } = useDropdownContext()

  const handlePress = () => {
    onSelect()
    close()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.item, isSelected && styles.itemSelected, style]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { position: 'relative' },

  overlay: { flex: 1, backgroundColor: 'transparent' },

  menu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 100,
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  item: { paddingHorizontal: 16, paddingVertical: 12 },
  itemSelected: { backgroundColor: '#F3F4F6' },
  itemText: { fontSize: 14, color: '#374151', textAlign: 'center' },
  itemTextSelected: { fontWeight: '600', color: '#3B82F6' },

  label: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  labelText: { fontSize: 14, color: '#374151' },
  arrow: { fontSize: 10, color: '#6B7280' },
})

// Context
type DropdownContextType = {
  isOpen: boolean
  position: { x: number; y: number; width: number; height: number }
  open: () => void
  close: () => void
  toggle: () => void
  setPosition: (pos: { x: number; y: number; width: number; height: number }) => void
}

const DropdownContext = createContext<DropdownContextType | null>(null)

function useDropdownContext() {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('Dropdown 컴포넌트는 Dropdown.Root 내부에서 사용해야 합니다.')
  }
  return context
}
