import { StatusBar } from 'expo-status-bar'

import ShowAllChoreModal from '@/components/Chore/showAllChoreModal'

export default function ShowAllChorePage() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#F8F8FA" />
      <ShowAllChoreModal />
    </>
  )
}
