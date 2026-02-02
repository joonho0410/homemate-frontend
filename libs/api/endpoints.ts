import { AlertType } from '@/types/mypage'

export const AUTH_ENDPOINTS = {
  KAKAO_LOGIN: '/auth/login/kakao',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  WITHDRAW: '/auth/withdraw',
} as const

export const MYPAGE_ENDPOINTS = {
  /** 최초 알림 시간 설정 여부 조회 (소셜 로그인 직후 확인용) */
  GET_ALERT_STATUS: '/users/me/notification-settings/first-setup-status', // GET

  /** 최초 알림 시간 설정 (최초 1회 설정) */
  SET_INITIAL_ALERT: '/users/me/notification-settings/first-setup', // POST

  /** 마이페이지 정보 조회 (사용자 정보 + 알림 설정 상태) */
  GET_PROFILE: '/users/me', // GET

  /** 알림 설정 변경  */
  UPDATE_ALERT: (type: AlertType) => `/users/me/notification-settings/${type}`, // PATCH

  /** 알림 시간 조회 */
  GET_ALERT_TIME: '/users/me/notification-settings/time', // GET

  /** 알림 시간 수정 */
  UPDATE_ALERT_TIME: '/users/me/notification-settings/time', // PATCH
} as const

export const CHORE_ENDPOINTS = {
  /** 집안일 추가 */
  CREATE: '/chore', // POST

  /** 집안일 수정 (시작/종료 일자 등) */
  UPDATE: (choreInstanceId: number) => `/chore/${choreInstanceId}`, // PUT

  /** 집안일 완료/해제 (인스턴스 단위) */
  TOGGLE_COMPLETE: (choreInstanceId: number) => `/chore/${choreInstanceId}`, // PATCH

  /** 집안일 삭제 (인스턴스 단위, applyToAll 쿼리로 전체 적용 가능) */
  DELETE: (choreInstanceId: number, applyToAll?: boolean) =>
    `/chore/instance/${choreInstanceId}${applyToAll !== undefined ? `?applyToAll=${applyToAll}` : ''}`, // DELETE
<<<<<<< HEAD

  /** 집안일 상세 조회 (수정을 위한 상세) */
  DETAIL: (choreInstanceId: number) => `/chore/instance/${choreInstanceId}`, // GET
=======

  /** 집안일 삭제 (choreId 기준, 루틴 전체 삭제) */
  DELETE_BY_CHORE_ID: (choreId: number) => `/chore/${choreId}`, // DELETE ?applyToAfter=

  /** 집안일 상세 조회 (수정을 위한 상세) */
  DETAIL: (choreInstanceId: number) => `/chore/instance/${choreInstanceId}`, // GET
  DETAIL_CHOREID: (choreId: number) => `/chore/${choreId}`,
>>>>>>> 9560368 (refactor(chore): addChoreModal 리팩토링)

  /** 당일 집안일 리스트 조회 */
  LIST_BY_DATE: '/chore/instances', // GET ?date=YYYY-MM-DD

  /** 캘린더 집안일 유무 확인 */
  CALENDAR: '/chore/calendar', // GET ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

  CATEGORY: '/chore', // GET ?[filter]&[space]&[repeat]&[repeatInterval]
} as const

export const RECOMMEND_ENDPOINTS = {
  /** 추천 화면 개요 조회 */
  OVERVIEW: '/recommend/total', // GET (query: ?limitTrending=number)

  /** 카테고리 하위 집안일 목록 조회 */
  // 고정 카테고리 조회(미션 + 고정)
  CATEGORY_CHORES: (category: string) => `/recommend/categories/fixed/${category}`, // GET

  // 계절 카테고리 조회
  SEASON_CATEGORY_CHORES: '/recommend/categories/season',

  /** 선택한 집안일 등록 (카테고리 기준) */
  REGISTER_CATEGORY: (categoryChoreId: number) =>
    `/recommend/categories/${categoryChoreId}/register`, // POST

  /** 공간별 하위 집안일 목록 조회 */
  SPACE_CHORES: '/recommend/spaces/chores', // GET

  /** 선택한 집안일 등록 (공간 기준) */
  REGISTER_SPACE: (spaceChoreId: number) => `/recommend/spaces/${spaceChoreId}/register`, // POST

  /** 공간 리스트 조회 */
  SPACES: '/recommend/spaces', // GET

  /** 카테고리 리스트 조회 */
  CATEGORIES: '/recommend/categories', // GET

  /** 월간 카테고리 조회기능 설명 */
  MONTHLY_CATEGORY_CHORES: (categoryId: number) =>
    `/recommend/categories/monthly/${categoryId}/chores`,

  /** 랜덤 집안일 추천 조회 */
  RANDOM: '/recommend/random', // GET

  /** 랜덤 집안일 추천 정보 가져오기 */
  RANDOM_CHORES: (spaceChoreId: number) => `/recommend/spaces/${spaceChoreId}`, // GET
} as const

export const NOTIFICATION_ENDPOINTS = {
  /** PCM 푸시 구독 등록 */
  ENABLE_PUSH: '/push/subscriptions', // POST

  /** FCM 푸시 구독 해제 */
  DISABLE_PUSH: '/push/subscriptions', // DELETE

  /** 집안일 알림 리스트 조회 */
  CHORE_LIST: '/notifications/chores', // GET

  /** 집안일 알림 읽음 처리 */
  CHORE_READ: (notificationId: number) => `/notifications/chores/${notificationId}`, // PATCH

  /** 공지 알림 리스트 조회 */
  NOTICE_LIST: '/notifications/notices', // GET

  /** 공지 알림 읽음 처리 */
  NOTICE_READ: (notificationId: number) => `/notifications/notices/${notificationId}`, // PATCH
} as const

export const MISSION_ENDPOINTS = {
  /** 이 달의 미션 조회: GET */
  LIST_BY_RANGE: '/missions',
} as const

export const BADGE_ENDPOINTS = {
  /** 뱃지 획득 */
  ACHIEVE: '',

  /** 뱃지 획득 조건부 상위 3개 리스트 조회 */
  TOP3_CANDIDATES: '/badges/closest', // GET

  /** 획득한 벳지 목록 조회 */
  GET_BADGES: '/badges/acquired', // GET
} as const
