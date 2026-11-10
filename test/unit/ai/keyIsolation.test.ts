import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { memoryStorage, type MemoryStorage } from '../../support/memoryStorage'

/**
 * The API key must never reach a saved brief, a downloaded brief or any
 * export. The two stores run here for real, with in-memory browser storage.
 */

const KEY = 'sk-ant-api-test-0123456789'

vi.mock('~/services/ai/client', () => ({
    createClaudeCaller: () => ({
        run: async () => ({}),
        check: async () => {},
    }),
}))

describe('API key isolation', () => {
    let local: MemoryStorage
    let session: MemoryStorage

    beforeEach(() => {
        local = memoryStorage()
        session = memoryStorage()
        vi.stubGlobal('localStorage', local)
        vi.stubGlobal('sessionStorage', session)
        setActivePinia(createPinia())
    })

    afterEach(() => vi.unstubAllGlobals())

    it('keeps the key out of saved briefs and every export', async () => {
        const { useBriefStore } = await import('~/stores/brief')
        const { useClaudeStore } = await import('~/stores/claude')
        const { exportKit } = await import('~/services/export/kit')
        const { briefFile, listBriefs } =
            await import('~/services/brief/persistence')

        const store = useBriefStore()
        const claude = useClaudeStore()
        store.loadExample()
        expect(await claude.connect(KEY, true)).toBe(true)
        store.brief.title = 'Changed after connecting'
        await nextTick()

        const [saved] = listBriefs(local)
        expect(saved?.brief.title).toBe('Changed after connecting')
        expect(JSON.stringify(saved)).not.toContain(KEY)
        expect(briefFile(store.brief).text).not.toContain(KEY)
        for (const item of exportKit(store.brief)) {
            expect(item.text).not.toContain(KEY)
        }
    })

    it('stores a session key only in session storage', async () => {
        const { useClaudeStore } = await import('~/stores/claude')
        const claude = useClaudeStore()
        await claude.connect(KEY, false)
        expect(session.dump()).toContain(KEY)
        expect(local.dump()).not.toContain(KEY)
        claude.forget()
        expect(session.dump()).not.toContain(KEY)
        expect(claude.connected).toBe(false)
    })
})
