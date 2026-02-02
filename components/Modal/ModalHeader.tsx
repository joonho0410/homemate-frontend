import { MaterialIcons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'

type ModalHeaderProps = {
  title: string
  onClose: () => void
}

export default function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={onClose} style={styles.headerBack}>
        <MaterialIcons name="chevron-left" size={28} color="#686F79" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  )
}

const styles = {
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
    position: 'relative',
    height: 62,
  },
  headerBack: { position: 'absolute', left: 0 },
  headerRight: { position: 'absolute', right: 0 },
  headerTitle: { fontSize: 20, fontWeight: 600 as any, color: '#111111' },
} as const
