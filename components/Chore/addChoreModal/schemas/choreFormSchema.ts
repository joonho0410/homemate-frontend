import { z } from 'zod'

import { toHHmmParts } from '@/libs/utils/time'
import { toRepeatLabel } from '@/libs/utils/repeat'
import { toSpaceUi } from '@/libs/utils/space'

import { toBool } from '../utils/formHelpers'

// Emoji/special character regex (from validation.ts)
const EMOJI_RE = /[\p{Extended_Pictographic}]/u

/**
 * Zod schema for chore form validation
 */
export const choreFormSchema = z
  .object({
    // Form data fields
    title: z
      .string()
      .min(1, '집안일 제목을 입력해주세요')
      .max(20, '제목은 20자 이하여야 합니다')
      .refine((val) => !EMOJI_RE.test(val), {
        message: '특수문자를 제외해주세요',
      }),

    space: z.string().nullable(),

    repeat: z.string().nullable(),

    startDate: z.string().nullable(),

    endDate: z.string().nullable(),

    notifyOn: z.boolean().default(false),

    ampm: z.enum(['오전', '오후']).default('오전'),

    hour12: z.number().int().min(1).max(12).default(9),

    minute: z.number().int().min(0).max(59).default(0),
  })
  // Custom validations
  .refine((data) => data.space !== null && data.space !== '', {
    message: '공간을 선택해주세요',
    path: ['space'],
  })
  .refine((data) => data.repeat !== null && data.repeat !== '', {
    message: '반복주기를 선택해주세요',
    path: ['repeat'],
  })
  .refine((data) => data.startDate !== null && data.startDate !== '', {
    message: '시작일을 선택해주세요',
    path: ['startDate'],
  })
  // Cross-field validation for date range
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return data.startDate <= data.endDate
    },
    {
      message: '완료일자는 시작일자보다 빠를 수 없습니다',
      path: ['endDate'],
    }
  )
  // Notification time validation
  .refine(
    (data) => {
      if (!data.notifyOn) return true
      return data.hour12 >= 1 && data.hour12 <= 12 && data.minute >= 0
    },
    {
      message: '알림 시간을 설정해주세요',
      path: ['notifyOn'],
    }
  )

// Infer TypeScript type from schema
export type ChoreFormData = z.infer<typeof choreFormSchema>

/**
 * Get default values for ADD mode
 */
export const getDefaultValues = (
  selectedDate?: string,
  userDefaultTime?: string
): ChoreFormData => {
  const today = new Date().toISOString().split('T')[0]
  const baseDate = selectedDate || today

  // Parse user default time or use 9:00 AM
  const defaultTime = userDefaultTime || '09:00'
  const parts = toHHmmParts(defaultTime)

  return {
    title: '',
    space: null,
    repeat: null,
    startDate: baseDate,
    endDate: baseDate,
    notifyOn: false,
    ampm: parts.ampm,
    hour12: parts.hour12,
    minute: parts.minute,
  }
}

/**
 * Transform API data to form values (for EDIT mode)
 */
export const apiToFormValues = (data: {
  title?: string
  space?: string
  repeatType?: string
  repeatInterval?: number
  startDate?: string
  endDate?: string
  notificationYn?: boolean | string | number
  notificationTime?: string | null
}): ChoreFormData => {
  const timeParts = toHHmmParts(data.notificationTime ?? '09:00')

  return {
    title: data.title ?? '',
    space: data.space ? toSpaceUi(data.space) : null,
    repeat:
      data.repeatType && data.repeatInterval !== undefined
        ? toRepeatLabel(data.repeatType, data.repeatInterval)
        : null,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    notifyOn: toBool(data.notificationYn),
    ampm: timeParts.ampm,
    hour12: timeParts.hour12,
    minute: timeParts.minute,
  }
}

/**
 * Transform choreData (from list API) to form values (for EDITCHORE mode)
 * ResponseChore['data'] 형식의 데이터를 폼 값으로 변환
 */
export const choreDataToFormValues = (data: {
  title?: string
  space?: string
  repeatType?: string
  repeatInterval?: number
  startDate?: string
  endDate?: string
  notificationYn?: boolean
  notificationTime?: string | null
}): ChoreFormData => {
  const timeParts = toHHmmParts(data.notificationTime ?? '09:00')

  return {
    title: data.title ?? '',
    space: data.space ? toSpaceUi(data.space) : null,
    repeat:
      data.repeatType && data.repeatInterval !== undefined
        ? toRepeatLabel(data.repeatType, data.repeatInterval)
        : null,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    notifyOn: data.notificationYn ?? false,
    ampm: timeParts.ampm,
    hour12: timeParts.hour12,
    minute: timeParts.minute,
  }
}
