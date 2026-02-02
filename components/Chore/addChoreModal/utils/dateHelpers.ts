/**
 * 날짜를 YY.MM.DD 형식으로 변환
 */
export function toYYMMDD(s?: string | null): string {
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

/**
 * YYYY-MM-DD 형식 검증
 */
export function isYMD(s: string | null | undefined): boolean {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

/**
 * 안전한 YMD 변환 (fallback 제공)
 */
export function safeYMD(s: string | null | undefined, fallback: string): string {
  return isYMD(s) ? (s as string) : fallback
}
