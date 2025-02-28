import { ChatContextStatus } from '@sourcegraph/cody-shared/src/chat/context'
import { CodyPrompt, CodyPromptType } from '@sourcegraph/cody-shared/src/chat/prompts'
import { RecipeID } from '@sourcegraph/cody-shared/src/chat/recipes/recipe'
import { ChatMessage, UserLocalHistory } from '@sourcegraph/cody-shared/src/chat/transcript/messages'
import { Configuration } from '@sourcegraph/cody-shared/src/configuration'
import { CodyLLMSiteConfiguration } from '@sourcegraph/cody-shared/src/sourcegraph-api/graphql/client'
import type { TelemetryEventProperties } from '@sourcegraph/cody-shared/src/telemetry'

import { View } from '../../webviews/NavBar'

/**
 * A message sent from the webview to the extension host.
 */
export type WebviewMessage =
    | { command: 'ready' }
    | { command: 'initialized' }
    | { command: 'event'; eventName: string; properties: TelemetryEventProperties | undefined } // new event log internal API (use createWebviewTelemetryService wrapper)
    | { command: 'submit'; text: string; submitType: 'user' | 'suggestion' }
    | { command: 'executeRecipe'; recipe: RecipeID }
    | { command: 'removeHistory' }
    | { command: 'restoreHistory'; chatID: string }
    | { command: 'deleteHistory'; chatID: string }
    | { command: 'links'; value: string }
    | { command: 'openFile'; filePath: string }
    | { command: 'edit'; text: string }
    | { command: 'insert'; text: string }
    | {
          command: 'auth'
          type: 'signin' | 'signout' | 'support' | 'app' | 'callback'
          endpoint?: string
          value?: string
      }
    | { command: 'abort' }
    | { command: 'setEnabledPlugins'; plugins: string[] }
    | { command: 'custom-prompt'; title: string; value?: CodyPromptType }
    | { command: 'reload' }

/**
 * A message sent from the extension host to the webview.
 */
export type ExtensionMessage =
    | { type: 'config'; config: ConfigurationSubsetForWebview & LocalEnv; authStatus: AuthStatus }
    | { type: 'login'; authStatus: AuthStatus }
    | { type: 'history'; messages: UserLocalHistory | null }
    | { type: 'transcript'; messages: ChatMessage[]; isMessageInProgress: boolean }
    | { type: 'contextStatus'; contextStatus: ChatContextStatus }
    | { type: 'view'; messages: View }
    | { type: 'errors'; errors: string }
    | { type: 'suggestions'; suggestions: string[] }
    | { type: 'app-state'; isInstalled: boolean }
    | { type: 'enabled-plugins'; plugins: string[] }
    | { type: 'custom-prompts'; prompts: [string, CodyPrompt][] }
    | { type: 'transcript-errors'; isTranscriptError: boolean }

/**
 * The subset of configuration that is visible to the webview.
 */
export interface ConfigurationSubsetForWebview
    extends Pick<Configuration, 'debugEnable' | 'serverEndpoint' | 'pluginsEnabled' | 'pluginsDebugEnabled'> {}

/**
 * URLs for the Sourcegraph instance and app.
 */
export const DOTCOM_URL = new URL('https://sourcegraph.com')
export const DOTCOM_CALLBACK_URL = new URL('https://sourcegraph.com/user/settings/tokens/new/callback')
export const CODY_DOC_URL = new URL('https://docs.sourcegraph.com/cody')
export const INTERNAL_S2_URL = new URL('https://sourcegraph.sourcegraph.com/')
// Community and support
export const DISCORD_URL = new URL('https://discord.gg/s2qDtYGnAE')
export const CODY_FEEDBACK_URL = new URL(
    'https://github.com/sourcegraph/cody/discussions/new?category=product-feedback&labels=vscode'
)
// APP
export const LOCAL_APP_URL = new URL('http://localhost:3080')
export const APP_LANDING_URL = new URL('https://about.sourcegraph.com/app')
export const APP_CALLBACK_URL = new URL('sourcegraph://user/settings/tokens/new/callback')

/**
 * The status of a users authentication, whether they're authenticated and have a
 * verified email.
 */
export interface AuthStatus {
    username?: string
    endpoint: string | null
    isLoggedIn: boolean
    showInvalidAccessTokenError: boolean
    authenticated: boolean
    hasVerifiedEmail: boolean
    requiresVerifiedEmail: boolean
    siteHasCodyEnabled: boolean
    siteVersion: string
    configOverwrites?: CodyLLMSiteConfiguration
    showNetworkError?: boolean
}

export const defaultAuthStatus = {
    endpoint: '',
    isLoggedIn: false,
    showInvalidAccessTokenError: false,
    authenticated: false,
    hasVerifiedEmail: false,
    requiresVerifiedEmail: false,
    siteHasCodyEnabled: false,
    siteVersion: '',
}

export const unauthenticatedStatus = {
    endpoint: '',
    isLoggedIn: false,
    showInvalidAccessTokenError: true,
    authenticated: false,
    hasVerifiedEmail: false,
    requiresVerifiedEmail: false,
    siteHasCodyEnabled: false,
    siteVersion: '',
}

export const networkErrorAuthStatus = {
    showInvalidAccessTokenError: false,
    authenticated: false,
    isLoggedIn: false,
    hasVerifiedEmail: false,
    showNetworkError: true,
    requiresVerifiedEmail: false,
    siteHasCodyEnabled: false,
    siteVersion: '',
}

/** The local environment of the editor. */
export interface LocalEnv {
    // The operating system kind
    os: string
    arch: string
    homeDir?: string | undefined

    // The URL scheme the editor is registered to in the operating system
    uriScheme: string
    // The application name of the editor
    appName: string
    extensionVersion: string

    // App Local State
    hasAppJson: boolean
    isAppInstalled: boolean
    isAppRunning: boolean
}

export function isLoggedIn(authStatus: AuthStatus): boolean {
    if (!authStatus.siteHasCodyEnabled) {
        return false
    }
    return authStatus.authenticated && (authStatus.requiresVerifiedEmail ? authStatus.hasVerifiedEmail : true)
}

export function isLocalApp(url: string): boolean {
    try {
        return new URL(url).origin === LOCAL_APP_URL.origin
    } catch {
        return false
    }
}

export function isDotCom(url: string): boolean {
    try {
        return new URL(url).origin === DOTCOM_URL.origin
    } catch {
        return false
    }
}

export function isInternalUser(url: string): boolean {
    try {
        return new URL(url).origin === INTERNAL_S2_URL.origin
    } catch {
        return false
    }
}

// The OS and Arch support for Cody app
export function isOsSupportedByApp(os?: string, arch?: string): boolean {
    if (!os || !arch) {
        return false
    }
    return os === 'darwin' || os === 'linux'
}

// Map the Arch to the app's supported Arch
export function archConvertor(arch: string): string {
    switch (arch) {
        case 'arm64':
            return 'aarch64'
        case 'x64':
            return 'x86_64'
    }
    return arch
}
