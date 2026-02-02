// 이모지(특수문자) 불가
const EMOJI_RE = /[\p{Extended_Pictographic}]/u

/**
 * 이모지/특수문자 포함 여부 확인
 */
export function hasForbiddenChar(text: string): boolean {
  return EMOJI_RE.test(text)
}

/**
 * 집안일 폼 유효성 검증
 */
export interface ChoreFormData {
  title: string
  space: string | null
  repeat: string | null
  startDate: string | null
  endDate: string | null
  notifyOn: boolean
  ampm: '오전' | '오후'
  hour12: number
  minute: number
  isDateRangeValid: boolean
}

export interface ValidationResult {
  isValid: boolean
  hasForbiddenChar: boolean
  errors: {
    title?: string
    space?: string
    repeat?: string
    date?: string
    notification?: string
  }
}

export function validateChoreForm(data: ChoreFormData): ValidationResult {
  const errors: ValidationResult['errors'] = {}

  // 제목 검증
  if (!data.title.trim()) {
    errors.title = '집안일 제목을 입력해주세요'
  } else if (hasForbiddenChar(data.title)) {
    errors.title = '특수문자를 제외해주세요'
  }

  // 공간 검증
  if (!data.space) {
    errors.space = '공간을 선택해주세요'
  }

  // 반복주기 검증
  if (!data.repeat) {
    errors.repeat = '반복주기를 선택해주세요'
  }

  // 날짜 검증
  if (!data.startDate) {
    errors.date = '시작일을 선택해주세요'
  } else if (!data.isDateRangeValid) {
    errors.date = '종료일은 시작일보다 이후여야 합니다'
  }

  // 알림 시간 검증
  if (data.notifyOn && (!data.ampm || !data.hour12 || data.minute < 0)) {
    errors.notification = '알림 시간을 설정해주세요'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    hasForbiddenChar: hasForbiddenChar(data.title),
    errors,
  }
}
