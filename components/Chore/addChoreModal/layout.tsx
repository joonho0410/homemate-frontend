import { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet } from 'react-native'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.kbView}
    >
      <StatusBar backgroundColor="#F8F8FA" barStyle="dark-content" />
      {children}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  kbView: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
})
