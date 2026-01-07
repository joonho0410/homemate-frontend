import { useState } from 'react'

export function useChoreFormUI() {
  // 캘린더 모달 상태
  const [openCalendar, setOpenCalendar] = useState<'start' | 'end' | null>(null)

  // 드롭다운 활성화 상태
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // 삭제 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const openDeleteModal = () => setDeleteModalOpen(true)
  const closeDeleteModal = () => setDeleteModalOpen(false)

  // 수정 모달 상태
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const openUpdateModal = () => setUpdateModalOpen(true)
  const closeUpdateModal = () => setUpdateModalOpen(false)

  // 반복 일정 수정 옵션
  const [applyToAfter, setApplyToAfter] = useState<boolean | null>(null)

  return {
    openCalendar,
    setOpenCalendar,
    activeDropdown,
    setActiveDropdown,
    deleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    updateModalOpen,
    openUpdateModal,
    closeUpdateModal,
    applyToAfter,
    setApplyToAfter,
  }
}
