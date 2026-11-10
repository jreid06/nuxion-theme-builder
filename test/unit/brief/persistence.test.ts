import { describe, expect, it } from 'vitest'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief } from '~/services/brief/model'
import {
    BRIEF_PREFIX,
    briefFile,
    duplicateBrief,
    LEGACY_KEY,
    listBriefs,
    migrateLegacyBrief,
    parseBriefFile,
    readBrief,
    removeBrief,
    withDefaults,
    writeBrief,
} from '~/services/brief/persistence'
import { describeEdited, summariseBrief } from '~/services/brief/summary'
import { memoryStorage } from '../../support/memoryStorage'

const measure = (text: string) => text.length * 10

describe('saved briefs', () => {
    it('round-trips a brief under its own key', () => {
        const storage = memoryStorage()
        const brief = exampleBrief()
        writeBrief(storage, { id: 'a', updatedAt: 5, brief })
        expect(storage.data.has(`${BRIEF_PREFIX}a`)).toBe(true)
        expect(readBrief(storage, 'a')).toEqual({
            id: 'a',
            updatedAt: 5,
            brief,
        })
    })

    it('lists only readable briefs, most recently edited first', () => {
        const storage = memoryStorage()
        writeBrief(storage, { id: 'old', updatedAt: 1, brief: blankBrief() })
        writeBrief(storage, { id: 'new', updatedAt: 9, brief: exampleBrief() })
        storage.setItem(`${BRIEF_PREFIX}broken`, '{not json')
        storage.setItem(
            `${BRIEF_PREFIX}wrong`,
            JSON.stringify({ updatedAt: 3, brief: { v: 99 } })
        )
        storage.setItem('something-else', 'x')
        expect(listBriefs(storage).map((saved) => saved.id)).toEqual([
            'new',
            'old',
        ])
    })

    it('removes one brief and leaves the rest', () => {
        const storage = memoryStorage()
        writeBrief(storage, { id: 'a', updatedAt: 1, brief: blankBrief() })
        writeBrief(storage, { id: 'b', updatedAt: 2, brief: blankBrief() })
        removeBrief(storage, 'a')
        expect(listBriefs(storage).map((saved) => saved.id)).toEqual(['b'])
    })

    it('moves the single brief from before into the list, once', () => {
        const storage = memoryStorage()
        const brief = exampleBrief()
        storage.setItem(LEGACY_KEY, JSON.stringify(brief))
        expect(migrateLegacyBrief(storage, 'moved', 42)).toBe('moved')
        expect(storage.getItem(LEGACY_KEY)).toBeNull()
        expect(readBrief(storage, 'moved')).toEqual({
            id: 'moved',
            updatedAt: 42,
            brief,
        })
        expect(migrateLegacyBrief(storage, 'again', 43)).toBeNull()
    })

    it('drops an unreadable old brief instead of looping on it', () => {
        const storage = memoryStorage()
        storage.setItem(LEGACY_KEY, '{broken')
        expect(migrateLegacyBrief(storage, 'x', 1)).toBeNull()
        expect(storage.getItem(LEGACY_KEY)).toBeNull()
        expect(listBriefs(storage)).toEqual([])
    })

    it('makes a copy that reads as a copy', () => {
        const original = exampleBrief()
        const copy = duplicateBrief(original)
        expect(copy.title).toBe('Driftwire (copy)')
        expect(copy.example).toBe(false)
        expect(copy.swatches).toEqual(original.swatches)
        copy.swatches.pop()
        expect(original.swatches).toHaveLength(17)
    })

    it('fills fields an older save does not have', () => {
        const brief = withDefaults({ v: 1, swatches: [] })
        expect(brief.layout.spacing).toBe('default')
        expect(brief.studio.colours).toBe(true)
        expect(brief.direction).toEqual({ vibes: [], sector: '' })
    })

    it('keeps a partial studio choice and fills the rest', () => {
        const brief = withDefaults({
            v: 1,
            swatches: [],
            studio: { ...blankBrief().studio, home: false },
        })
        expect(brief.studio.home).toBe(false)
        expect(brief.studio.colours).toBe(true)
    })
})

describe('brief files', () => {
    it('downloads a file that opens again', () => {
        const brief = exampleBrief()
        const { filename, text } = briefFile(brief)
        expect(filename).toBe('driftwire-brief.json')
        expect(parseBriefFile(text)).toEqual({ ok: true, brief })
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
})

describe('summaries', () => {
    it('summarises a brief for its card', () => {
        const summary = summariseBrief(
            { id: 'a', updatedAt: 7, brief: exampleBrief() },
            measure
        )
        expect(summary).toMatchObject({
            id: 'a',
            title: 'Driftwire',
            codename: 'driftwire',
            direction: 'Editorial, Technical, Calm · Software and tech',
            stepsTotal: 9,
            blocking: 0,
            example: true,
            updatedAt: 7,
        })
        expect(summary.colours).toHaveLength(10)
        expect(summary.toReview).toBeGreaterThan(0)
    })

    it('names an untitled brief', () => {
        expect(
            summariseBrief(
                { id: 'b', updatedAt: 0, brief: blankBrief() },
                measure
            ).title
        ).toBe('Untitled theme')
    })

    it('describes when a brief was edited', () => {
        const now = Date.UTC(2026, 10, 9, 12)
        expect(describeEdited(now - 20_000, now)).toBe('Edited just now')
        expect(describeEdited(now - 60_000, now)).toBe('Edited 1 minute ago')
        expect(describeEdited(now - 5 * 60_000, now)).toBe(
            'Edited 5 minutes ago'
        )
        expect(describeEdited(now - 3 * 3_600_000, now)).toBe(
            'Edited 3 hours ago'
        )
        expect(describeEdited(now - 30 * 3_600_000, now)).toBe(
            'Edited yesterday'
        )
        expect(describeEdited(Date.UTC(2026, 9, 2, 12), now)).toBe(
            'Edited 2 Oct 2026'
        )
    })
})
