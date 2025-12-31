# AddChoreScreen

집안일 생성/수정 페이지

## 현재 구조

```
src/pages/AddChoreScreen/
├── index.tsx                 # 페이지 엔트리
├── ui/
│   ├── ChoreForm.tsx        # 메인 폼 (950줄 - 추후 분해 예정)
│   └── ChoreFormHeader.tsx  # 헤더 컴포넌트
└── README.md
```

## ChoreForm 구조

ChoreForm은 현재 하나의 큰 컴포넌트로 다음 기능들을 모두 처리합니다:

### 기능
- **생성 (Create)**: mode='add' 시 새 집안일 생성
- **수정 (Update)**: mode='edit' 시 기존 집안일 수정
- **삭제 (Delete)**: 수정 모드에서 삭제 버튼 제공
- **추천 (Recommend)**: 랜덤 추천 집안일 칩 표시

### 상태 (13개)
- 입력값: inputValue, space, repeat, startDate, endDate
- UI 상태: openCalendar, activeDropdown, deleteOpen, updateOpen
- 알림 설정: notifyOn, ampm, hour12, minute
- 기타: spaceChoreId, applyToAfter, fromRecommendChip

## 향후 리팩토링 계획

### Features로 분리
```
src/features/chore/
├── create/
│   ├── model/useCreateChore.ts
│   └── ui/CreateChoreButton.tsx
├── update/
│   ├── model/useUpdateChore.ts
│   └── ui/UpdateChoreButton.tsx
├── delete/
│   └── ui/DeleteChoreButton.tsx
└── recommend/
    └── ui/RecommendChips.tsx
```

### UI 컴포넌트 분리
```
src/pages/AddChoreScreen/ui/
├── ChoreForm.tsx            # 메인 컨테이너
├── ChoreFormHeader.tsx      # ✅ 완료
├── ChoreInput.tsx           # TODO: 제목 입력
├── SpaceSelector.tsx        # TODO: 공간 선택
├── RepeatSelector.tsx       # TODO: 반복 설정
├── DateRangeSelector.tsx    # TODO: 날짜 범위
└── NotificationToggle.tsx   # TODO: 알림 설정
```

### Model (상태 관리) 분리
```
src/pages/AddChoreScreen/model/
├── useChoreFormState.ts     # TODO: 폼 상태 관리
└── useChoreFormSubmit.ts    # TODO: 제출 로직
```

## 사용 예시

```typescript
// mode='add': 생성
<AddChoreScreen />

// mode='edit': 수정
<AddChoreScreen />
// URL params: mode=edit&instanceId=123&selectedDate=2024-01-01
```
