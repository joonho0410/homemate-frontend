// FSD 리팩토링: 기존 코드는 아래에 주석으로 보존
// 새로운 구조: src/pages/AddChoreScreen

import AddChoreScreen from '@pages/AddChoreScreen'

export default function AddChorePage() {
  return <AddChoreScreen />
}

/*
========================================
기존 코드 (주석 처리 - 롤백용으로 보존)
========================================

import { StatusBar } from 'expo-status-bar'

import AddChoreModal from '@/components/Chore/AddChoreModal'

export default function AddChorePage() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#F8F8FA" />

      <AddChoreModal />
    </>
  )
}
*/
