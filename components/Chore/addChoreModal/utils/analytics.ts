import { trackEvent } from '@/libs/utils/ga4'

/**
 * 집안일 생성 이벤트 추적
 */
export function trackChoreCreated(params: {
  user_id?: number
  task_type: 'RECOMMEND' | 'MANUAL'
  title: string
  cycle: string
  reco_btn_click: boolean
}) {
  trackEvent('task_created', {
    user_id: params.user_id,
    task_type: params.task_type,
    title: params.title,
    cycle: params.cycle,
    reco_btn_click: params.reco_btn_click,
  })
}

/**
 * 집안일 수정 이벤트 추적
 */
export function trackChoreUpdated(params: {
  user_id?: number
  title: string
  task_type: 'RECOMMEND' | 'MANUAL'
  before_cycle: string
  after_cycle: string
  reco_btn_click: boolean
  cycle_changed: boolean
}) {
  trackEvent('task_update', {
    user_id: params.user_id,
    title: params.title,
    task_type: params.task_type,
    before_cycle: params.before_cycle,
    after_cycle: params.after_cycle,
    reco_btn_click: params.reco_btn_click,
    cycle_changed: params.cycle_changed,
  })
}

/**
 * 집안일 삭제 이벤트 추적
 */
export function trackChoreDeleted(params: { user_id?: number }) {
  trackEvent('task_deleted', {
    user_id: params.user_id,
  })
}
