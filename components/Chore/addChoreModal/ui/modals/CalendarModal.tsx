import { Modal, Pressable, StyleSheet, View } from 'react-native'

import DatePickerCalendar from '@/components/Calendar/DatePickerCalendar'

interface CalendarModalProps {
  type: 'start' | 'end'
  visible: boolean
  selectedDate: string
  onSelect: (date: string) => void
  onClose: () => void
}

export default function CalendarModal({
  type,
  visible,
  selectedDate,
  onSelect,
  onClose,
}: CalendarModalProps) {
  const modalPadding =
    type === 'start' ? { paddingTop: 333, paddingRight: 25 } : { paddingTop: 383, paddingRight: 25 }

  const handleSelect = (date: string) => {
    onSelect(date)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={[styles.modalAnchorArea, modalPadding]} pointerEvents="box-none">
        <View
          style={styles.calendarPopover}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
        >
          <DatePickerCalendar selectedDate={selectedDate} onSelect={handleSelect} isOpen={true} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  modalAnchorArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  calendarPopover: {
    width: 340,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  },
})
