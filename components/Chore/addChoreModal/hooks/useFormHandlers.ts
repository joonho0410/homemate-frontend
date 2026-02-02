import { useCallback, useMemo, useState } from 'react'
import type { Handlers, ModalState } from '../types'

interface UseFormHandlersParams {
  showUpdateModal: boolean
  onSubmit: (applyToAfter: boolean) => Promise<void>
  handleDelete: (applyToAfter: boolean) => void
}

export function useFormHandlers({
  showUpdateModal,
  onSubmit,
  handleDelete,
}: UseFormHandlersParams) {
  const [modalState, setModalState] = useState<ModalState>({
    deleteOpen: false,
    updateOpen: false,
  })

  const openDeleteModal = useCallback(() => {
    setModalState((s) => ({ ...s, deleteOpen: true }))
  }, [])

  const closeDeleteModal = useCallback(() => {
    setModalState((s) => ({ ...s, deleteOpen: false }))
  }, [])

  const openUpdateModal = useCallback(() => {
    setModalState((s) => ({ ...s, updateOpen: true }))
  }, [])

  const closeUpdateModal = useCallback(() => {
    setModalState((s) => ({ ...s, updateOpen: false }))
  }, [])

  const onSubmitPress = useCallback(async () => {
    if (showUpdateModal) {
      openUpdateModal()
    } else {
      await onSubmit(false)
    }
  }, [showUpdateModal, onSubmit, openUpdateModal])

  const onUpdateOnly = useCallback(async () => {
    await onSubmit(false)
    setModalState((s) => ({ ...s, updateOpen: false }))
  }, [onSubmit])

  const onUpdateAll = useCallback(async () => {
    await onSubmit(true)
    setModalState((s) => ({ ...s, updateOpen: false }))
  }, [onSubmit])

  const handlers: Handlers = useMemo(
    () => ({
      onSubmitPress,
      onDelete: handleDelete,
      openDeleteModal,
      closeDeleteModal,
      openUpdateModal,
      closeUpdateModal,
      onUpdateOnly,
      onUpdateAll,
    }),
    [
      onSubmitPress,
      handleDelete,
      openDeleteModal,
      closeDeleteModal,
      openUpdateModal,
      closeUpdateModal,
      onUpdateOnly,
      onUpdateAll,
    ]
  )

  return { modalState, handlers }
}
