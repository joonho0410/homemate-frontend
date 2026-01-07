# ChoreForm FSD 리팩토링 계획

## 현재 문제점

### 상태 관리 복잡도
- **16개의 상태 변수**가 하나의 컴포넌트에 집중
- Form Data (5), Notification (4), UI Control (4), Edit Mode (1), Recommendation (2)
- 상태 간 의존성이 복잡하고 관리가 어려움

### Props 과다 전달
- **FormFields에 20개 props** 전달
- 관련된 props들이 개별적으로 전달되어 유지보수 어려움
- 타입 안정성 및 리팩토링 시 모든 곳을 수정해야 함

### 책임 분리 부족
- Form 상태 관리 + 비즈니스 로직 + API 호출 + GA4 추적 모두 한 곳에
- 719줄의 거대한 컴포넌트
- 테스트 및 재사용이 어려움

---

## 리팩토링 전략

### FSD 레이어별 책임 분리

```
src/pages/AddChoreScreen/
├── ui/
│   ├── ChoreForm.tsx              (메인 컴포저, 100-150줄)
│   ├── ChoreFormHeader.tsx        (✅ 이미 분리됨)
│   ├── ChoreInput.tsx             (✅ 이미 분리됨)
│   ├── FormFields.tsx             (리팩토링 필요 - props 줄이기)
│   └── RecommendChips.tsx         (✅ 이미 분리됨)
├── model/
│   ├── useChoreFormData.ts        (📦 신규 - Form 데이터 상태 관리)
│   ├── useChoreFormValidation.ts  (📦 신규 - 유효성 검사 로직)
│   ├── useChoreFormSubmit.ts      (📦 신규 - 제출/수정/삭제 로직)
│   ├── useChoreFormUI.ts          (📦 신규 - UI 상태 관리)
│   └── types.ts                   (📦 신규 - 공통 타입 정의)
└── index.tsx                       (✅ 이미 존재)
```

---

## 상세 구현 계획

### 1단계: 타입 정의 (model/types.ts)

**목적:** 공통 타입을 중앙화하여 일관성 확보

```typescript
// 폼 데이터 타입
export interface ChoreFormData {
  title: string
  space: string | null
  repeat: string | null
  startDate: string | null
  endDate: string | null
}

// 알림 설정 타입
export interface NotificationSettings {
  enabled: boolean
  ampm: '오전' | '오후'
  hour12: number
  minute: number
}

// 필드 props 타입 (FormFields용)
export interface FieldProps<T> {
  value: T
  onChange: (value: T) => void
}

export interface SelectFieldProps extends FieldProps<string | null> {
  options: string[]
}

export interface DateFieldProps {
  start: string | null
  end: string | null
  onStartChange: (date: string) => void
  onEndChange: (date: string) => void
  onStartPress: () => void
  onEndPress: () => void
}
```

---

### 2단계: Form 데이터 Hook (model/useChoreFormData.ts)

**목적:** Form 데이터 상태를 독립적으로 관리

**책임:**
- 5개 form 상태 관리 (title, space, repeat, startDate, endDate)
- 초기값 설정 로직
- Edit 모드에서 detail 데이터로 초기화

**인터페이스:**
```typescript
export function useChoreFormData(params: {
  isEdit: boolean
  detail?: ChoreDetail
  selectedDate?: string
}) {
  return {
    formData: ChoreFormData
    setTitle: (value: string) => void
    setSpace: (value: string | null) => void
    setRepeat: (value: string | null) => void
    setStartDate: (value: string | null) => void
    setEndDate: (value: string | null) => void
    resetForm: () => void
    applyRecommendation: (chore: RandomChoreList) => void
  }
}
```

**주요 로직:**
- `useEffect`로 ADD/EDIT 모드별 초기값 설정
- `applyRecommendation`: 추천 칩 선택 시 form 채우기

---

### 3단계: 알림 Hook (model/useNotificationSettings.ts)

**목적:** 알림 관련 상태를 독립적으로 관리

**책임:**
- 4개 알림 상태 관리 (enabled, ampm, hour12, minute)
- 사용자 기본 알림 시간 적용

**인터페이스:**
```typescript
export function useNotificationSettings(params: {
  userDefaultTime?: string
  detail?: ChoreDetail
  isEdit: boolean
}) {
  return {
    settings: NotificationSettings
    setEnabled: (value: boolean) => void
    setTime: (params: { ampm, hour, minute }) => void
    getFormattedTime: () => string  // "HH:mm" 형식
    applyRecommendation: (choreEnabled: boolean) => void
  }
}
```

---

### 4단계: UI 상태 Hook (model/useChoreFormUI.ts)

**목적:** UI 제어 상태를 분리

**책임:**
- 4개 UI 상태 관리 (openCalendar, activeDropdown, deleteOpen, updateOpen)
- 모달 열기/닫기 헬퍼 함수

**인터페이스:**
```typescript
export function useChoreFormUI() {
  return {
    openCalendar: 'start' | 'end' | null
    setOpenCalendar: (type: 'start' | 'end' | null) => void
    activeDropdown: string | null
    setActiveDropdown: (id: string | null) => void
    deleteModalOpen: boolean
    openDeleteModal: () => void
    closeDeleteModal: () => void
    updateModalOpen: boolean
    openUpdateModal: () => void
    closeUpdateModal: () => void
  }
}
```

---

### 5단계: 유효성 검사 Hook (model/useChoreFormValidation.ts)

**목적:** 유효성 검사 로직을 독립적으로 관리

**책임:**
- form 데이터 유효성 검사
- 제출 가능 여부 계산
- 에러 메시지 생성

**인터페이스:**
```typescript
export function useChoreFormValidation(params: {
  formData: ChoreFormData
  notification: NotificationSettings
  isEdit: boolean
  initialValue?: ChoreFormData
  isLoading: boolean
}) {
  return {
    hasForbiddenChar: boolean
    isDateRangeValid: boolean
    isFormValid: boolean
    canSubmit: boolean
    isChanged: boolean
    errors: {
      title?: string
      dateRange?: string
      // ...
    }
  }
}
```

**주요 로직:**
- 이모지 검사
- 날짜 범위 유효성
- 필수 필드 검사
- EDIT 모드에서 변경사항 비교

---

### 6단계: 제출 로직 Hook (model/useChoreFormSubmit.ts)

**목적:** 생성/수정/삭제 비즈니스 로직을 분리

**책임:**
- API mutation 실행 (create, update, delete)
- GA4 이벤트 추적
- 성공 시 미션/뱃지 처리
- 에러 처리

**인터페이스:**
```typescript
export function useChoreFormSubmit(params: {
  isEdit: boolean
  instanceId?: number
  selectedDate?: string
}) {
  return {
    // Mutations
    handleCreate: (data: ChoreFormData, notification: NotificationSettings, fromRecommend: boolean) => void
    handleUpdate: (data: ChoreFormData, notification: NotificationSettings, applyToAfter: boolean) => void
    handleDelete: (applyToAfter: boolean) => void

    // States
    isSubmitting: boolean
    isDeleting: boolean

    // Helpers
    needsApplyToAfterConfirmation: boolean  // 반복 일정인지 확인
  }
}
```

**주요 로직:**
- Form 데이터를 API 형식으로 변환
- GA4 이벤트 발송
- 성공 후 미션/뱃지 모달 표시
- 에러 처리 및 로깅

---

### 7단계: FormFields Props 리팩토링

**목적:** 20개 props를 6-7개로 줄이기

**변경 전:**
```typescript
<FormFields
  space={space}
  spaceOptions={spaceOptions}
  onSpaceChange={setSpace}
  repeat={repeat}
  // ... 17개 더
/>
```

**변경 후:**
```typescript
<FormFields
  spaceField={{ value: space, options: spaceOptions, onChange: setSpace }}
  repeatField={{ value: repeat, options: repeatOptions, onChange: setRepeat }}
  dateField={{
    start: startDate,
    end: endDate,
    onStartChange: setStartDate,
    onEndChange: setEndDate,
    onStartPress: () => setOpenCalendar('start'),
    onEndPress: () => setOpenCalendar('end'),
  }}
  notificationField={{
    enabled: notifyOn,
    ampm, hour12, minute,
    onToggle: setNotifyOn,
    onTimeChange: setTime,
  }}
  uiState={{ activeDropdown, setActiveDropdown }}
  utils={{ toYYMMDD }}
/>
```

**FormFields.tsx 내부:**
```typescript
interface FormFieldsProps {
  spaceField: SelectFieldProps
  repeatField: SelectFieldProps
  dateField: DateFieldProps
  notificationField: NotificationFieldProps
  uiState: UIStateProps
  utils: { toYYMMDD: (s?: string | null) => string }
}
```

---

### 8단계: 리팩토링된 ChoreForm.tsx

**목적:** 컴포저 역할만 수행, 비즈니스 로직은 hooks로 위임

**예상 구조 (100-150줄):**
```typescript
export default function ChoreForm() {
  // URL params
  const { mode, instanceId, selectedDate } = useLocalSearchParams()
  const isEdit = mode === 'edit'

  // Data fetching
  const { data: detail } = useChoreDetail(instanceId)
  const { data: user } = useMyPage()

  // Custom hooks (상태 관리)
  const formData = useChoreFormData({ isEdit, detail, selectedDate })
  const notification = useNotificationSettings({ userDefaultTime: user?.notificationTime, detail, isEdit })
  const uiState = useChoreFormUI()
  const validation = useChoreFormValidation({ formData, notification, isEdit, initialValue: detail, isLoading })

  // Custom hooks (비즈니스 로직)
  const { handleCreate, handleUpdate, handleDelete, isSubmitting, isDeleting, needsApplyToAfter }
    = useChoreFormSubmit({ isEdit, instanceId, selectedDate })

  // Recommendation
  const [spaceChoreId, setSpaceChoreId] = useState<number | null>(null)
  const [fromRecommend, setFromRecommend] = useState(false)
  const { data: recommendInfo } = useRandomChoreInfo(spaceChoreId)

  useEffect(() => {
    if (recommendInfo) {
      formData.applyRecommendation(recommendInfo)
      notification.applyRecommendation(recommendInfo.choreEnabled)
      setFromRecommend(true)
    }
  }, [recommendInfo])

  // Handlers
  const handleSubmit = () => {
    if (isEdit) {
      if (needsApplyToAfter && applyToAfter === null) {
        uiState.openUpdateModal()
        return
      }
      handleUpdate(formData, notification, applyToAfter)
    } else {
      handleCreate(formData, notification, fromRecommend)
    }
  }

  // Render
  return (
    <KeyboardAvoidingView ...>
      <ScrollView>
        <ChoreFormHeader
          isEdit={isEdit}
          onBack={closeAddChore}
          onDelete={uiState.openDeleteModal}
          deleting={isDeleting}
        />

        <ChoreInput
          value={formData.title}
          onChange={formData.setTitle}
          hasForbiddenChar={validation.hasForbiddenChar}
        />

        <RecommendChips onSelectChore={setSpaceChoreId} />

        <FormFields
          spaceField={{ value: formData.space, options: SPACE_OPTIONS, onChange: formData.setSpace }}
          repeatField={{ value: formData.repeat, options: REPEAT_OPTIONS, onChange: formData.setRepeat }}
          dateField={{ start: formData.startDate, end: formData.endDate, ... }}
          notificationField={{ enabled: notification.enabled, ... }}
          uiState={uiState}
          utils={{ toYYMMDD }}
        />

        <SubmitButton
          onPress={handleSubmit}
          disabled={!validation.canSubmit || isSubmitting}
          label={isEdit ? '수정하기' : '등록하기'}
        />
      </ScrollView>

      {/* Modals */}
      <DeleteModal ... />
      <UpdateModal ... />
      <CalendarModal ... />
    </KeyboardAvoidingView>
  )
}
```

---

## 예상 효과

### 코드 크기 감소
- **ChoreForm.tsx**: 719줄 → **100-150줄** (약 80% 감소)
- 각 hook은 50-100줄 내외로 관리 가능

### Props 감소
- **FormFields**: 20개 props → **6-7개 props** (65% 감소)

### 책임 분리
- **ChoreForm**: UI 컴포저 역할만
- **model/hooks**: 비즈니스 로직 및 상태 관리
- 각 hook은 단일 책임 원칙 준수

### 테스트 용이성
- 각 hook을 독립적으로 테스트 가능
- Mock 데이터로 UI 테스트 쉬워짐

### 재사용성
- validation 로직을 다른 form에서 재사용 가능
- notification settings를 다른 곳에서 재사용 가능

---

## 구현 순서

1. **types.ts 작성** (타입 정의)
2. **useChoreFormData.ts 작성** (Form 데이터 hook)
3. **useNotificationSettings.ts 작성** (알림 hook)
4. **useChoreFormUI.ts 작성** (UI 상태 hook)
5. **useChoreFormValidation.ts 작성** (유효성 검사 hook)
6. **useChoreFormSubmit.ts 작성** (제출 로직 hook)
7. **FormFields.tsx 리팩토링** (Props 객체화)
8. **ChoreForm.tsx 리팩토링** (hooks 통합)
9. **테스트 및 검증**

---

## 주의사항

- 기존 기능이 모두 동작하도록 보장 (GA4 추적, 미션/뱃지, 모달 등)
- 타입 안정성 유지
- 성능 영향 최소화 (불필요한 리렌더링 방지)
- 점진적 마이그레이션 (한 번에 하나씩)
