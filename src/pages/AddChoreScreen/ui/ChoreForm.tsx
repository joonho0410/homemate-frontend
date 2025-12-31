// ChoreForm.tsx
import { useQueryClient } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useDispatch } from 'react-redux'

import DatePickerCalendar from '@/components/Calendar/DatePickerCalendar'
import DeleteModal from '@/components/DeleteModal'
import UpdateModal from '@/components/UpdateModal'
import { getAcquiredBadges } from '@/libs/api/badge/getAcquiredBadges'
import { toApiError } from '@/libs/api/error'
import { useChoreDetail } from '@/libs/hooks/chore/useChoreDetail'
import useCreateChore from '@/libs/hooks/chore/useCreateChore'
import { useDeleteChore } from '@/libs/hooks/chore/useDeleteChore'
import useUpdateChore from '@/libs/hooks/chore/useUpdateChore'
import { useMyPage } from '@/libs/hooks/mypage/useMyPage'
import useRandomChoreInfo from '@/libs/hooks/recommend/useRandomChoreInfo'
import { isDateCompare, toYMD } from '@/libs/utils/date'
import { trackEvent } from '@/libs/utils/ga4'
import { getBadgeDesc } from '@/libs/utils/getBadgeDesc'
import { getNewlyAcquiredBadgeByTime } from '@/libs/utils/getNewlyAcquiredBadgeByTime'
import { toRepeatFields, toRepeatLabel } from '@/libs/utils/repeat'
import { SPACE_UI_OPTIONS, toSpaceApi, toSpaceUi } from '@/libs/utils/space'
import { toHHmm, toHHmmParts } from '@/libs/utils/time'
import RecommendChips from '@/src/features/chore/recommend/ui/RecommendChips'
import { openAchievementModal } from '@/store/slices/achievementModalSlice'
import { ResponseBadge } from '@/types/badge'
import { RandomChoreList } from '@/types/recommend'


// Decomposed components
import ChoreFormHeader from './ChoreFormHeader'
import ChoreInput from './ChoreInput'
import FormFields from './FormFields'


// 이모지(특수문자) 불가
const EMOJI_RE = /[\p{Extended_Pictographic}]/u

const missionIcon = require('@/assets/images/icon/missionIcon.png')

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
  const toBool = (v: unknown) => v === true || v === 'Y' || v === 'y' || v === 1 || v === '1'

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

  // ----- api 훅 -----
  const { mutate: createChore, isPending: creating } = useCreateChore()
  const { mutate: updateChore, isPending: updating } = useUpdateChore()
  const { mutate: deleteChore, isPending: deleting } = useDeleteChore()

  const [spaceChoreId, setSpaceChoreId] = useState<number | null>(null)
  const { data: randomChoreInfo } = useRandomChoreInfo(spaceChoreId as number)

  const instanceKey = isEdit && instanceId ? instanceId : 0
  const { data: detail, isLoading: loadingDetail } = useChoreDetail(instanceKey)
  const { data: user } = useMyPage()

  // ----- 상태관리 -----
  const [inputValue, setInputValue] = useState('')
  const todayYMD = useMemo(() => toYMD(new Date()), [])

  const [space, setSpace] = useState<string | null>(null)
  const [repeat, setRepeat] = useState<string | null>(null)

  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  const [openCalendar, setOpenCalendar] = useState<'start' | 'end' | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const [notifyOn, setNotifyOn] = useState(false)

  const userNoti = useMemo(
    () => toHHmmParts(user?.notificationTime), // "18:00" 같은 문자열 → { ampm, hour12, minute }
    [user?.notificationTime]
  )
  const [ampm, setAmpm] = useState<'오전' | '오후'>(userNoti.ampm)
  const [hour12, setHour12] = useState<number>(userNoti.hour12)
  const [minute, setMinute] = useState<number>(userNoti.minute)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [applyToAfter, setApplyToAfter] = useState<boolean | null>(null)

  // 집안일 추천 chip을 선택했는지 여부
  const [fromRecommendChip, setFromRecommendChip] = useState(false)

  const isDateRangeValid = isDateCompare(startDate, endDate)

  const dispatch = useDispatch()
  const qc = useQueryClient()

  // ----- 추천 집안일 자동 채우기 -----
  const applyRandomChore = useCallback(
    (c: RandomChoreList) => {
      setFromRecommendChip(true)

      setInputValue(c.titleKo)
      setSpace(toSpaceUi(c.space))
      setRepeat(toRepeatLabel(c.repeatType, c.repeatInterval))
      setStartDate(c.startDate)
      setEndDate(c.endDate)

      if (c.choreEnabled) {
        setNotifyOn(true)

        setAmpm(userNoti.ampm)
        setHour12(userNoti.hour12)
        setMinute(userNoti.minute)
      } else {
        setNotifyOn(false)
      }
    },
    [userNoti]
  ) // userNoti가 바뀔 때만 새 함수로 교체

  useEffect(() => {
    if (randomChoreInfo) applyRandomChore(randomChoreInfo)
  }, [randomChoreInfo, applyRandomChore])

  // ADD 기본값
  useEffect(() => {
    if (isEdit) return
    const base = isYMD(selectedDateParam) ? (selectedDateParam as string) : todayYMD
    setStartDate(base)
    setEndDate(base)
  }, [isEdit, selectedDateParam, todayYMD])

  // EDIT 값 채우기
  useEffect(() => {
    if (!isEdit || !detail) return
    setInputValue(detail.title ?? '')
    setNotifyOn(toBool(detail.notificationYn))
    setRepeat(toRepeatLabel(detail.repeatType, detail.repeatInterval))
    setSpace(toSpaceUi(detail.space) ?? null)
    setStartDate(detail.startDate ?? null)
    setEndDate(detail.endDate ?? null)

    const parts = toHHmmParts(detail.notificationTime ?? '09:00')
    setAmpm(parts.ampm)
    setHour12(parts.hour12)
    setMinute(parts.minute)
  }, [isEdit, detail])

  // ----- 변경 여부 비교 -----
  const initialValue = useMemo(() => {
    if (!isEdit || !detail) return
    const parts = toHHmmParts(detail.notificationTime ?? '09:00')
    return {
      title: (detail.title ?? '').trim(),
      notificationYn: toBool(detail.notificationYn),
      notificationTime: toHHmm(parts.ampm, parts.hour12, parts.minute),
      space: toSpaceUi(detail.space) ?? null,
      repeat: toRepeatLabel(detail.repeatType, detail.repeatInterval),
      startDate: detail.startDate ?? null,
      endDate: detail.endDate ?? detail.startDate ?? null,
    }
  }, [isEdit, detail])

  const currentValue = useMemo(() => {
    const hhmm = toHHmm(ampm, hour12, minute)
    return {
      title: inputValue.trim(),
      notificationYn: notifyOn,
      notificationTime: hhmm,
      space,
      repeat,
      startDate,
      endDate: endDate ?? startDate,
    }
  }, [inputValue, notifyOn, ampm, hour12, minute, space, repeat, startDate, endDate])

  const isChanged = useMemo(() => {
    if (!isEdit) return true
    if (!initialValue) return false

    const same = (a: any, b: any) => String(a ?? '') === String(b ?? '')

    if (!same(initialValue.title, currentValue.title)) return true
    if (initialValue.notificationYn !== currentValue.notificationYn) return true

    if (currentValue.notificationYn) {
      if (!same(initialValue.notificationTime, currentValue.notificationTime)) return true
    }

    if (!same(initialValue.space, currentValue.space)) return true
    if (!same(initialValue.repeat, currentValue.repeat)) return true

    const initStart = initialValue.startDate ?? null
    const currStart = currentValue.startDate ?? null
    const initEnd = initialValue.endDate ?? initialValue.startDate ?? null
    const currEnd = currentValue.endDate ?? currentValue.startDate ?? null

    if (!same(initStart, currStart)) return true
    if (!same(initEnd, currEnd)) return true

    return false
  }, [isEdit, initialValue, currentValue])

  // ----- 유효성 / 버튼 disabled -----
  const hasForbiddenChar = useMemo(() => EMOJI_RE.test(inputValue), [inputValue])

  const baseValid =
    !hasForbiddenChar &&
    Boolean(inputValue.trim()) &&
    Boolean(space) &&
    Boolean(repeat) &&
    Boolean(startDate) &&
    isDateRangeValid &&
    (!notifyOn || (ampm && hour12 && minute >= 0))

  const canSubmit = baseValid && (!isEdit || isChanged)

  const submitDisabled =
    !canSubmit || creating || updating || (isEdit && (loadingDetail || !initialValue || !isChanged))

  const isRepeating = (detail?.repeatType ?? 'NONE') !== 'NONE'

  // ----- 오버레이: 공간/반복 전용 -----
  const overlayOpen = activeDropdown === 'space' || activeDropdown === 'repeat'
  // 시간 드롭다운(ampm/hour/minute)은 제외해서, 안에서 터치/스크롤 가능하게 유지

  const closeAddChore = () => {
    if (Platform.OS === 'web') {
      // 웹(iOS Safari, PWA 포함)에서는 add-chore 히스토리를 홈으로 교체
      router.replace('/(tabs)/home')
    } else {
      // 앱(native)에서는 기존처럼 뒤로가기
      router.back()
    }
  }

  // ----- 제출(집안일 등록하기 버튼) -----
  const onSubmit = () => {
    if (!canSubmit) return

    const hhmm = toHHmm(ampm, hour12, minute)
    const baseDate = startDate ?? todayYMD
    if (!repeat) return

    const { repeatType, repeatInterval } = toRepeatFields(repeat)
    const spaceApi = toSpaceApi(space)
    if (!spaceApi) return

    if (!isEdit) {
      // 추천 chip으로 추가하는 경우 RECOMMEND, 아니면 MANUAL
      const taskSource = fromRecommendChip ? 'RECOMMEND' : 'MANUAL'

      // GA4 태깅
      trackEvent('task_created', {
        user_id: user?.id,
        task_type: taskSource,
        title: inputValue.trim(),
        cycle: repeat,
        reco_btn_click: fromRecommendChip,
      })

      createChore(
        {
          title: inputValue.trim(),
          notificationYn: notifyOn,
          notificationTime: hhmm,
          space: spaceApi,
          repeatType,
          repeatInterval,
          startDate: baseDate,
          endDate: endDate ?? baseDate,
          recommendYn: false,
        },
        {
          onSuccess: async (resp) => {
            closeAddChore()
            const completedMissions = resp.missionResults?.filter((m) => m.completed) ?? []
            completedMissions.forEach((mission) => {
              dispatch(
                openAchievementModal({
                  kind: 'mission',
                  title: '미션 달성!',
                  desc: `이달의 미션 \n ${mission.title} 미션을 완료했어요!`,
                  icon: missionIcon,
                  missionId: mission.id,
                  missionName: mission.title,
                })
              )
            })

            const prevBadge = qc.getQueryData<ResponseBadge[]>(['badge', 'acquired'])
            const nextBadge = await qc.fetchQuery<ResponseBadge[]>({
              queryKey: ['badge', 'acquired'],
              queryFn: getAcquiredBadges,
            })
            const newlyAcquired = getNewlyAcquiredBadgeByTime(prevBadge, nextBadge)

            newlyAcquired?.forEach((badge) => {
              dispatch(
                openAchievementModal({
                  kind: 'badge',
                  title: `${badge.badgeTitle} 뱃지 획득`,
                  desc: getBadgeDesc(badge, nextBadge),
                  icon: badge.badgeImageUrl,
                  badgeId: badge.badgeTitle,
                  badgeName: badge.badgeTitle,
                })
              )
            })
          },
          onError: (error) => {
            const { code, message, details } = toApiError(error)
            console.warn('[createChore error]', code, details?.[0]?.message ?? message)
          },
        }
      )
    } else {
      if (!instanceId) {
        console.warn('[update] instanceId가 없습니다.')
        return
      }

      if (isRepeating && applyToAfter === null) {
        setUpdateOpen(true)
        return
      }

      updateChore(
        {
          choreInstanceId: instanceId,
          dto: {
            title: inputValue.trim(),
            notificationYn: notifyOn,
            notificationTime: hhmm,
            space: spaceApi,
            repeatType,
            repeatInterval,
            recommendYn: false,
            startDate: baseDate,
            endDate: endDate ?? baseDate,
            applyToAfter: Boolean(applyToAfter),
          },
        },
        {
          onSuccess: () => {
            // GA4 태깅
            if (initialValue) {
              const beforeCycle = initialValue.repeat ?? ''
              const afterCycle = currentValue.repeat ?? ''
              const cycleChanged = beforeCycle !== afterCycle

              const taskSource = fromRecommendChip ? 'RECOMMEND' : 'MANUAL'

              trackEvent('task_update', {
                user_id: user?.id,
                title: inputValue.trim(),
                task_type: taskSource,
                before_cycle: beforeCycle,
                after_cycle: afterCycle,
                reco_btn_click: fromRecommendChip,
                cycle_changed: cycleChanged,
              })
            }

            closeAddChore()
          },
          onError: (error) => {
            const { code, message, details } = toApiError(error)
            console.warn('[updateChore error]', code, details?.[0]?.message ?? message)
          },
        }
      )
    }
  }

  // ----- 삭제 -----
  const handleDelete = (applyToAfter: boolean) => {
    if (!isEdit || !instanceId) return
    if (!selectedDateParam) return

    deleteChore(
      { choreInstanceId: instanceId, selectedDate: selectedDateParam, applyToAfter },
      {
        onSuccess: () => {
          setDeleteOpen(false)
          closeAddChore()
        },
        onError: (error) => {
          const { code, message, details } = toApiError(error)
          console.warn('[deleteChore error]', code, details?.[0]?.message ?? message)
        },
      }
    )
  }

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

  const btnLabel = isEdit ? '수정하기' : '등록하기'

  const MAX_LEN = 20
  const handleChangeText = (text: string) => {
    const limited = Array.from(text).slice(0, MAX_LEN).join('')
    setInputValue(limited)
  }

  const modalPadding =
    openCalendar === 'start'
      ? { paddingTop: 333, paddingRight: 25 }
      : { paddingTop: 383, paddingRight: 25 }

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
              if (overlayOpen && activeDropdown) setActiveDropdown(null)
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
                  onDelete={() => setDeleteOpen(true)}
                  deleting={deleting}
                />

                {isEdit && (
                  <DeleteModal
                    visible={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    onDeleteOnly={() => handleDelete(false)}
                    onDeleteAll={() => handleDelete(true)}
                    loading={deleting}
                    repeatType={detail?.repeatType}
                  />
                )}

                {/* 내용 */}
                <View style={styles.flex1}>
                  {/* 집안일 입력 */}
                  <ChoreInput
                    value={inputValue}
                    onChange={handleChangeText}
                    hasForbiddenChar={hasForbiddenChar}
                  />

                  {/* 추천 집안일 chips */}
                  <RecommendChips onSelectChore={(choreId: number) => setSpaceChoreId(choreId)} />

                  {/* 폼 필드 */}
                  <FormFields
                    space={space}
                    spaceOptions={spaceOptions}
                    onSpaceChange={setSpace}
                    repeat={repeat}
                    repeatOptions={repeatOptions}
                    onRepeatChange={setRepeat}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onStartDatePress={() => {
                      if (!isYMD(startDate)) setStartDate(todayYMD)
                      setOpenCalendar(openCalendar === 'start' ? null : 'start')
                    }}
                    onEndDatePress={() => {
                      if (!isYMD(endDate)) setEndDate(safeYMD(startDate, todayYMD))
                      setOpenCalendar(openCalendar === 'end' ? null : 'end')
                    }}
                    notifyOn={notifyOn}
                    onNotifyChange={setNotifyOn}
                    ampm={ampm}
                    hour12={hour12}
                    minute={minute}
                    onTimeChange={({ ampm, hour, minute }) => {
                      setAmpm(ampm)
                      setHour12(hour)
                      setMinute(minute)
                    }}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    toYYMMDD={toYYMMDD}
                  />
                </View>
              </ScrollView>

              {/* 공간/반복 드롭다운 바깥 클릭 시 닫기용 오버레이 */}
              {overlayOpen && (
                <Pressable
                  onPress={() => setActiveDropdown(null)}
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
            visible={updateOpen}
            onClose={() => {
              setUpdateOpen(false)
              setApplyToAfter(null)
            }}
            onUpdateOnly={() => {
              setApplyToAfter(false)
              setUpdateOpen(false)
              onSubmit()
            }}
            onUpdateAll={() => {
              setApplyToAfter(true)
              setUpdateOpen(false)
              onSubmit()
            }}
            loading={updating}
          />

          {/* 하단 버튼 */}
          <Pressable
            onPress={onSubmit}
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
        visible={openCalendar === 'start'}
        transparent
        animationType="none"
        onRequestClose={() => setOpenCalendar(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpenCalendar(null)} />
        <View style={[styles.modalAnchorArea, modalPadding]} pointerEvents="box-none">
          <View
            style={styles.calendarPopover}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            <DatePickerCalendar
              selectedDate={safeYMD(startDate, todayYMD)}
              onSelect={(d) => {
                setStartDate(d)
                setOpenCalendar(null)
              }}
              isOpen={true}
            />
          </View>
        </View>
      </Modal>

      {/* 캘린더 Modal: end */}
      <Modal
        visible={openCalendar === 'end'}
        transparent
        animationType="none"
        onRequestClose={() => setOpenCalendar(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpenCalendar(null)} />
        <View style={[styles.modalAnchorArea, modalPadding]} pointerEvents="box-none">
          <View
            style={styles.calendarPopover}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            <DatePickerCalendar
              selectedDate={safeYMD(endDate, safeYMD(startDate, todayYMD))}
              onSelect={(d) => {
                setEndDate(d)
                setOpenCalendar(null)
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
    paddingBottom: 120, // 하단 버튼 영역 만큼 확보
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
