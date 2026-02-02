import { useRouter } from 'expo-router'
import { Platform } from 'react-native'

import ModalHeader from '@/components/Modal/ModalHeader'

import { FilterProvider } from './context/FilterContext'
import Layout from './layout'
import AllChoreFilters from './ui/AllChoreFilters'
import AllChoresList from './ui/AllChoresList'

export default function ShowAllChoreModal() {
  const router = useRouter()
  const closeModal = () => {
    if (Platform.OS === 'web') {
      // 웹(iOS Safari, PWA 포함)에서는 show-allChore 히스토리를 홈으로 교체
      router.replace('/(tabs)/home')
    } else {
      // 앱(native)에서는 기존처럼 뒤로가기
      router.back()
    }
  }

  return (
    <FilterProvider>
      <Layout>
        <ModalHeader title="전체 집안일" onClose={closeModal} />
        <AllChoreFilters />
        <AllChoresList />
      </Layout>
    </FilterProvider>
  )
}
