import { Dispatch, SetStateAction } from 'react'

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

export interface NotificationFieldProps {
  enabled: boolean
  ampm: '오전' | '오후'
  hour12: number
  minute: number
  onToggle: (enabled: boolean) => void
  onTimeChange: (params: { ampm: '오전' | '오후'; hour: number; minute: number }) => void
}

export interface UIStateProps {
  activeDropdown: string | null
  setActiveDropdown: Dispatch<SetStateAction<string | null>>
}
