import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useChoreDetail } from '@/libs/hooks/chore/useChoreDetail'

import AddChoreModalContainer from './AddChoreModalContainer'
import { useChoreIdDetail } from './hooks/useChoreIdDetail'
import Layout from './layout'
import type { ChoreMode } from './types'

/**
 * URL param mode 변환 (기존 → 신규)
 * - 'add' → 'add'
 * - 'edit' → 'edit-instance'
 * - 'editChore' → 'edit-routine'
 */
function normalizeMode(modeParam?: string): ChoreMode {
  switch (modeParam) {
    case 'edit':
      return 'edit-instance'
    case 'editChore':
      return 'edit-routine'
    default:
      return 'add'
  }
}

/**
 * 초기 ChoreData 페칭 관리
 * add -> 없음
 * edit -> Id 혹은 instance의 data 페칭
 */
export default function AddChoreModal() {
  const {
    mode: modeParam,
    instanceId: instanceIdParam,
    choreId: choreIdParam,
    selectedDate: selectedDateParam,
  } = useLocalSearchParams<{
    mode?: string
    instanceId?: string
    choreId?: string
    selectedDate?: string
  }>()

  const mode = normalizeMode(modeParam)
  const instanceId = instanceIdParam ? Number(instanceIdParam) : undefined
  const choreId = choreIdParam ? Number(choreIdParam) : undefined
  const selectedDate = selectedDateParam

  // ===== Mode별 데이터 fetch =====
  const shouldFetchInstance = mode === 'edit-instance' && !!instanceId
  const shouldFetchRoutine = mode === 'edit-routine' && !!choreId

  const {
    data: instanceDetail,
    isLoading: loadingInstance,
    isError: errorInstance,
  } = useChoreDetail(shouldFetchInstance ? instanceId : 0)
  const {
    data: routineDetail,
    isLoading: loadingId,
    isError: errorId,
  } = useChoreIdDetail({
    choreId: shouldFetchRoutine ? choreId! : 0,
  })

  const isLoading = (shouldFetchInstance && loadingInstance) || (shouldFetchRoutine && loadingId)
  const isError = errorInstance || errorId

  if (isLoading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#57C9D0" />
        </View>
      </Layout>
    )
  }

  // Todo: Error처리.
  if (isError) return null

  return (
    <Layout>
      <AddChoreModalContainer
        mode={mode}
        instanceId={instanceId}
        choreId={choreId}
        selectedDate={selectedDate}
        instanceDetail={instanceDetail}
        routineDetail={routineDetail}
      />
    </Layout>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

// Re-export ChoreMode for backwards compatibility
export type { ChoreMode } from './types'
