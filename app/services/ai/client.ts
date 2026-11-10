import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { ClaudeFailure, describeFailure, type ClaudeCaller } from './caller'

/** The only file that talks to Anthropic. */

export const CLAUDE_MODEL = 'claude-opus-5-5'

const toFailure = (error: unknown) => {
    if (error instanceof ClaudeFailure) return error
    if (error instanceof Anthropic.APIConnectionError) {
        return new ClaudeFailure(describeFailure({ kind: 'offline' }))
    }
    if (error instanceof Anthropic.APIError && error.status) {
        return new ClaudeFailure(
            describeFailure({
                kind: 'status',
                status: error.status,
                message: error.message,
            })
        )
    }
    return new ClaudeFailure(describeFailure({ kind: 'unknown' }))
}

export const createClaudeCaller = (apiKey: string): ClaudeCaller => {
    // The key is the user's own and the request goes straight from their
    // browser to Anthropic: there is no server here to keep it on.
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

    return {
        async run(request) {
            try {
                const response = await client.beta.messages.parse({
                    model: CLAUDE_MODEL,
                    max_tokens: 16000,
                    // Re-runs a policy decline on Anthropic's suggested model.
                    betas: ['server-side-fallback-2026-07-01'],
                    fallbacks: 'default',
                    system: request.system,
                    messages: [{ role: 'user', content: request.prompt }],
                    output_config: {
                        effort: request.effort,
                        format: betaZodOutputFormat(request.schema),
                    },
                })
                if (response.stop_reason === 'refusal') {
                    throw new ClaudeFailure(
                        describeFailure({ kind: 'refusal' })
                    )
                }
                if (response.stop_reason === 'max_tokens') {
                    throw new ClaudeFailure(
                        describeFailure({ kind: 'cut-off' })
                    )
                }
                if (response.parsed_output == null) {
                    throw new ClaudeFailure(
                        describeFailure({ kind: 'unreadable' })
                    )
                }
                return response.parsed_output
            } catch (error) {
                throw toFailure(error)
            }
        },
        async check() {
            try {
                await client.models.list({ limit: 1 })
            } catch (error) {
                throw toFailure(error)
            }
        },
    }
}
