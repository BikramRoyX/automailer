
export interface WorkflowState {
    templateStatus?: string
    resumeStatus?: string
    communityStatus?: string
    resumePath?: string | null
}

export function validateWorkflowUpdate(
    currentState: WorkflowState,
    updates: Partial<WorkflowState>
): { valid: boolean; error?: string } {
    const { templateStatus, resumeStatus, communityStatus } = updates

    // 1. Resources Check
    // (Resume/Community status updates are generally allowed if implicit, 
    // but here we focus on the DEPENDENT locks)

    // 2. Template (Craft) locking
    if (templateStatus === 'GENERATING' || templateStatus === 'GENERATED') {
        // Current state OR updated state must satisfy requirements
        const isResumeReady =
            (currentState.resumeStatus === 'UPLOADED' || resumeStatus === 'UPLOADED') &&
            currentState.resumePath // Path must exist in DB (updates don't usually set path directly in this call, but if they did we'd check that too, but purely relying on DB state for path is safer)

        const isCommunityReady =
            (currentState.communityStatus !== 'NOT_SELECTED' || (communityStatus && communityStatus !== 'NOT_SELECTED'))

        if (!isResumeReady) {
            return { valid: false, error: "Resume must be uploaded before generating template." }
        }

        if (!isCommunityReady) {
            return { valid: false, error: "Community Database must be selected before generating template." }
        }
    }

    return { valid: true }
}
