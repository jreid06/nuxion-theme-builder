import { ref } from 'vue'
import { ClaudeFailure, type ClaudeCaller } from '~/services/ai/caller'

/**
 * Runs one Claude request for a component: asks for a key if there isn't one,
 * and tracks loading and a readable error.
 */
export const useClaudeTask = () => {
    const claude = useClaudeStore()
    const loading = ref(false)
    const error = ref('')

    const run = async <T>(
        reason: string,
        task: (caller: ClaudeCaller) => Promise<T>
    ): Promise<T | null> => {
        const caller = claude.require(reason)
        if (!caller) return null
        loading.value = true
        error.value = ''
        try {
            return await task(caller)
        } catch (failure) {
            error.value =
                failure instanceof ClaudeFailure
                    ? failure.message
                    : 'Something went wrong talking to Claude. Try again.'
            return null
        } finally {
            loading.value = false
        }
    }

    return { loading, error, run }
}
