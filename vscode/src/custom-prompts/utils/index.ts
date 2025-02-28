import { CodyPromptType } from '@sourcegraph/cody-shared/src/chat/prompts'

export type CustomCommandMenuAction = 'add' | 'file' | 'delete' | 'list' | 'open' | 'cancel' | 'example'

export interface CustomCommandMenuAnswer {
    actionID: CustomCommandMenuAction
    commandType: CodyPromptType
}

export interface UserWorkspaceInfo {
    homeDir: string
    workspaceRoot?: string
    currentFilePath?: string
}
