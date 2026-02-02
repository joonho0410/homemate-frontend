import { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.kbView}
    >
      <View style={styles.wrapper}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            // scrollEnabled={!overlayOpen}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  kbView: { flex: 1, backgroundColor: '#F8F8FA' },
  wrapper: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 20,
  },

  scroll: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: '#F8F8FA',
  },
  scrollContent: {
    paddingBottom: 120, // 하단 버튼 영역 만큼 확보
  },
})
