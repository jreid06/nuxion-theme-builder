import { describe, expect, it } from 'vitest'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief } from '~/services/brief/model'
import {
    ClaudeFailure,
    describeFailure,
    type ClaudeCaller,
} from '~/services/ai/caller'
import {
    clearKey,
    KEY_STORAGE,
    readKey,
    saveKey,
} from '~/services/ai/keyStorage'
import { designFields, keepValidFields } from '~/services/ai/blockDesign'
import { generatePalette } from '~/services/ai/palette'
import {
    briefContext,
    blockFieldsRequest,
    draftRequest,
    fieldRequest,
    paletteRequest,
    SYSTEM_PROMPT,
    type AiRequest,
} from '~/services/ai/prompts'
import {
    applyProposals,
    defaultSelection,
    draftProposals,
} from '~/services/ai/proposals'
import {
    PALETTE_PRESETS,
    type PaletteColours,
} from '~/services/inspire/palettes'

const fakeStore = () => {
    const data = new Map<string, string>()
    return {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        removeItem: (key: string) => void data.delete(key),
        data,
    }
}

/** A caller that answers from a queue and records what it was asked. */
const fakeCaller = (answers: unknown[]) => {
    const asked: AiRequest<unknown>[] = []
    const caller: ClaudeCaller = {
        async run<T>(request: AiRequest<T>) {
            asked.push(request as AiRequest<unknown>)
            return answers.shift() as T
        },
        async check() {},
    }
    return { caller, asked }
}

const good = PALETTE_PRESETS[0]!.colours
const bad: PaletteColours = { ...good, ink: '#EDE6DD' }

describe('prompts', () => {
    it('puts the concept first, before anything else in the brief', () => {
        const context = briefContext(exampleBrief())
        const order = [
            'Theme:',
            'Mood:',
            'Direction:',
            'Positioning:',
            'Palette:',
        ].map((label) => context.indexOf(label))
        expect(order.every((position) => position >= 0)).toBe(true)
        expect([...order].sort((a, b) => a - b)).toEqual(order)
    })

    it('tells Claude about blocks and chrome once that step is on', () => {
        const brief = exampleBrief()
        expect(briefContext(brief)).not.toMatch(/Navigation:/)
        brief.blocksOn = true
        const context = briefContext(brief)
        expect(context).toMatch(
            /Navigation: Nuxion’s shipped one, restyled, on the night Color Theme\. always navy/
        )
        expect(context).toMatch(/- faq: Ruled lines between items/)
        expect(context).toMatch(/iPhone status-bar colour: the bar keeps/)
        expect(context).toMatch(/Color Themes: canvas, raised, night/)
    })

    it.each(['navNote', 'footerNote', 'safari'] as const)(
        'can suggest %s',
        (field) => {
            const request = fieldRequest(field, exampleBrief(), '')
            expect(request.prompt).toMatch(/Write three distinct options/)
            expect(request.effort).toBe('low')
        }
    )

    it('leaves out what has not been written yet', () => {
        const context = briefContext(blankBrief())
        expect(context).not.toMatch(/Mood:|Direction:|Palette:/)
    })

    it('keeps the system prompt fixed and forbids real brands', () => {
        expect(fieldRequest('mood', blankBrief(), '').system).toBe(
            SYSTEM_PROMPT
        )
        expect(SYSTEM_PROMPT).toMatch(/Never name real companies/)
    })

    it('asks for rewrites when the field already has text', () => {
        expect(fieldRequest('mood', blankBrief(), '').prompt).toMatch(
            /three distinct options/
        )
        expect(
            fieldRequest('mood', blankBrief(), 'A quiet harbour').prompt
        ).toMatch(
            /currently says:\n"A quiet harbour"[\s\S]*tighter, warmer, bolder/
        )
    })

    it('uses low effort for suggestions and medium for drafts', () => {
        expect(fieldRequest('refs', blankBrief(), '').effort).toBe('low')
        expect(draftRequest('product', blankBrief()).effort).toBe('medium')
    })

    it('names failing pairs when it asks again for a palette', () => {
        expect(paletteRequest(blankBrief()).prompt).not.toMatch(/failed/)
        expect(
            paletteRequest(blankBrief(), ['canvas: text 2:1']).prompt
        ).toMatch(/failed these contrast checks[\s\S]*- canvas: text 2:1/)
    })
})

describe('proposals', () => {
    const productDraft = {
        positioning: 'New positioning',
        audience: 'New audience',
        refs: 'New refs',
        features: [
            {
                text: 'A new thing',
                kind: 'block' as const,
                ref: '{name}.thing',
            },
        ],
    }

    it('starts with anything that would overwrite the author unticked', () => {
        const brief = exampleBrief()
        brief.refs = ''
        const proposals = draftProposals('product', brief, productDraft)
        const selected = defaultSelection(proposals)
        expect(selected.has('positioning')).toBe(false)
        expect(selected.has('refs')).toBe(true)
        expect(selected.has('feature-0')).toBe(true)
    })

    it('applies only the ticked proposals', () => {
        const brief = exampleBrief()
        const before = structuredClone(brief)
        const proposals = draftProposals('product', brief, productDraft)
        applyProposals(brief, proposals, new Set(['feature-0']))
        expect(brief.positioning).toBe(before.positioning)
        expect(brief.audience).toBe(before.audience)
        expect(brief.features).toHaveLength(before.features.length + 1)
        expect(brief.features.at(-1)).toEqual({
            text: 'A new thing',
            kind: 'block',
            ref: 'driftwire.thing',
        })
    })

    it('sets the direction from a concept draft', () => {
        const brief = blankBrief()
        const proposals = draftProposals('concept', brief, {
            mood: 'A quiet harbour.',
            vibes: ['calm', 'natural'],
            sector: 'hospitality',
        })
        applyProposals(brief, proposals, defaultSelection(proposals))
        expect(brief.mood).toBe('A quiet harbour.')
        expect(brief.direction).toEqual({
            vibes: ['calm', 'natural'],
            sector: 'hospitality',
        })
    })
})

describe('generatePalette', () => {
    const answer = (colours: PaletteColours) => ({
        name: 'Test',
        note: 'note',
        colours,
    })

    it('keeps a palette that passes first time', async () => {
        const { caller, asked } = fakeCaller([answer(good)])
        const result = await generatePalette(caller, blankBrief())
        expect(asked).toHaveLength(1)
        expect(result.retried).toBe(false)
        expect(result.contrast.failures).toEqual([])
    })

    it('asks once more, naming the failures, and stops there', async () => {
        const { caller, asked } = fakeCaller([answer(bad), answer(bad)])
        const result = await generatePalette(caller, blankBrief())
        expect(asked).toHaveLength(2)
        expect(asked[1]?.prompt).toMatch(/failed these contrast checks/)
        expect(result.retried).toBe(true)
        expect(result.contrast.failures.length).toBeGreaterThan(0)
    })

    it('rejects a palette with colours that are not hex', async () => {
        const { caller } = fakeCaller([answer({ ...good, accent: 'teal' })])
        await expect(
            generatePalette(caller, blankBrief())
        ).rejects.toBeInstanceOf(ClaudeFailure)
    })
})

describe('describeFailure', () => {
    it.each([
        [
            { kind: 'status', status: 401, message: '' },
            /didn’t accept that key/,
        ],
        [{ kind: 'status', status: 429, message: '' }, /rate limit/],
        [{ kind: 'status', status: 529, message: '' }, /busy/],
        [
            {
                kind: 'status',
                status: 400,
                message: 'Your credit balance is too low',
            },
            /credit balance is too low/,
        ],
        [{ kind: 'offline' }, /connection/],
        [{ kind: 'refusal' }, /declined/],
        [{ kind: 'cut-off' }, /cut off/],
    ] as const)('explains %o', (failure, expected) => {
        expect(describeFailure(failure)).toMatch(expected)
    })
})

describe('key storage', () => {
    it('keeps the key for the session unless asked to remember it', () => {
        const stores = { session: fakeStore(), local: fakeStore() }
        saveKey(stores, 'sk-session', false)
        expect(stores.local.data.has(KEY_STORAGE)).toBe(false)
        expect(readKey(stores)).toEqual({ key: 'sk-session', remember: false })

        saveKey(stores, 'sk-remembered', true)
        expect(stores.session.data.has(KEY_STORAGE)).toBe(false)
        expect(readKey(stores)).toEqual({
            key: 'sk-remembered',
            remember: true,
        })
    })

    it('forgets it everywhere', () => {
        const stores = { session: fakeStore(), local: fakeStore() }
        saveKey(stores, 'sk-a', true)
        clearKey(stores)
        expect(readKey(stores)).toEqual({ key: '', remember: false })
    })
})

describe('block planning', () => {
    const plan = {
        restyle: [
            { type: 'faq', treatment: 'Ruled rows', why: 'Already restyled' },
            { type: 'stats', treatment: 'Big figures', why: 'Proof' },
            { type: 'made-up', treatment: 'x', why: 'Not shipped' },
        ],
        build: [
            {
                slug: 'driftwire.Log Book',
                purpose: 'Releases as log entries',
                why: 'The changelog feature',
                fullWidth: true,
                answers: {
                    job: 'story',
                    shape: 'list',
                    itemParts: ['date', 'title', 'text'],
                    sectionParts: [],
                    actions: [],
                },
            },
            {
                slug: 'pricing',
                purpose: 'Already planned',
                why: 'x',
                fullWidth: true,
                answers: {
                    job: 'compare',
                    shape: 'list',
                    itemParts: [],
                    sectionParts: [],
                    actions: [],
                },
            },
        ],
    }

    it('asks for a plan with the shipped blocks listed', () => {
        const request = draftRequest('blocks', exampleBrief())
        expect(request.prompt).toMatch(/Plan the page blocks/)
        expect(request.prompt).toContain('testimonials')
        expect(request.effort).toBe('medium')
    })

    it('offers only shipped, unrestyled blocks and unplanned theme blocks', () => {
        const brief = exampleBrief()
        const proposals = draftProposals('blocks', brief, plan)
        expect(proposals.map((proposal) => proposal.label)).toEqual([
            'Restyle stats',
            'Build driftwire.log-book',
        ])
        expect(defaultSelection(proposals).size).toBe(2)
    })

    it('adds a planned block with fields made from its answers', () => {
        const brief = exampleBrief()
        const proposals = draftProposals('blocks', brief, plan)
        applyProposals(
            brief,
            proposals,
            new Set(proposals.map((proposal) => proposal.id))
        )
        const added = brief.blocks.at(-1)!
        expect(added).toMatchObject({ slug: 'log-book', fullWidth: true })
        expect(added.fields[0]).toMatchObject({
            name: 'releases',
            type: 'list',
        })
        expect(brief.restyled.at(-1)).toEqual({
            type: 'stats',
            treatment: 'Big figures',
        })
    })
})

describe('designFields', () => {
    const block = () => exampleBrief().blocks[4]!

    it('asks with the intro names, the types and the Markdown names', () => {
        const request = blockFieldsRequest(exampleBrief(), block())
        expect(request.prompt).toContain(
            'already has eyebrow, heading, description, ctas, align'
        )
        expect(request.prompt).toContain('list')
        expect(request.prompt).toContain('for lists items')
        expect(request.prompt).toContain('stats:list[value:string!')
    })

    it('keeps what the scaffolder accepts and says what it dropped', async () => {
        const { caller } = fakeCaller([
            {
                fields: [
                    {
                        name: 'stats',
                        type: 'list',
                        required: true,
                        of: [
                            { name: 'value', type: 'string', required: true },
                            { name: 'value', type: 'text', required: false },
                        ],
                        note: 'Each figure',
                    },
                    {
                        name: 'heading',
                        type: 'string',
                        required: false,
                        of: [],
                        note: '',
                    },
                    {
                        name: 'source',
                        type: 'text',
                        required: false,
                        of: [],
                        note: 'Where the numbers come from',
                    },
                ],
            },
        ])
        const designed = await designFields(caller, exampleBrief(), block())
        expect(designed.fields).toEqual([
            {
                name: 'stats',
                type: 'list',
                required: true,
                of: [{ name: 'value', type: 'string', required: true }],
            },
            { name: 'source', type: 'text', required: false },
        ])
        expect(designed.dropped).toHaveLength(2)
        expect(designed.notes.source).toBe('Where the numbers come from')
    })

    it('drops a list left with no item fields', () => {
        expect(
            keepValidFields([
                {
                    name: 'items',
                    type: 'list',
                    required: false,
                    of: [{ name: 'Bad', type: 'string', required: false }],
                },
            ]).fields
        ).toEqual([])
    })
})
