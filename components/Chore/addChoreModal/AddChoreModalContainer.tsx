import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'

import { useChoreDeleteHandler } from './hooks/useChoreDeleteHandler'
import { useChoreForm } from './hooks/useChoreForm'
import { useChoreSubmitHandler } from './hooks/useChoreSubmitHandler'
import { useFormHandlers } from './hooks/useFormHandlers'
import { useRecommendations } from './hooks/useRecommendations'

import AddChoreModalPresenter from './AddChoreModalPresenter'
import type { ContainerProps, PresenterConfig } from './types'
import { getHeaderTitle, getSubmitLabel } from './types'

/**
 * mode에 따른 Form(UI) 및 Handlers(이벤트) 구성
 */
export default function AddChoreModalContainer({
  mode,
  instanceId,
  choreId,
  selectedDate,
  instanceDetail,
  routineDetail,
}: ContainerProps) {
  // ===== 1. Form 훅 사용 =====
  const { form, canSubmit, isRepeating, originalRepeat, userNotificationTime, userId } =
    useChoreForm({
      mode,
      instanceDetail,
      routineDetail,
      selectedDate,
    })

  const { handleSubmit, setValue, trigger } = form

  // ===== 2. 로컬 상태 =====
  const [fromRecommendChip, setFromRecommendChip] = useState(false)

  // ===== 3. Close modal helper =====
  const closeModal = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(tabs)/home')
    }
  }, [])

  // ===== 4. Submit 훅 =====
  const { submitChore, isSubmitting } = useChoreSubmitHandler({
    mode,
    instanceId,
    choreId,
    originalRepeat,
    fromRecommendChip,
    userId,
    closeModal,
  })

  // ===== 5. Delete 훅 =====
  const { handleDelete, deleting } = useChoreDeleteHandler({
    mode,
    instanceId,
    choreId,
    selectedDate,
    userId,
    closeModal,
  })

  // ===== 6. Submit handler (applyToAfter를 인자로 받음) =====
  const onSubmit = useCallback(
    (applyToAfter: boolean) => handleSubmit((data) => submitChore(data, applyToAfter))(),
    [handleSubmit, submitChore]
  )

  // ===== 7. Config 계산 =====
  const config: PresenterConfig = useMemo(
    () => ({
      headerTitle: getHeaderTitle(mode),
      submitLabel: getSubmitLabel(mode),
      showDeleteButton: mode !== 'add',
      showRecommendChips: mode === 'add',
      showUpdateModal: mode === 'edit-instance' && isRepeating,
    }),
    [mode, isRepeating]
  )

  // ===== 8. Handlers 훅 =====
  const { modalState, handlers } = useFormHandlers({
    showUpdateModal: config.showUpdateModal,
    onSubmit,
    handleDelete,
  })

  // ===== 9. Recommendations (add 모드 전용) =====
  const recommendations = useRecommendations({
    enabled: mode === 'add',
    setValue,
    trigger,
    setFromRecommendChip,
    userDefaultTime: userNotificationTime,
  })

  // ===== 10. repeatType for DeleteModal =====
  const repeatType = useMemo(() => {
    if (mode === 'edit-routine' && routineDetail) return routineDetail.repeatType
    if (mode === 'edit-instance' && instanceDetail) return instanceDetail.repeatType
    return 'NONE'
  }, [mode, instanceDetail, routineDetail])

  return (
    <AddChoreModalPresenter
      config={config}
      form={form}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      deleting={deleting}
      modalState={modalState}
      handlers={handlers}
      recommendations={recommendations}
      repeatType={repeatType}
    />
  )
}
