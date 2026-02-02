import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface ModalHeaderProps {
  title: string
  showDeleteButton: boolean
  onDeletePress: () => void
  deleting: boolean
}

export default function ModalHeader({ title, showDeleteButton, onDeletePress, deleting }: ModalHeaderProps) {
  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(tabs)/home')
    }
  }, [])

  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={handleClose} style={styles.headerBack}>
        <MaterialIcons name="chevron-left" size={28} color="#686F79" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>

      {showDeleteButton && (
        <TouchableOpacity onPress={onDeletePress} style={styles.headerRight} disabled={deleting}>
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
    marginBottom: 11,
    position: 'relative',
    height: 62,
  },
  headerBack: {
    position: 'absolute',
    left: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111111',
  },
  headerRight: {
    position: 'absolute',
    right: 0,
  },
  deleteText: {
    fontSize: 16,
    color: '#57C9D0',
    fontWeight: '600',
  },
})
