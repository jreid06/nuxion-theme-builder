import type { AiRequest } from './prompts'

/**
 * What the rest of the app needs from Claude. client.ts implements it with the
 * SDK; tests pass a fake, so nothing here touches the network.
 */
export interface ClaudeCaller {
    run<T>(request: AiRequest<T>): Promise<T>
    /** Resolves if the key works, throws a ClaudeFailure if not. */
    check(): Promise<void>
}

export type FailureKind =
    | { kind: 'status'; status: number; message: string }
    | { kind: 'offline' }
    | { kind: 'refusal' }
    | { kind: 'cut-off' }
    | { kind: 'unreadable' }
    | { kind: 'unknown' }

/** A failure already worded for the person using the app. */
export class ClaudeFailure extends Error {}

export const describeFailure = (failure: FailureKind): string => {
    switch (failure.kind) {
        case 'offline':
            return 'Couldn’t reach Anthropic. Check your connection and try again.'
        case 'refusal':
            return 'Claude declined this one. Try rewording what you’ve written, or fill it in by hand.'
        case 'cut-off':
            return 'Claude’s answer was cut off before it finished. Try again.'
        case 'unreadable':
            return 'Claude’s answer didn’t come back in the expected shape. Try again.'
        case 'unknown':
            return 'Something went wrong talking to Claude. Try again.'
        case 'status':
            if (failure.status === 401) {
                return 'Anthropic didn’t accept that key. Check you copied all of it, or create a new one.'
            }
            if (failure.status === 403) {
                return 'That key isn’t allowed to use this model. Check its permissions in the Claude Console.'
            }
            if (failure.status === 429) {
                return 'You’ve hit your rate limit. Wait a minute and try again.'
            }
            if (failure.status === 529 || failure.status >= 500) {
                return 'Anthropic is busy right now. Wait a moment and try again.'
            }
            return `Anthropic rejected the request: ${failure.message}`
    }
}
