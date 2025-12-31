# Home & Chore 컴포넌트 FSD 리팩토링 계획

## 개요

**목표**: home.tsx (483줄)와 AddChoreModal.tsx (946줄)를 Feature-Sliced Design 구조로 점진적으로 리팩토링

**제약사항**:
- 다른 개발자가 다른 부분을 작업할 수 있음 (충돌 최소화 필요)
- 전체 코드를 모르는 상태 (새로 참여한 상황)
- 점진적 개선 필요 (한 번에 전체 변경 X)

**핵심 전략**:
- 기존 파일과 새 파일 공존 (역방향 호환 유지)
- 레이어별 독립적 진행
- 각 단계마다 동작 검증 후 다음 단계 진행

---

## 최종 디렉토리 구조

```
/homemate/
├── app/                          # Expo Router (기존 유지)
│   ├── (tabs)/home.tsx           # → 최종적으로 3줄 (src/pages/HomeScreen import)
│   └── (modals)/add-chore.tsx    # → 최종적으로 3줄 (src/pages/AddChoreScreen import)
│
├── src/                          # 새로 생성할 FSD 구조
│   ├── pages/
│   │   ├── HomeScreen/           # home.tsx 로직 이동
│   │   │   ├── index.tsx
│   │   │   └── ui/
│   │   │       └── ProgressCard.tsx
│   │   └── AddChoreScreen/       # AddChoreModal 로직 분리
│   │       ├── index.tsx
│   │       └── ui/
│   │           └── ChoreForm.tsx
│   │
│   ├── widgets/
│   │   ├── chore-calendar/       # 캘린더 + 집안일 리스트
│   │   │   ├── ui/
│   │   │   │   ├── ChoreCalendar.tsx
│   │   │   │   └── ChoreListItem.tsx
│   │   │   └── model/
│   │   │       └── useChoreCalendarState.ts
│   │   └── notification-setup/   # 최초 알림 설정 모달
│   │       └── ui/
│   │           └── FirstSetupModal.tsx
│   │
│   ├── features/
│   │   ├── chore-create/         # 집안일 생성
│   │   │   ├── ui/CreateChoreForm.tsx
│   │   │   ├── model/useCreateChore.ts
│   │   │   └── api/createChore.ts
│   │   ├── chore-update/         # 집안일 수정
│   │   ├── chore-delete/         # 집안일 삭제
│   │   ├── chore-toggle/         # 완료/미완료 토글
│   │   └── chore-recommend/      # 추천 집안일
│   │
│   ├── entities/
│   │   ├── chore/
│   │   │   ├── model/
│   │   │   │   ├── types.ts      # types/chore.ts 이동
│   │   │   │   ├── useChoreByDate.ts
│   │   │   │   └── useChoreDetail.ts
│   │   │   ├── api/
│   │   │   │   ├── getChoreByDate.ts
│   │   │   │   └── getChoreDetail.ts
│   │   │   └── lib/
│   │   │       └── repeatUtils.ts
│   │   ├── user/
│   │   └── notification/
│   │
│   └── shared/
│       ├── ui/                   # 공용 UI 컴포넌트
│       │   ├── Calendar/         # HomeCalendar, DatePickerCalendar
│       │   ├── Dropdown/         # ChoreDropdown, TimeDropdown
│       │   ├── Checkbox.tsx
│       │   ├── Toggle.tsx
│       │   └── Modal/
│       ├── lib/                  # 공용 유틸리티
│       │   ├── date.ts
│       │   ├── time.ts
│       │   └── ga4.ts
│       └── api/
│           ├── client.ts         # axios 설정
│           └── endpoints.ts
│
├── components/                   # 기존 구조 (점진적 제거)
├── libs/                         # 기존 구조 (점진적 제거)
└── types/                        # 기존 구조 (점진적 제거)
```

---

## Phase 1: 인프라 구축 (1-2일)

### 목표
FSD 디렉토리 생성 및 경로 설정, 기존 코드와 공존 가능하도록 설정

### 작업
1. **디렉토리 구조 생성**
   ```bash
   mkdir -p src/{pages,widgets,features,entities,shared}
   mkdir -p src/shared/{ui,lib,api}
   mkdir -p src/entities/{chore,user,notification}
   mkdir -p src/features/{chore-create,chore-update,chore-delete,chore-toggle,chore-recommend}
   ```

2. **tsconfig.json 경로 추가**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"],              // 기존 경로 유지
         "@pages/*": ["./src/pages/*"],
         "@widgets/*": ["./src/widgets/*"],
         "@features/*": ["./src/features/*"],
         "@entities/*": ["./src/entities/*"],
         "@shared/*": ["./src/shared/*"]
       }
     }
   }
   ```

3. **각 레이어에 index.ts 배럴 파일 생성**

### 검증
- ✅ 빌드 성공: `npm run build:web`
- ✅ 기존 import 경로 정상 작동

### 롤백 전략
- src/ 디렉토리 삭제
- tsconfig.json 원복

---

## Phase 2: Shared Layer 이전 (2-3일)

### 목표
의존성 없는 공용 컴포넌트와 유틸리티 먼저 이동

### 작업 순서

#### Step 2-1: 순수 UI 컴포넌트 이동
```
components/Checkbox.tsx           → src/shared/ui/Checkbox/index.tsx
components/Toggle.tsx             → src/shared/ui/Toggle/index.tsx
components/Dropdown/              → src/shared/ui/Dropdown/
components/Calendar/              → src/shared/ui/Calendar/
components/DeleteModal.tsx        → src/shared/ui/Modal/DeleteModal.tsx
components/UpdateModal.tsx        → src/shared/ui/Modal/UpdateModal.tsx
```

**이동 방법**:
```typescript
// src/shared/ui/Checkbox/index.tsx (새 파일)
export { default as Checkbox } from './Checkbox'
export type { CheckboxProps } from './Checkbox'

// components/Checkbox.tsx (기존 파일 - 임시 유지)
export { Checkbox } from '@shared/ui/Checkbox'  // re-export
```

#### Step 2-2: 유틸리티 함수 이동
```
libs/utils/date.ts     → src/shared/lib/date/index.ts
libs/utils/time.ts     → src/shared/lib/time/index.ts
libs/utils/ga4.ts      → src/shared/lib/ga4/index.ts
libs/utils/repeat.ts   → src/entities/chore/lib/repeat.ts (엔티티 특화)
libs/utils/space.ts    → src/entities/chore/lib/space.ts (엔티티 특화)
```

#### Step 2-3: API 클라이언트 설정 이동
```
libs/api/axios.ts      → src/shared/api/client.ts
libs/api/endpoints.ts  → src/shared/api/endpoints.ts
libs/api/error.ts      → src/shared/api/error.ts
```

### 검증
- ✅ Home 화면 동작 확인
- ✅ 캘린더, 드롭다운 상호작용 테스트

---

## Phase 3: Entities Layer 이전 (2-3일)

### 목표
비즈니스 엔티티(Chore, User, Notification) 관련 타입, API, 기본 hooks 이동

### 작업 순서

#### Step 3-1: Chore Entity 구성
```
# 타입 정의
types/chore.ts → src/entities/chore/model/types.ts

# API 함수
libs/api/chore/getChoreByDate.ts     → src/entities/chore/api/getChoreByDate.ts
libs/api/chore/getChoreDetail.ts     → src/entities/chore/api/getChoreDetail.ts
libs/api/chore/getChoreCalendar.ts   → src/entities/chore/api/getChoreCalendar.ts

# 조회 hooks
libs/hooks/chore/useChoreByDate.ts     → src/entities/chore/model/useChoreByDate.ts
libs/hooks/chore/useChoreDetail.ts     → src/entities/chore/model/useChoreDetail.ts
libs/hooks/chore/useChoreCalendar.ts   → src/entities/chore/model/useChoreCalendar.ts

# 유틸리티
libs/utils/repeat.ts → src/entities/chore/lib/repeat.ts
libs/utils/space.ts  → src/entities/chore/lib/space.ts
```

**배럴 파일**:
```typescript
// src/entities/chore/index.ts
export * from './model/types'
export { useChoreByDate } from './model/useChoreByDate'
export { useChoreDetail } from './model/useChoreDetail'
export { useChoreCalendar } from './model/useChoreCalendar'
```

#### Step 3-2: User Entity 구성
```
libs/hooks/mypage/useMyPage.ts → src/entities/user/model/useMyPage.ts
types/mypage.ts → src/entities/user/model/types.ts
```

#### Step 3-3: Notification Entity 구성
```
libs/hooks/mypage/useFirstNotiStatus.ts → src/entities/notification/model/useFirstNotiStatus.ts
libs/hooks/mypage/useFirstNotiTimeSetting.ts → src/entities/notification/model/useFirstNotiTimeSetting.ts
```

### 검증
- ✅ Home 화면에서 집안일 리스트 로딩 확인
- ✅ 캘린더 dot 표시 확인
- ✅ 날짜 선택 시 집안일 필터링 확인

---

## Phase 4: Features Layer 이전 (3-4일)

### 목표
비즈니스 기능별로 API, hooks, UI 분리

### 작업 순서

#### Step 4-1: chore-create Feature
```
src/features/chore-create/
├── api/createChore.ts           # libs/api/chore/createChore.ts
├── model/useCreateChore.ts      # libs/hooks/chore/useCreateChore.ts
└── ui/CreateChoreForm.tsx       # AddChoreModal에서 생성 로직 추출
```

**분리 기준**: AddChoreModal의 `!isEdit` 분기 로직 추출

#### Step 4-2: chore-update Feature
```
src/features/chore-update/
├── api/updateChore.ts
├── model/useUpdateChore.ts
└── ui/
    ├── UpdateChoreForm.tsx      # AddChoreModal에서 수정 로직 추출
    └── UpdateModal.tsx          # components/UpdateModal.tsx 이동
```

#### Step 4-3: chore-delete Feature
```
src/features/chore-delete/
├── api/deleteChore.ts
├── model/useDeleteChore.ts
└── ui/DeleteModal.tsx           # components/DeleteModal.tsx 이동
```

#### Step 4-4: chore-toggle Feature
```
src/features/chore-toggle/
├── api/patchChoreStatus.ts
├── model/usePatchChoreStatus.ts
└── ui/ChoreCheckbox.tsx         # Home의 Checkbox 로직 + GA4 태깅
```

**추출 로직**:
```typescript
// ChoreCheckbox.tsx
const ChoreCheckbox = ({ chore, onToggle }) => {
  const { mutate } = usePatchChoreStatus(chore.dueDate)
  const { data: user } = useMyPage()

  const handleToggle = () => {
    mutate(chore.id)
    if (!chore.completed) {
      trackEvent('task_completed', { user_id: user?.id, ... })
    }
    onToggle?.()
  }

  return <Checkbox checked={chore.status === 'COMPLETED'} onChange={handleToggle} />
}
```

#### Step 4-5: chore-recommend Feature
```
src/features/chore-recommend/
├── api/
│   ├── getRandomChores.ts
│   └── getRandomChoreInfo.ts
├── model/
│   ├── useRandomChores.ts
│   └── useRandomChoreInfo.ts
└── ui/RecommendChipList.tsx     # AddChoreModal의 추천 칩 UI 추출
```

### 검증
- ✅ chore-create: 집안일 생성 → 리스트 반영 확인
- ✅ chore-update: 집안일 수정 → 변경사항 반영 확인
- ✅ chore-delete: 삭제 → 리스트에서 제거 확인
- ✅ chore-toggle: 완료/미완료 토글 → 상태 변경 확인

### 중요 규칙
⚠️ **Feature는 다른 Feature를 import 금지**
- Feature → Entities, Shared만 허용
- Feature 간 통신은 상위 레이어(Page)에서 처리

---

## Phase 5: Widgets & Pages 구성 (2-3일)

### 목표
페이지 레벨 로직을 조립 가능한 단위로 분리

### Step 5-1: Widgets 구성

#### chore-calendar Widget
```typescript
// src/widgets/chore-calendar/ui/ChoreCalendar.tsx
const ChoreCalendar = () => {
  const { selectedDate, setSelectedDate, range, setRange } = useChoreCalendarState()
  const { data: dotDates } = useChoreCalendar(range.start, range.end)  // Entity
  const { data: chores } = useChoreByDate(selectedDate)                // Entity

  return (
    <>
      <HomeCalendar
        onSelect={setSelectedDate}
        dotDates={dotDates}
        onMonthChangeRange={setRange}
      />
      <ChoreList chores={chores} selectedDate={selectedDate} />
    </>
  )
}
```

#### notification-setup Widget
```
src/widgets/notification-setup/
└── ui/FirstSetupModal.tsx      # Home의 최초 알림 설정 모달 추출
```

### Step 5-2: Pages 구성

#### HomeScreen Page
```typescript
// src/pages/HomeScreen/index.tsx
const HomeScreen = () => {
  const { data: user } = useMyPage()
  const { data: todayChores } = useChoreByDate(todayStr)

  return (
    <TabSafeScroll>
      <Header user={user} />
      <ProgressCard chores={todayChores} user={user} />
      <ChoreCalendar />                      {/* Widget */}
      <FirstSetupModal />                    {/* Widget */}
    </TabSafeScroll>
  )
}
```

#### AddChoreScreen Page
```typescript
// src/pages/AddChoreScreen/index.tsx
const AddChoreScreen = () => {
  const { mode, instanceId } = useLocalSearchParams()
  const isEdit = mode === 'edit'

  return (
    <KeyboardAvoidingView>
      {isEdit ? (
        <UpdateChoreForm instanceId={instanceId} />  {/* Feature */}
      ) : (
        <CreateChoreForm />                          {/* Feature */}
      )}
    </KeyboardAvoidingView>
  )
}
```

### Step 5-3: app/ 라우트 파일 수정

**Before**:
```typescript
// app/(tabs)/home.tsx (483줄)
export default function HomeScreen() {
  // 모든 로직...
}
```

**After**:
```typescript
// app/(tabs)/home.tsx (3줄)
export { default } from '@pages/HomeScreen'
```

마찬가지로 `app/(modals)/add-chore.tsx`도 동일하게 처리

### 검증
- ✅ 라우팅 동작 확인: 탭 전환, 모달 오픈
- ✅ 홈 화면 로딩
- ✅ 캘린더 월 변경
- ✅ 집안일 생성/수정/삭제
- ✅ 완료 토글

---

## Phase 6: 클린업 (1-2일)

### 목표
기존 파일 제거 및 import 경로 정리

### Step 6-1: 기존 파일 제거

**제거 순서** (역순으로 진행):
1. `components/` 디렉토리 (Shared로 이동 완료 확인 후)
2. `libs/hooks/chore/` (Features/Entities로 이동 완료 확인 후)
3. `libs/api/chore/` (Features/Entities로 이동 완료 후)
4. `libs/utils/` (Shared로 이동 완료 후)
5. `types/chore.ts` (Entities로 이동 완료 후)

**제거 전 체크리스트**:
```bash
# 기존 경로 사용처 검색
grep -r "@/components/Chore" src/ app/
grep -r "@/libs/hooks/chore" src/ app/
# 결과가 없으면 제거 가능
```

### Step 6-2: Import 경로 일괄 변경

**ESLint 규칙 추가**:
```typescript
'no-restricted-imports': [
  'error',
  {
    patterns: [
      '@/components/Chore/*',   // → @features/* 사용 강제
      '@/libs/hooks/chore/*',   // → @entities/chore/* 또는 @features/* 사용
    ]
  }
]
```

### Step 6-3: 문서화

**작성할 문서**:
1. `src/README.md`: FSD 구조 설명
2. `src/ARCHITECTURE.md`: 레이어별 규칙, 의존성 방향
3. 각 Feature의 README: 사용 예시, Props 설명

### 최종 검증
- ✅ 전체 빌드: `npm run build:web`
- ✅ Lint 검사: `npm run lint`
- ✅ E2E 시나리오 테스트 (수동)

---

## 다른 개발자와 충돌 최소화 전략

### 1. 브랜치 전략
```
main
 ├── feature/fsd-phase1-infra        (인프라 구축)
 ├── feature/fsd-phase2-shared       (Shared Layer)
 ├── feature/fsd-phase3-entities     (Entities Layer)
 ├── feature/fsd-phase4-features     (Features Layer)
 ├── feature/fsd-phase5-pages        (Pages/Widgets)
 └── feature/fsd-phase6-cleanup      (클린업)
```

**머지 타이밍**: 각 Phase 완료 후 즉시 main에 머지

### 2. 파일별 작업 분리

**이 작업에서 건드리는 파일**:
- `app/(tabs)/home.tsx` (최종 단계에서만 3줄로 축소)
- `app/(modals)/add-chore.tsx` (최종 단계에서만 3줄로 축소)
- `components/Chore/AddChoreModal.tsx` (점진적으로 비우기)
- `components/Calendar/`, `components/Dropdown/` (이동 후 re-export로 유지)

**다른 개발자가 작업할 수 있는 영역**:
- `app/(tabs)/mission.tsx`, `mypage.tsx`, `recommend.tsx`
- `libs/api/mission/`, `libs/api/badge/`
- `components/Badge/`

**충돌 방지**: Phase 2-4 동안 기존 파일은 그대로 두고 새 경로만 추가

### 3. 커뮤니케이션
- Phase 시작 전 작업 파일 목록 공유
- Phase 완료 후 새로운 경로 사용법 가이드 제공

---

## FSD 레이어 의존성 규칙

```
Pages/Widgets
    ↓ (사용 가능)
Features
    ↓ (사용 가능)
Entities
    ↓ (사용 가능)
Shared
```

### 금지 사항
- ❌ Shared → Entities
- ❌ Entities → Features
- ❌ Features → Pages
- ❌ Feature A → Feature B (Feature 간 의존성 금지)

---

## 예상 소요 시간

| Phase | 작업 내용 | 예상 시간 |
|-------|----------|----------|
| Phase 1 | 인프라 구축 | 1-2일 |
| Phase 2 | Shared Layer 이전 | 2-3일 |
| Phase 3 | Entities Layer 이전 | 2-3일 |
| Phase 4 | Features Layer 이전 | 3-4일 |
| Phase 5 | Widgets & Pages 구성 | 2-3일 |
| Phase 6 | 클린업 | 1-2일 |
| **총합** | | **11-17일 (약 3주)** |

**안전한 일정**: **4주 (20일)**

---

## 중요 파일 경로

### Phase 1에서 수정할 파일
- `/Users/junhjeon/Desktop/homemate/tsconfig.json`

### Phase 2-4에서 이동할 주요 파일
- `/Users/junhjeon/Desktop/homemate/components/Checkbox.tsx`
- `/Users/junhjeon/Desktop/homemate/components/Toggle.tsx`
- `/Users/junhjeon/Desktop/homemate/components/Calendar/HomeCalendar.tsx`
- `/Users/junhjeon/Desktop/homemate/components/Dropdown/ChoreDropdown.tsx`
- `/Users/junhjeon/Desktop/homemate/libs/hooks/chore/useChoreByDate.ts`
- `/Users/junhjeon/Desktop/homemate/libs/utils/date.ts`
- `/Users/junhjeon/Desktop/homemate/types/chore.ts`

### Phase 5에서 리팩토링할 핵심 파일
- `/Users/junhjeon/Desktop/homemate/app/(tabs)/home.tsx` (483줄 → 3줄)
- `/Users/junhjeon/Desktop/homemate/components/Chore/AddChoreModal.tsx` (946줄 → 분리)

---

## 전체 체크리스트

### Phase 1
- [ ] src/ 디렉토리 구조 생성
- [ ] tsconfig.json 경로 추가
- [ ] 빌드 성공 확인

### Phase 2
- [ ] Checkbox, Toggle, Dropdown, Calendar → Shared UI
- [ ] date, time, ga4 유틸 → Shared lib
- [ ] API 클라이언트 → Shared api
- [ ] Home 화면 정상 동작

### Phase 3
- [ ] Chore Entity (타입, API, hooks) 구성
- [ ] User Entity 구성
- [ ] Notification Entity 구성
- [ ] 집안일 리스트 로딩/필터링 정상

### Phase 4
- [ ] chore-create Feature 구성
- [ ] chore-update Feature 구성
- [ ] chore-delete Feature 구성
- [ ] chore-toggle Feature 구성
- [ ] chore-recommend Feature 구성
- [ ] 모든 CRUD 동작 정상

### Phase 5
- [ ] chore-calendar Widget 조립
- [ ] notification-setup Widget 조립
- [ ] HomeScreen Page 조립
- [ ] AddChoreScreen Page 조립
- [ ] app/ 라우트 파일 3줄로 축소
- [ ] 모든 기능 E2E 테스트

### Phase 6
- [ ] 기존 파일 제거
- [ ] import 경로 전체 변경
- [ ] 문서화 완료
- [ ] 최종 빌드 및 테스트 통과

---

## 핵심 고려사항

### AddChoreModal 946줄 분리 전략

**문제**: 생성/수정 로직이 한 파일에 혼재

**해결**:
- 공통 로직 → `src/shared/lib/choreForm/`
- 생성 전용 → `src/features/chore-create/ui/CreateChoreForm.tsx`
- 수정 전용 → `src/features/chore-update/ui/UpdateChoreForm.tsx`
- 공통 UI → `src/pages/AddChoreScreen/ui/ChoreForm.tsx`

### Home 483줄 분리 전략

**분리 방법**:
- Widget으로 추출: `chore-calendar`, `notification-setup`
- Page UI 유지: `ProgressCard`, `Header`
- 최종 HomeScreen: 50줄 이하

---

## 롤백 전략

**Phase 1-2 롤백**:
```bash
rm -rf src/
git checkout HEAD -- tsconfig.json
```

**Phase 3-6 롤백**:
```bash
git checkout main -- components/ libs/ types/
rm -rf src/
git checkout HEAD~1 -- app/(tabs)/home.tsx app/(modals)/add-chore.tsx
```
