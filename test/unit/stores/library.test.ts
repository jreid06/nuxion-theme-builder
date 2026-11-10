import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { exampleBrief } from '~/services/brief/example'
import { LEGACY_KEY, readBrief } from '~/services/brief/persistence'
import { memoryStorage, type MemoryStorage } from '../../support/memoryStorage'

/** The brief store against in-memory storage and a fixed clock. */

let storage: MemoryStorage

const createStore = async () => {
    setActivePinia(createPinia())
    const { useBriefStore } = await import('~/stores/brief')
    return useBriefStore()
}

beforeEach(() => {
    storage = memoryStorage()
    vi.stubGlobal('localStorage', storage)
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe('the brief library', () => {
    it('opens on the library with nothing open', async () => {
        const store = await createStore()
        expect(store.currentId).toBeNull()
        expect(store.library).toEqual([])
    })

    it('saves a new brief at once and keeps saving its edits', async () => {
        const store = await createStore()
        store.startBlank()
        const id = store.currentId!
        expect(readBrief(storage, id)?.updatedAt).toBe(1_000)

        vi.setSystemTime(5_000)
        store.brief.title = 'Saltmarsh'
        await nextTick()
        expect(readBrief(storage, id)).toMatchObject({
            updatedAt: 5_000,
            brief: { title: 'Saltmarsh' },
        })
    })

    it('doesn’t mark a brief as edited just because it was opened', async () => {
        const store = await createStore()
        store.loadExample()
        const id = store.currentId!
        store.closeBrief()

        vi.setSystemTime(9_000)
        store.openBrief(id)
        await nextTick()
        expect(readBrief(storage, id)?.updatedAt).toBe(1_000)
    })

    it('lists briefs newest first after closing one', async () => {
        const store = await createStore()
        store.startBlank()
        store.closeBrief()
        vi.setSystemTime(2_000)
        store.loadExample()
        store.closeBrief()
        expect(store.library.map((saved) => saved.brief.title)).toEqual([
            'Driftwire',
            '',
        ])
    })

    it('duplicates and deletes from the library', async () => {
        const store = await createStore()
        store.loadExample()
        const id = store.currentId!
        store.closeBrief()

        store.duplicate(id)
        expect(store.library.map((saved) => saved.brief.title).sort()).toEqual([
            'Driftwire',
            'Driftwire (copy)',
        ])
        store.remove(id)
        expect(store.library.map((saved) => saved.brief.title)).toEqual([
            'Driftwire (copy)',
        ])
    })

    it('adds a downloaded brief as a new one and opens it', async () => {
        const store = await createStore()
        expect(store.openFile(JSON.stringify(exampleBrief()))).toBeNull()
        expect(store.currentId).not.toBeNull()
        expect(store.brief.title).toBe('Driftwire')
        expect(store.openFile('nope')).toMatch(/valid JSON/)
    })

    it('brings the brief from the single-brief version into the list', async () => {
        storage.setItem(LEGACY_KEY, JSON.stringify(exampleBrief()))
        const store = await createStore()
        expect(store.library.map((saved) => saved.brief.title)).toEqual([
            'Driftwire',
        ])
        expect(storage.getItem(LEGACY_KEY)).toBeNull()
    })

    it('clears undo when switching briefs', async () => {
        const store = await createStore()
        store.startBlank()
        store.change('Mood', (brief) => {
            brief.mood = 'x'
        })
        expect(store.lastChange).not.toBeNull()
        store.closeBrief()
        expect(store.lastChange).toBeNull()
    })
})
