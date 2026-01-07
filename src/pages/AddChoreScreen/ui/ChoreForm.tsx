// ChoreForm.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import DatePickerCalendar from '@/components/Calendar/DatePickerCalendar'
import DeleteModal from '@/components/DeleteModal'
import UpdateModal from '@/components/UpdateModal'
import { useChoreDetail } from '@/libs/hooks/chore/useChoreDetail'
import { useMyPage } from '@/libs/hooks/mypage/useMyPage'
import useRandomChoreInfo from '@/libs/hooks/recommend/useRandomChoreInfo'
import { SPACE_UI_OPTIONS } from '@/libs/utils/space'
import RecommendChips from '@/src/features/chore/recommend/ui/RecommendChips'

// Custom hooks
import { useChoreFormData } from '../model/useChoreFormData'
import { useChoreFormSubmit } from '../model/useChoreFormSubmit'
import { useChoreFormUI } from '../model/useChoreFormUI'
import { useChoreFormValidation } from '../model/useChoreFormValidation'
import { useNotificationSettings } from '../model/useNotificationSettings'
import ChoreFormHeader from './ChoreFormHeader'
import ChoreInput from './ChoreInput'
import FormFields from './FormFields'

// Decomposed components

const MAX_LEN = 20

export default function ChoreForm() {
  const {
    mode: modeParam,
    instanceId: instanceIdParam,
    selectedDate: selectedDateParam,
  } = useLocalSearchParams<{
    mode?: string
    instanceId?: string
    choreId?: string
    selectedDate?: string
  }>()

  const isEdit = (modeParam ?? 'add') === 'edit'
  const instanceId = instanceIdParam ? Number(instanceIdParam) : undefined

  // ----- 유틸 -----
  const toYYMMDD = (s?: string | null) => {
    if (!s) return ''
    if (/^\d{2}\.\d{2}\.\d{2}$/.test(s)) return s
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return `${s.slice(2, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)}`
    }
    const d = new Date(s as string)
    if (!isNaN(d.getTime())) {
      const yy = String(d.getFullYear()).slice(2)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yy}.${mm}.${dd}`
    }
    return s || ''
  }

  const isYMD = (s: string | null | undefined): boolean => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)
  const safeYMD = (s: string | null | undefined, fallback: string): string =>
    isYMD(s) ? (s as string) : fallback

  // ----- Data fetching -----
  const instanceKey = isEdit && instanceId ? instanceId : 0
  const { data: detail, isLoading: loadingDetail } = useChoreDetail(instanceKey)
  const { data: user } = useMyPage()

  // ----- Custom hooks (상태 관리) -----
  const formDataHook = useChoreFormData({
    isEdit,
    detail,
    selectedDate: selectedDateParam,
  })

  const notificationHook = useNotificationSettings({
    userDefaultTime: user?.notificationTime,
    detail,
    isEdit,
  })

  const uiState = useChoreFormUI()

  const validation = useChoreFormValidation({
    formData: formDataHook.formData,
    notification: notificationHook.settings,
    isEdit,
    detail,
    isLoading: loadingDetail,
  })

  // ----- Custom hooks (비즈니스 로직) -----
  const submitHook = useChoreFormSubmit({
    isEdit,
    instanceId,
    selectedDate: selectedDateParam,
    userId: user?.id,
    initialValue: validation.initialValue,
    currentValue: validation.currentValue,
  })

  // ----- Recommendation -----
  const [spaceChoreId, setSpaceChoreId] = useState<number | null>(null)
  const [fromRecommend, setFromRecommend] = useState(false)
  const { data: recommendInfo } = useRandomChoreInfo(spaceChoreId as number)

  const applyRandomChore = useCallback(() => {
    if (!recommendInfo) return
    formDataHook.applyRecommendation(recommendInfo)
    notificationHook.applyRecommendation(recommendInfo.choreEnabled)
    setFromRecommend(true)
  }, [recommendInfo, formDataHook, notificationHook])

  useEffect(() => {
    applyRandomChore()
  }, [applyRandomChore])

  // ----- Options -----
  const spaceOptions = SPACE_UI_OPTIONS
  const repeatOptions = [
    '한번',
    '매일',
    '1주마다',
    '2주마다',
    '매달',
    '3개월마다',
    '6개월마다',
    '매년',
  ]

  // ----- Handlers -----
  const handleChangeText = (text: string) => {
    const limited = Array.from(text).slice(0, MAX_LEN).join('')
    formDataHook.setTitle(limited)
  }
  const router = useRouter()
  const closeAddChore = () => {
    if (Platform.OS === 'web') {
      router.replace('/(tabs)/home')
    } else {
      router.back()
    }
  }

  const isRepeating = (detail?.repeatType ?? 'NONE') !== 'NONE'

  const handleSubmit = () => {
    if (!validation.canSubmit) return

    const notificationTime = notificationHook.getFormattedTime()

    if (isEdit) {
      if (isRepeating && uiState.applyToAfter === null) {
        uiState.openUpdateModal()
        return
      }
      submitHook.handleUpdate(
        formDataHook.formData,
        notificationHook.settings,
        notificationTime,
        Boolean(uiState.applyToAfter),
        fromRecommend
      )
    } else {
      submitHook.handleCreate(
        formDataHook.formData,
        notificationHook.settings,
        notificationTime,
        fromRecommend
      )
    }
  }

  const handleDelete = (applyToAfter: boolean) => {
    submitHook.handleDelete(applyToAfter)
    uiState.closeDeleteModal()
  }

  // ----- UI State -----
  const submitDisabled =
    !validation.canSubmit ||
    submitHook.isSubmitting ||
    (isEdit && (loadingDetail || !validation.initialValue || !validation.isChanged))

  const overlayOpen = uiState.activeDropdown === 'space' || uiState.activeDropdown === 'repeat'

  const modalPadding =
    uiState.openCalendar === 'start'
      ? { paddingTop: 333, paddingRight: 25 }
      : { paddingTop: 383, paddingRight: 25 }

  const btnLabel = isEdit ? '수정하기' : '등록하기'

  return (
    <>
      <StatusBar backgroundColor="#F8F8FA" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kbView}
      >
        <View style={styles.wrapper}>
          <TouchableWithoutFeedback
            disabled={overlayOpen}
            onPress={() => {
              if (overlayOpen && uiState.activeDropdown) uiState.setActiveDropdown(null)
            }}
          >
            <View style={{ flex: 1 }}>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={!overlayOpen}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* 헤더 */}
                <ChoreFormHeader
                  isEdit={isEdit}
                  onBack={closeAddChore}
                  onDelete={uiState.openDeleteModal}
                  deleting={submitHook.isDeleting}
                />

                {isEdit && (
                  <DeleteModal
                    visible={uiState.deleteModalOpen}
                    onClose={uiState.closeDeleteModal}
                    onDeleteOnly={() => handleDelete(false)}
                    onDeleteAll={() => handleDelete(true)}
                    loading={submitHook.isDeleting}
                    repeatType={detail?.repeatType}
                  />
                )}

                {/* 내용 */}
                <View style={styles.flex1}>
                  {/* 집안일 입력 */}
                  <ChoreInput
                    value={formDataHook.formData.title}
                    onChange={handleChangeText}
                    hasForbiddenChar={validation.hasForbiddenChar}
                  />

                  {/* 추천 집안일 chips */}
                  <RecommendChips onSelectChore={(choreId: number) => setSpaceChoreId(choreId)} />

                  {/* 폼 필드 */}
                  <FormFields
                    spaceField={{
                      value: formDataHook.formData.space,
                      options: spaceOptions,
                      onChange: formDataHook.setSpace,
                    }}
                    repeatField={{
                      value: formDataHook.formData.repeat,
                      options: repeatOptions,
                      onChange: formDataHook.setRepeat,
                    }}
                    dateField={{
                      start: formDataHook.formData.startDate,
                      end: formDataHook.formData.endDate,
                      onStartChange: formDataHook.setStartDate,
                      onEndChange: formDataHook.setEndDate,
                      onStartPress: () => {
                        if (!isYMD(formDataHook.formData.startDate))
                          formDataHook.setStartDate(formDataHook.todayYMD)
                        uiState.setOpenCalendar(uiState.openCalendar === 'start' ? null : 'start')
                      },
                      onEndPress: () => {
                        if (!isYMD(formDataHook.formData.endDate))
                          formDataHook.setEndDate(
                            safeYMD(formDataHook.formData.startDate, formDataHook.todayYMD)
                          )
                        uiState.setOpenCalendar(uiState.openCalendar === 'end' ? null : 'end')
                      },
                    }}
                    notificationField={{
                      enabled: notificationHook.settings.enabled,
                      ampm: notificationHook.settings.ampm,
                      hour12: notificationHook.settings.hour12,
                      minute: notificationHook.settings.minute,
                      onToggle: notificationHook.setEnabled,
                      onTimeChange: notificationHook.setTime,
                    }}
                    uiState={{
                      activeDropdown: uiState.activeDropdown,
                      setActiveDropdown: uiState.setActiveDropdown,
                    }}
                    utils={{ toYYMMDD }}
                  />
                </View>
              </ScrollView>

              {/* 공간/반복 드롭다운 바깥 클릭 시 닫기용 오버레이 */}
              {overlayOpen && (
                <Pressable
                  onPress={() => uiState.setActiveDropdown(null)}
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      backgroundColor: 'transparent',
                      zIndex: 100,
                    },
                  ]}
                  pointerEvents="auto"
                />
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* 반복 일정 수정 모달 */}
          <UpdateModal
            visible={uiState.updateModalOpen}
            onClose={() => {
              uiState.closeUpdateModal()
              uiState.setApplyToAfter(null)
            }}
            onUpdateOnly={() => {
              uiState.setApplyToAfter(false)
              uiState.closeUpdateModal()
              handleSubmit()
            }}
            onUpdateAll={() => {
              uiState.setApplyToAfter(true)
              uiState.closeUpdateModal()
              handleSubmit()
            }}
            loading={submitHook.isSubmitting}
          />

          {/* 하단 버튼 */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitDisabled}
            style={[
              styles.submitBtn,
              submitDisabled ? styles.submitBtnDisabled : styles.submitBtnActive,
            ]}
          >
            <Text
              style={[
                styles.submitText,
                submitDisabled ? styles.submitTextDisabled : styles.submitTextActive,
              ]}
            >
              {btnLabel}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* 캘린더 Modal: start */}
      <Modal
        visible={uiState.openCalendar === 'start'}
        transparent
        animationType="none"
        onRequestClose={() => uiState.setOpenCalendar(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => uiState.setOpenCalendar(null)} />
        <View style={[styles.modalAnchorArea, modalPadding]} pointerEvents="box-none">
          <View
            style={styles.calendarPopover}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            <DatePickerCalendar
              selectedDate={safeYMD(formDataHook.formData.startDate, formDataHook.todayYMD)}
              onSelect={(d) => {
                formDataHook.setStartDate(d)
                uiState.setOpenCalendar(null)
              }}
              isOpen={true}
            />
          </View>
        </View>
      </Modal>

      {/* 캘린더 Modal: end */}
      <Modal
        visible={uiState.openCalendar === 'end'}
        transparent
        animationType="none"
        onRequestClose={() => uiState.setOpenCalendar(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => uiState.setOpenCalendar(null)} />
        <View style={[styles.modalAnchorArea, modalPadding]} pointerEvents="box-none">
          <View
            style={styles.calendarPopover}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            <DatePickerCalendar
              selectedDate={safeYMD(
                formDataHook.formData.endDate,
                safeYMD(formDataHook.formData.startDate, formDataHook.todayYMD)
              )}
              onSelect={(d) => {
                formDataHook.setEndDate(d)
                uiState.setOpenCalendar(null)
              }}
              isOpen={true}
            />
          </View>
        </View>
      </Modal>
    </>
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
    paddingBottom: 120,
  },

  flex1: { flex: 1 },

  calendarPopover: {
    width: 340,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  modalAnchorArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },

  submitBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitBtnActive: { backgroundColor: '#57C9D0' },
  submitBtnDisabled: { backgroundColor: '#E6E7E9' },
  submitText: { fontSize: 16, fontWeight: '600' },
  submitTextActive: { color: '#FFFFFF' },
  submitTextDisabled: { color: '#B4B7BC' },
})
