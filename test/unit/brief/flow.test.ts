import { describe, expect, it } from 'vitest'
import type { Issue } from '~/services/brief/checks'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief, type Brief } from '~/services/brief/model'
import {
    loadBrief,
    parseBriefFile,
    saveBrief,
    STORAGE_KEY,
    withDefaults,
} from '~/services/brief/persistence'
import {
    coreSteps,
    STEPS,
    stepNavigation,
    stepStatus,
} from '~/services/brief/steps'

const step = (id: string) => STEPS.find((item) => item.id === id)!

const fakeStorage = () => {
    const data = new Map<string, string>()
    return {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        data,
    }
}

describe('stepStatus', () => {
    const issue = (severity: Issue['severity']): Issue => ({
        step: 'product',
        severity,
        field: 'x',
        message: 'x',
    })

    it('prefers errors over warnings over completion', () => {
        const brief = exampleBrief()
        expect(stepStatus(step('product'), brief, [])).toBe('done')
        expect(stepStatus(step('product'), brief, [issue('warn')])).toBe('warn')
        expect(
            stepStatus(step('product'), brief, [issue('warn'), issue('error')])
        ).toBe('error')
    })

    it('is todo while empty', () => {
        expect(stepStatus(step('product'), blankBrief(), [])).toBe('todo')
    })

    it('shows the optional step as skipped until it is switched on', () => {
        const brief = exampleBrief()
        expect(stepStatus(step('blocks'), brief, [])).toBe('skip')
        brief.blocksOn = true
        expect(stepStatus(step('blocks'), brief, [])).toBe('done')
    })

    it('leaves optional steps and the export out of the progress count', () => {
        expect(coreSteps.map(({ id }) => id)).not.toEqual(
            expect.arrayContaining(['blocks'])
        )
        expect(coreSteps).toHaveLength(9)
    })
})

describe('stepNavigation', () => {
    it('jumps over a skipped step in both directions', () => {
        const brief = exampleBrief()
        const fromArt = stepNavigation('art', brief)
        expect(fromArt.next?.id).toBe('review')
        expect(fromArt.skipped?.id).toBe('blocks')
        expect(stepNavigation('review', brief).previous?.id).toBe('art')
    })

    it('stops on the step once it is switched on', () => {
        const brief = exampleBrief()
        brief.blocksOn = true
        const fromArt = stepNavigation('art', brief)
        expect(fromArt.next?.id).toBe('blocks')
        expect(fromArt.skipped).toBeUndefined()
    })

    it('has no previous on the first step or next on the last', () => {
        const brief = exampleBrief()
        expect(stepNavigation('concept', brief).previous).toBeUndefined()
        expect(stepNavigation('review', brief).next).toBeUndefined()
    })
})

describe('persistence', () => {
    it('round-trips a brief', () => {
        const storage = fakeStorage()
        const brief: Brief = exampleBrief()
        brief.title = 'Changed'
        saveBrief(storage, brief)
        expect(loadBrief(storage)).toEqual(brief)
    })

    it('returns null for nothing saved, bad JSON or the wrong shape', () => {
        const storage = fakeStorage()
        expect(loadBrief(storage)).toBeNull()
        storage.data.set(STORAGE_KEY, '{not json')
        expect(loadBrief(storage)).toBeNull()
        storage.data.set(STORAGE_KEY, JSON.stringify({ v: 99, swatches: [] }))
        expect(loadBrief(storage)).toBeNull()
    })

    it('fills fields an older save does not have', () => {
        const brief = withDefaults({ v: 1, swatches: [] })
        expect(brief.layout.spacing).toBe('default')
        expect(brief.studio.colours).toBe(true)
    })

    it('keeps a partial layout and fills the rest', () => {
        const brief = withDefaults({
            v: 1,
            swatches: [],
            studio: { ...blankBrief().studio, home: false },
        })
        expect(brief.studio.home).toBe(false)
        expect(brief.studio.colours).toBe(true)
    })

    it('explains why a file cannot be opened', () => {
        expect(parseBriefFile('nope')).toMatchObject({
            ok: false,
            error: expect.stringContaining('valid JSON'),
        })
        expect(parseBriefFile('{"a":1}')).toMatchObject({
            ok: false,
            error: expect.stringContaining('saved theme brief'),
        })
    })

    it('opens a saved brief', () => {
        const brief = exampleBrief()
        const result = parseBriefFile(JSON.stringify(brief))
        expect(result).toEqual({ ok: true, brief })
    })
})
