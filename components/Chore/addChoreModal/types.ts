import { RandomChore } from '@/types/recommend'
import { UseFormReturn } from 'react-hook-form'
import { ChoreFormData } from './schemas/choreFormSchema'
import type { responseChoreDetail, ResponseChore } from '@/types/chore'

/**
 * ChoreMode: Modal 동작 모드
 * - add: 새 집안일 추가
 * - edit-instance: 특정 인스턴스 수정
 * - edit-routine: 루틴 전체 수정
 */
export type ChoreMode = 'add' | 'edit-instance' | 'edit-routine'

/**
 * Container Props - index.tsx에서 Container로 전달
 */
export interface ContainerProps {
  mode: ChoreMode
  instanceId?: number
  choreId?: number
  selectedDate?: string
  // 데이터는 index.tsx에서 fetch하여 전달
  instanceDetail?: responseChoreDetail | null
  routineDetail?: ResponseChore['data'] | null
}

/**
 * Modal 상태 관리
 */
export interface ModalState {
  deleteOpen: boolean
  updateOpen: boolean
}

/**
 * UI Config - mode에 따른 UI 분기 설정
 */
export interface PresenterConfig {
  headerTitle: string
  submitLabel: string
  showDeleteButton: boolean
  showRecommendChips: boolean
  showUpdateModal: boolean
}

/**
 * Handlers - Container에서 정의, Presenter로 전달
 */
export interface Handlers {
  onSubmitPress: () => void | Promise<void>
  onDelete: (applyToAfter: boolean) => void
  openDeleteModal: () => void
  closeDeleteModal: () => void
  openUpdateModal: () => void
  closeUpdateModal: () => void
  onUpdateOnly: () => void
  onUpdateAll: () => void
}

/**
 * Recommendations 관련 props
 */
export interface RecommendationsData {
  randomChores: RandomChore[]
  isLoading: boolean
  isRefetching: boolean
  onSelect: (id: number) => void
  onRefresh: () => void
}

/**
 * Presenter Props - Container에서 Presenter로 전달
 */
export interface PresenterProps {
  config: PresenterConfig
  form: UseFormReturn<ChoreFormData>
  canSubmit: boolean
  isSubmitting: boolean
  deleting: boolean
  modalState: ModalState
  handlers: Handlers
  recommendations: RecommendationsData | null
  // DeleteModal에 필요한 repeatType
  repeatType?: string
}

/**
 * Helper functions for config
 */
export function getHeaderTitle(mode: ChoreMode): string {
  switch (mode) {
    case 'edit-instance':
      return '집안일 수정'
    case 'edit-routine':
      return '집안일 수정'
    default:
      return '집안일 추가'
  }
}

export function getSubmitLabel(mode: ChoreMode): string {
  switch (mode) {
    case 'edit-instance':
      return '수정하기'
    case 'edit-routine':
      return '수정하기'
    default:
      return '추가하기'
  }
}
