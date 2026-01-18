// Scripts must be run with: npx ts-node scripts/verify-workflow.ts

// --- Inlined Validation Logic for Testing ---
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

    // 2. Template (Craft) locking
    if (templateStatus === 'GENERATING' || templateStatus === 'GENERATED') {
        // Current state OR updated state must satisfy requirements
        const isResumeReady =
            (currentState.resumeStatus === 'UPLOADED' || resumeStatus === 'UPLOADED') &&
            currentState.resumePath // Path must exist in DB

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
// --------------------------------------------

function runTest(name: string, currentState: WorkflowState, updates: Partial<WorkflowState>, expectedValid: boolean) {
    const result = validateWorkflowUpdate(currentState, updates)
    if (result.valid === expectedValid) {
        console.log(`[PASS] ${name}`)
    } else {
        console.error(`[FAIL] ${name}`)
        console.error(`       Expected valid: ${expectedValid}, Got: ${result.valid}`)
        if (result.error) console.error(`       Error: ${result.error}`)
        process.exit(1) // Fail strict
    }
}

console.log("Starting Strict Workflow Validation Tests...\n")

// Scenario 1: Happy Path
runTest(
    "Allow GENERATING if prerequisites met",
    { resumeStatus: 'UPLOADED', resumePath: '/path/to/resume.pdf', communityStatus: 'SELECTED_DB' },
    { templateStatus: 'GENERATING' },
    true
)

// Scenario 2: Blocking - No Resume
runTest(
    "Block GENERATING if Resume missing",
    { resumeStatus: 'NOT_UPLOADED', resumePath: null, communityStatus: 'SELECTED_DB' },
    { templateStatus: 'GENERATING' },
    false
)

// Scenario 3: Blocking - Resume Status Uploaded but Path Missing (Corruption check)
runTest(
    "Block GENERATING if Resume path missing despite status",
    { resumeStatus: 'UPLOADED', resumePath: null, communityStatus: 'SELECTED_DB' },
    { templateStatus: 'GENERATING' },
    false
)

// Scenario 4: Blocking - No Community
runTest(
    "Block GENERATING if Community not selected",
    { resumeStatus: 'UPLOADED', resumePath: '/path.pdf', communityStatus: 'NOT_SELECTED' },
    { templateStatus: 'GENERATING' },
    false
)

// Scenario 5: Allow independent Resource updates
runTest(
    "Allow Resource Updates independently",
    { resumeStatus: 'NOT_UPLOADED', resumePath: null },
    { resumeStatus: 'UPLOADED' },
    true
)

console.log("\nAll Strict Workflow Tests Passed!")
