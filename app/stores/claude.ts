import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { ClaudeFailure, type ClaudeCaller } from '~/services/ai/caller'
import { createClaudeCaller } from '~/services/ai/client'
import {
    clearKey,
    readKey,
    saveKey,
    type KeyStores,
} from '~/services/ai/keyStorage'

/**
 * The Claude connection, kept apart from the brief store so the key can never
 * end up in a saved brief or an export.
 */
export const useClaudeStore = defineStore('claude', () => {
    const stores = (): KeyStores => ({
        session: sessionStorage,
        local: localStorage,
    })

    const readSaved = () => {
        try {
            return readKey(stores())
        } catch {
            return { key: '', remember: false }
        }
    }

    const saved = readSaved()
    const caller = shallowRef<ClaudeCaller | null>(
        saved.key ? createClaudeCaller(saved.key) : null
    )
    const remember = ref(saved.remember)
    const checking = ref(false)
    const error = ref('')
    const sheetOpen = ref(false)
    /** Why the sheet was opened, when a feature needed Claude. */
    const reason = ref('')

    const connected = computed(() => caller.value !== null)

    const openSheet = (why = '') => {
        reason.value = why
        error.value = ''
        sheetOpen.value = true
    }

    /** The caller, or null after opening the sheet to ask for a key. */
    const require = (why: string) => {
        if (caller.value) return caller.value
        openSheet(why)
        return null
    }

    const connect = async (key: string, keep: boolean) => {
        const trimmed = key.trim()
        if (!trimmed) {
            error.value = 'Paste your API key first.'
            return false
        }
        checking.value = true
        error.value = ''
        const candidate = createClaudeCaller(trimmed)
        try {
            await candidate.check()
            caller.value = candidate
            remember.value = keep
            try {
                saveKey(stores(), trimmed, keep)
            } catch {
                // Storage blocked: the key still works until the page reloads.
            }
            sheetOpen.value = false
            return true
        } catch (failure) {
            error.value =
                failure instanceof ClaudeFailure
                    ? failure.message
                    : 'Couldn’t check that key. Try again.'
            return false
        } finally {
            checking.value = false
        }
    }

    const forget = () => {
        caller.value = null
        remember.value = false
        try {
            clearKey(stores())
        } catch {
            // Nothing stored to clear.
        }
    }

    return {
        caller,
        connected,
        remember,
        checking,
        error,
        sheetOpen,
        reason,
        openSheet,
        require,
        connect,
        forget,
    }
})
