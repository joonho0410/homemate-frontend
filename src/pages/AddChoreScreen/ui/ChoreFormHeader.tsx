import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface ChoreFormHeaderProps {
  isEdit: boolean
  onBack: () => void
  onDelete: () => void
  deleting: boolean
}

export default function ChoreFormHeader({
  isEdit,
  onBack,
  onDelete,
  deleting,
}: ChoreFormHeaderProps) {
  const headerTitle = isEdit ? '집안일 수정' : '집안일 추가'

  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={onBack} style={styles.headerBack}>
        <MaterialIcons name="chevron-left" size={28} color="#686F79" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{headerTitle}</Text>

      {isEdit && (
        <TouchableOpacity onPress={onDelete} style={styles.headerRight} disabled={deleting}>
          <Text style={styles.deleteText}>삭제</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  headerBack: { position: 'absolute', left: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2025' },
  headerRight: { position: 'absolute', right: 16 },
  deleteText: { fontSize: 16, color: '#FF4444' },
})
