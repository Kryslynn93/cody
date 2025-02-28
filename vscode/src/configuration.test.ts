import { describe, expect, it } from 'vitest'
import type * as vscode from 'vscode'

import { DOTCOM_URL } from './chat/protocol'
import { getConfiguration } from './configuration'

describe('getConfiguration', () => {
    it('returns default values when no config set', () => {
        const config: Pick<vscode.WorkspaceConfiguration, 'get'> = {
            get: <T>(_key: string, defaultValue?: T): typeof defaultValue | undefined => defaultValue,
        }
        expect(getConfiguration(config)).toEqual({
            pluginsConfig: {},
            pluginsDebugEnabled: true,
            pluginsEnabled: false,
            serverEndpoint: DOTCOM_URL.href,
            codebase: '',
            useContext: 'embeddings',
            autocomplete: true,
            experimentalCommandLenses: false,
            experimentalChatPredictions: false,
            experimentalGuardrails: false,
            inlineChat: true,
            experimentalNonStop: false,
            customHeaders: {},
            debugEnable: false,
            debugVerbose: false,
            debugFilter: null,
            telemetryLevel: 'all',
            autocompleteAdvancedProvider: 'anthropic',
            autocompleteAdvancedServerEndpoint: null,
            autocompleteAdvancedAccessToken: null,
            autocompleteAdvancedEmbeddings: true,
            autocompleteExperimentalCompleteSuggestWidgetSelection: false,
        })
    })

    it('reads values from config', () => {
        const config: Pick<vscode.WorkspaceConfiguration, 'get'> = {
            get: key => {
                switch (key) {
                    case 'cody.serverEndpoint':
                        return 'http://example.com'
                    case 'cody.codebase':
                        return 'my/codebase'
                    case 'cody.useContext':
                        return 'keyword'
                    case 'cody.customHeaders':
                        return {
                            'Cache-Control': 'no-cache',
                            'Proxy-Authenticate': 'Basic',
                        }
                    case 'cody.autocomplete.enabled':
                        return false
                    case 'cody.experimental.chatPredictions':
                        return true
                    case 'cody.experimental.commandLenses':
                        return true
                    case 'cody.experimental.guardrails':
                        return true
                    case 'cody.inlineChat.enabled':
                        return true
                    case 'cody.experimental.nonStop':
                        return true
                    case 'cody.debug.enable':
                        return true
                    case 'cody.debug.verbose':
                        return true
                    case 'cody.debug.filter':
                        return /.*/
                    case 'cody.telemetry.level':
                        return 'off'
                    case 'cody.autocomplete.advanced.provider':
                        return 'unstable-codegen'
                    case 'cody.autocomplete.advanced.serverEndpoint':
                        return 'https://example.com/llm'
                    case 'cody.autocomplete.advanced.accessToken':
                        return 'foobar'
                    case 'cody.autocomplete.advanced.embeddings':
                        return false
                    case 'cody.autocomplete.experimental.completeSuggestWidgetSelection':
                        return false
                    case 'cody.plugins.enabled':
                        return true
                    case 'cody.plugins.config':
                        return {
                            foo: 'bar',
                        }
                    case 'cody.plugins.debug.enabled':
                        return false
                    default:
                        throw new Error(`unexpected key: ${key}`)
                }
            },
        }
        expect(getConfiguration(config)).toEqual({
            pluginsEnabled: true,
            pluginsConfig: { foo: 'bar' },
            pluginsDebugEnabled: false,
            serverEndpoint: 'http://example.com',
            codebase: 'my/codebase',
            useContext: 'keyword',
            customHeaders: {
                'Cache-Control': 'no-cache',
                'Proxy-Authenticate': 'Basic',
            },
            autocomplete: false,
            experimentalChatPredictions: true,
            experimentalCommandLenses: true,
            experimentalGuardrails: true,
            inlineChat: true,
            experimentalNonStop: true,
            debugEnable: true,
            debugVerbose: true,
            debugFilter: /.*/,
            telemetryLevel: 'off',
            autocompleteAdvancedProvider: 'unstable-codegen',
            autocompleteAdvancedServerEndpoint: 'https://example.com/llm',
            autocompleteAdvancedAccessToken: 'foobar',
            autocompleteAdvancedEmbeddings: false,
            autocompleteExperimentalCompleteSuggestWidgetSelection: false,
        })
    })
})
