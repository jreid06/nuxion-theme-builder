import { describe, expect, it } from 'vitest'
import { runChecks } from '~/services/brief/checks'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief, type Brief } from '~/services/brief/model'
import {
    describeDirection,
    MAX_VIBES,
    rankForDirection,
    toggleVibe,
} from '~/services/inspire/direction'
import {
    buildSentence,
    FIELD_GUIDES,
    rankedStarters,
} from '~/services/inspire/fieldGuides'
import {
    COMPOSER_QUESTIONS,
    composeIdentity,
    FEATURE_IDEAS,
    featureFromIdea,
    fillPlaceholders,
    RULE_IDEAS,
    ruleFromIdea,
} from '~/services/inspire/ideas'
import {
    applyPalette,
    PALETTE_PRESETS,
    paletteContrast,
} from '~/services/inspire/palettes'
import { surpriseMoods } from '~/services/inspire/surprise'
import {
    ANY_BLOCK_TREATMENTS,
    BLOCK_TREATMENTS,
    joinTreatment,
    knownTreatments,
    splitTreatment,
    togglePick,
    withCustom,
} from '~/services/inspire/treatments'
import { SHIPPED_BLOCKS } from '~/services/brief/nuxion'
import {
    applyScale,
    buildScale,
    describeScale,
    slotOf,
    TYPE_SCALE_PRESETS,
    TYPE_SUGGESTIONS,
} from '~/services/inspire/typeScales'
import { lengthInPx } from '~/services/brief/checks/typography'

const directed = (vibes: string[], sector = '') => {
    const brief = blankBrief()
    brief.direction = { vibes, sector }
    return brief
}

const measure = (text: string) => text.length * 10
const contrastErrors = (brief: Brief) =>
    runChecks(brief, measure).filter(
        (issue) => issue.step === 'themes' && issue.severity === 'error'
    )

describe('direction', () => {
    it('puts the items sharing most tags first, keeping order otherwise', () => {
        const items = [
            { id: 'a', tags: ['bold'] as const },
            { id: 'b', tags: ['calm', 'software'] as const },
            { id: 'c' },
            { id: 'd', tags: ['calm'] as const },
        ]
        const ranked = rankForDirection(items, directed(['calm'], 'software'))
        expect(ranked.map(({ item }) => item.id)).toEqual(['b', 'd', 'a', 'c'])
        expect(ranked.map(({ suits }) => suits)).toEqual([
            true,
            true,
            false,
            false,
        ])
    })

    it('leaves the order alone with no direction', () => {
        const items = [{ id: 'a', tags: ['bold'] as const }, { id: 'b' }]
        expect(
            rankForDirection(items, blankBrief()).map(({ item }) => item.id)
        ).toEqual(['a', 'b'])
    })

    it('caps mood words at three and toggles them off again', () => {
        let vibes: string[] = []
        for (const vibe of ['calm', 'bold', 'warm', 'playful']) {
            vibes = toggleVibe(vibes, vibe)
        }
        expect(vibes).toHaveLength(MAX_VIBES)
        expect(toggleVibe(vibes, 'bold')).toEqual(['calm', 'warm'])
    })

    it('describes itself for the brief and for Claude', () => {
        expect(describeDirection(exampleBrief())).toBe(
            'Editorial, Technical, Calm · Software and tech'
        )
        expect(describeDirection(blankBrief())).toBe('')
    })
})

describe('field guides', () => {
    it('builds a sentence only once every slot is picked', () => {
        const frame = FIELD_GUIDES.positioning.frame!
        expect(buildSentence(frame, { kind: 'Portfolios' })).toBe('')
        expect(
            buildSentence(frame, {
                kind: 'Portfolios',
                who: 'creative freelancers',
                want: 'something calm and editorial',
            })
        ).toBe(
            'Portfolios for creative freelancers who want something calm and editorial.'
        )
    })

    it('ranks reference starters by direction', () => {
        const [first] = rankedStarters('refs', directed(['natural']))
        expect(first?.item.text).toBe('The quiet of a botanical field guide.')
        expect(first?.suits).toBe(true)
    })

    it('offers art starters for the chosen imagery policy', () => {
        const brief = blankBrief()
        brief.art.policy = 'photography'
        expect(rankedStarters('artNote', brief)[0]?.item.text).toMatch(/hoto/)
    })
})

describe('surpriseMoods', () => {
    it('is repeatable with a fixed random source', () => {
        const brief = directed(['technical'])
        const fixed = () => 0
        expect(surpriseMoods(brief, fixed)).toEqual(surpriseMoods(brief, fixed))
        expect(surpriseMoods(brief, fixed, 2)).toHaveLength(2)
    })

    it('draws from parts that suit the direction', () => {
        const [line] = surpriseMoods(directed(['bold', 'playful']), () => 0)
        expect(line).toMatch(
            /^A record shop’s back room|^A funfair at closing time/
        )
    })
})

describe('ideas', () => {
    it('fills the codename and prefix into cards', () => {
        const brief = exampleBrief()
        expect(
            fillPlaceholders('{name}.hero + {Name}Scene, .{px}-x', brief)
        ).toBe('driftwire.hero + DriftwireScene, .dw-x')
    })

    it('turns every card into a complete row', () => {
        const brief = exampleBrief()
        for (const idea of FEATURE_IDEAS) {
            const feature = featureFromIdea(brief, idea)
            expect(feature.kind).toBe(idea.kind)
            expect(feature.ref).not.toMatch(/\{/)
        }
        for (const idea of RULE_IDEAS) {
            const rule = ruleFromIdea(brief, idea)
            expect(rule.how).toBeTruthy()
            expect(['token', 'block', 'studio', 'readme']).toContain(rule.keep)
        }
    })

    it('composes the idea only when all four answers are there', () => {
        const answers = {
            metaphor: 'a field notebook',
            colour: '',
            depth: '',
            tension: '',
        }
        expect(composeIdentity(answers)).toBe('')
        expect(
            composeIdentity({
                metaphor: 'a field notebook',
                colour: 'inks a printer would mix',
                depth: 'thin ruled lines',
                tension: 'huge type against tiny captions',
            })
        ).toBe(
            'The page is a field notebook. Colour comes from inks a printer would mix. Depth comes from thin ruled lines. The recognisable tension is huge type against tiny captions.'
        )
        expect(COMPOSER_QUESTIONS).toHaveLength(4)
    })
})

describe('palettes', () => {
    it.each(PALETTE_PRESETS.map((preset) => [preset.name, preset] as const))(
        '%s passes every contrast check',
        (_, preset) => {
            expect(paletteContrast(preset.colours).failures).toEqual([])
            const brief = blankBrief()
            applyPalette(brief, preset.colours)
            expect(contrastErrors(brief)).toEqual([])
        }
    )

    it('reports a failing pair in words Claude can act on', () => {
        const [preset] = PALETTE_PRESETS
        const contrast = paletteContrast({ ...preset!.colours, ink: '#EDE6DD' })
        expect(contrast.passing).toBeLessThan(contrast.total)
        expect(contrast.failures[0]).toMatch(
            /canvas \(light\): text #EDE6DD on #F7F1EA/
        )
    })

    it('repoints buttons at the new palette and leaves no stale swatch ids', () => {
        const brief = exampleBrief()
        applyPalette(brief, PALETTE_PRESETS[1]!.colours)
        const ids = new Set(brief.swatches.map((swatch) => swatch.id))
        for (const preset of brief.buttons) {
            for (const scheme of ['light', 'dark'] as const) {
                for (const id of [preset[scheme].fill, preset[scheme].text]) {
                    if (id) expect(ids).toContain(id)
                }
            }
        }
        const accent = brief.buttons.find((preset) => preset.name === 'Accent')!
        expect(accent.light).toEqual({ fill: 'accent', text: 'paper' })
    })

    it('keeps the swatch slugs role-named', () => {
        const brief = blankBrief()
        applyPalette(brief, PALETTE_PRESETS[0]!.colours)
        expect(
            runChecks(brief, measure).filter(
                (issue) => issue.step === 'swatches'
            )
        ).toEqual([])
    })
})

describe('type scales', () => {
    const px = (value: string) => lengthInPx(value)!

    it.each(TYPE_SCALE_PRESETS.map((preset) => [preset.name, preset] as const))(
        '%s builds a complete, ordered scale',
        (_, preset) => {
            const rows = buildScale(preset.spec)
            expect(rows.map((row) => row.cls)).toEqual(
                blankBrief().scale.map((row) => row.cls)
            )
            for (const row of rows) {
                expect(px(row.mobile)).toBeGreaterThan(0)
                expect(px(row.mobile)).toBeLessThanOrEqual(px(row.desktop))
                expect(Number(row.lh)).toBeGreaterThanOrEqual(1)
                expect(Number(row.lh)).toBeLessThanOrEqual(1.8)
                expect(row.tracking).toMatch(/^(0|-?0\.\d+em)$/)
                expect(Number(row.weight) % 100).toBe(0)
            }
            const [body, eyebrow] = rows.slice(6)
            expect([px(body!.mobile), px(body!.desktop)]).toEqual([
                preset.spec.body.mobile,
                preset.spec.body.desktop,
            ])
            expect(px(eyebrow!.desktop)).toBe(preset.spec.eyebrow.size)
            const headings = rows.slice(0, 6).map((row) => px(row.desktop))
            expect(headings).toEqual([...headings].sort((a, b) => b - a))
            expect(headings[0]).toBeGreaterThan(headings[5]!)
        }
    )

    it('lands on 2px steps and trims the numbers', () => {
        const [display, , , , , h6, body, eyebrow] = buildScale(
            TYPE_SCALE_PRESETS[0]!.spec
        )
        expect(display).toMatchObject({
            mobile: '2.5rem',
            desktop: '3.375rem',
            lh: '1.1',
            tracking: '-0.02em',
            weight: '700',
        })
        expect(h6).toMatchObject({ lh: '1.35', tracking: '0' })
        expect(body).toMatchObject({ mobile: '1rem', desktop: '1.125rem' })
        expect(eyebrow).toMatchObject({ tracking: '0.08em', mobile: '0.75rem' })
        expect(describeScale(buildScale(TYPE_SCALE_PRESETS[0]!.spec))).toBe(
            'Display 54px, 40px on phones · body 18px'
        )
    })

    it('fills the rows it knows and leaves the author’s own alone', () => {
        const brief = exampleBrief()
        brief.scale.push({ ...brief.scale[0]!, cls: '.{px}-quote', role: '' })
        const before = JSON.parse(JSON.stringify(brief.scale))
        const rows = buildScale(TYPE_SCALE_PRESETS[3]!.spec)
        applyScale(brief, rows)

        expect(brief.scale.map((row) => [row.cls, row.role])).toEqual(
            before.map((row: { cls: string; role: string }) => [
                row.cls,
                row.role,
            ])
        )
        expect(brief.scale[0]!.desktop).toBe(rows[0]!.desktop)
        expect(brief.scale.at(-2)!.tracking).toBe(rows.at(-1)!.tracking)
        expect(brief.scale.at(-1)).toEqual(before.at(-1))
    })

    it('fills a blank role, and an empty scale gets every row', () => {
        const brief = blankBrief()
        brief.scale[5]!.role = ''
        applyScale(brief, buildScale(TYPE_SCALE_PRESETS[0]!.spec))
        expect(brief.scale[5]!.desktop).not.toBe('')

        brief.scale = []
        const rows = buildScale(TYPE_SCALE_PRESETS[1]!.spec)
        applyScale(brief, rows)
        expect(brief.scale).toEqual(rows)
        expect(brief.scale[0]).not.toBe(rows[0])
    })

    it('recognises rows by class, whatever the prefix', () => {
        expect(slotOf('.heading-2')).toBe('h2')
        expect(slotOf(' .nuxion-paragraph ')).toBe('body')
        expect(slotOf('.dw-eyebrow')).toBe('eyebrow')
        expect(slotOf('.dw-quote')).toBeNull()
    })

    it('ranks presets by direction', () => {
        const [first] = rankForDirection(
            TYPE_SCALE_PRESETS,
            directed(['technical'], 'software')
        )
        expect(first).toMatchObject({ item: { name: 'Product' }, suits: true })
    })

    it('suggests values the checks can read', () => {
        for (const { value } of TYPE_SUGGESTIONS.size) {
            expect(lengthInPx(value)).not.toBeNull()
        }
        expect(
            new Set(TYPE_SUGGESTIONS.lh.map(({ value }) => value)).size
        ).toBe(TYPE_SUGGESTIONS.lh.length)
    })
})

describe('treatments', () => {
    const known = knownTreatments('faq')

    it('offers options only for blocks Nuxion ships', () => {
        expect(SHIPPED_BLOCKS).toEqual(
            expect.arrayContaining(Object.keys(BLOCK_TREATMENTS))
        )
    })

    it('never puts the separator inside an option', () => {
        const all = [
            ...ANY_BLOCK_TREATMENTS,
            ...Object.values(BLOCK_TREATMENTS).flat(),
        ]
        for (const { text } of all) expect(text).not.toContain(';')
    })

    it('lists a block’s own options before the general ones', () => {
        expect(known[0]).toBe(BLOCK_TREATMENTS.faq![0]!.text)
        expect(known).toContain('Sharp corners')
        expect(knownTreatments('spacer')).toEqual(
            ANY_BLOCK_TREATMENTS.map(({ text }) => text)
        )
    })

    it('reads an old free-text treatment as custom words', () => {
        expect(splitTreatment('ruled rows, serif questions', known)).toEqual({
            picks: [],
            custom: 'ruled rows, serif questions',
        })
    })

    it('splits picks from the author’s words and joins them back', () => {
        const text = 'Sharp corners; dated like a log; Two columns on desktop'
        const parts = splitTreatment(text, known)
        expect(parts).toEqual({
            picks: ['Sharp corners', 'Two columns on desktop'],
            custom: 'dated like a log',
        })
        expect(joinTreatment(parts)).toBe(
            'Sharp corners; Two columns on desktop; dated like a log'
        )
    })

    it('toggles an option on and off without touching the custom words', () => {
        const on = togglePick('dated like a log', 'Sharp corners', known)
        expect(on).toBe('Sharp corners; dated like a log')
        expect(togglePick(on, 'Sharp corners', known)).toBe('dated like a log')
    })

    it('keeps custom words exactly as typed, mid-word included', () => {
        expect(withCustom('Sharp corners; old words', 'one; two', known)).toBe(
            'Sharp corners; one; two'
        )
        expect(withCustom('Sharp corners; old words', '', known)).toBe(
            'Sharp corners'
        )
    })
})

describe('navigation and footer guides', () => {
    it('suggests notes for the bar the author chose', () => {
        const brief = blankBrief()
        const shipped = rankedStarters('navNote', brief).map(
            ({ item }) => item.text
        )
        brief.chrome.nav = 'theme'
        const theme = rankedStarters('navNote', brief).map(
            ({ item }) => item.text
        )
        expect(shipped.length).toBeGreaterThan(0)
        expect(theme.length).toBeGreaterThan(0)
        expect(theme).not.toEqual(shipped)
        brief.chrome.footer = 'theme'
        expect(rankedStarters('footerNote', brief).length).toBeGreaterThan(0)
    })

    it('explains every new field', () => {
        for (const field of ['navNote', 'footerNote', 'safari'] as const) {
            expect(FIELD_GUIDES[field].questions.length).toBeGreaterThan(0)
            expect(FIELD_GUIDES[field].note).toBeTruthy()
        }
    })
})
