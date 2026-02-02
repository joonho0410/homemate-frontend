import { ScrollView, StyleSheet, View } from 'react-native'

import type { PresenterProps } from './types'

import DeleteModal from './ui/modals/DeleteModal'
import UpdateModal from './ui/modals/UpdateModal'

import FormCard from './ui/FormCard'
import ModalHeader from './ui/ModalHeader'
import TitleInput from './ui/TitleInput'
import RecommendChips from './ui/RecommendChips'
import SubmitButton from './ui/SubmitButton'

/**
 * AddChoreModalPresenter - 순수 UI 렌더링 컴포넌트
 * 모든 상태와 로직은 Container에서 props로 전달받음
 */
export default function AddChoreModalPresenter({
  config,
  form,
  canSubmit,
  isSubmitting,
  deleting,
  modalState,
  handlers,
  recommendations,
  repeatType,
}: PresenterProps) {
  return (
    <View style={styles.wrapper}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ModalHeader
            title={config.headerTitle}
            showDeleteButton={config.showDeleteButton}
            onDeletePress={handlers.openDeleteModal}
            deleting={deleting}
          />

          <View style={styles.flex1}>
            {/* 집안일 제목 */}
            <TitleInput form={form} maxLength={20} />

            {/* 추천 칩은 add 모드에서만 표시 */}
            {config.showRecommendChips && recommendations && (
              <RecommendChips
                chores={recommendations.randomChores}
                isLoading={recommendations.isLoading}
                isRefetching={recommendations.isRefetching}
                onSelect={recommendations.onSelect}
                onRefresh={recommendations.onRefresh}
              />
            )}
            {/* Form UI */}
            <FormCard form={form} />
          </View>
        </ScrollView>

        {/* Delete Modal */}
        {config.showDeleteButton && (
          <DeleteModal
            visible={modalState.deleteOpen}
            onClose={handlers.closeDeleteModal}
            onDeleteOnly={() => handlers.onDelete(false)}
            onDeleteAll={() => handlers.onDelete(true)}
            loading={deleting}
            repeatType={repeatType as any}
          />
        )}

        {/* Update Modal - edit-instance 모드 + 반복 일정인 경우만 표시 */}
        {config.showUpdateModal && (
          <UpdateModal
            visible={modalState.updateOpen}
            onClose={handlers.closeUpdateModal}
            onUpdateOnly={handlers.onUpdateOnly}
            onUpdateAll={handlers.onUpdateAll}
            loading={isSubmitting}
          />
        )}

        <SubmitButton
          onPress={handlers.onSubmitPress}
          disabled={!canSubmit || isSubmitting}
          label={config.submitLabel}
        />
      </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 20,
  },
  scroll: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: '#F8F8FA',
  },
  scrollContent: {
    paddingBottom: 120, // 하단 버튼 영역 만큼 확보
  },
  flex1: {
    flex: 1,
  },
})
