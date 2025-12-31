import ChoreForm from './ui/ChoreForm'

/**
 * AddChore 페이지
 *
 * ChoreForm은 집안일 생성/수정/삭제를 모두 처리합니다.
 * mode 파라미터에 따라 동작이 달라집니다:
 * - mode='add': 생성
 * - mode='edit': 수정
 */
export default function AddChoreScreen() {
  return <ChoreForm />
}
