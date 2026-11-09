import { describe, expect, it } from 'vitest'
import { runChecks } from '~/services/brief/checks'
import { headlineLines } from '~/services/brief/checks/typography'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief, type Brief } from '~/services/brief/model'

const measure = (text: string) => text.length * 10
const messages = (brief: Brief) =>
    runChecks(brief, measure).map((issue) => issue.message)
const fieldsOf = (brief: Brief, severity: 'error' | 'warn') =>
    runChecks(brief, measure)
        .filter((issue) => issue.severity === severity)
        .map((issue) => issue.field)

describe('runChecks', () => {
    it('finds nothing blocking in the worked example', () => {
        expect(fieldsOf(exampleBrief(), 'error')).toEqual([])
    })

    it('blocks a theme with no name', () => {
        expect(fieldsOf(blankBrief(), 'error')).toContain('title')
    })

    it('rejects a prefix of the wrong length', () => {
        const brief = exampleBrief()
        brief.px = 'd'
        expect(fieldsOf(brief, 'error')).toContain('px')
    })

    it('flags a text colour that fails AA', () => {
        const brief = exampleBrief()
        const paper = brief.swatches.find((swatch) => swatch.id === 'paper')!
        paper.hex = '#13233B'
        expect(messages(brief).join()).toMatch(
            /canvas \(light\): text on background/
        )
    })

    it('holds an accent to the lower UI threshold only', () => {
        const brief = exampleBrief()
        const accent = brief.swatches.find((swatch) => swatch.id === 'a1')!
        accent.hex = '#A85B00'
        expect(messages(brief).join()).not.toMatch(/accent on background/)
        accent.hex = '#EADFCB'
        expect(messages(brief).join()).toMatch(/accent on background/)
    })

    it('warns when a slug names a colour', () => {
        const brief = exampleBrief()
        brief.swatches[0]!.slug = 'violet'
        expect(messages(brief).join()).toMatch(/dw-violet names a colour/)
    })

    it('blocks a malformed hex and a repeated slug', () => {
        const brief = exampleBrief()
        brief.swatches[0]!.hex = '#abc'
        brief.swatches[1]!.slug = brief.swatches[2]!.slug
        const errors = fieldsOf(brief, 'error')
        expect(errors).toContain('swatches.0.hex')
        expect(errors).toContain('swatches.2.slug')
    })

    it('blocks a signature feature nothing delivers', () => {
        const brief = exampleBrief()
        brief.features[0]!.ref = ''
        expect(fieldsOf(brief, 'error')).toContain('features.0.ref')
    })

    it('does not count demo-only originality checks', () => {
        const brief = exampleBrief()
        brief.originality = [true, true, false, false, true, true, true]
        expect(messages(brief).join()).not.toMatch(/originality/)
    })

    it('warns about a rule only the README keeps', () => {
        const brief = exampleBrief()
        brief.rules[0]!.keep = 'readme'
        expect(fieldsOf(brief, 'warn')).toContain('rules.0.keep')
    })

    it('blocks a font without a self-hosting licence', () => {
        const brief = exampleBrief()
        brief.fonts.body = {
            family: 'Paid Sans',
            weights: '',
            licence: 'Commercial',
            fallback: 'sans-serif',
        }
        expect(fieldsOf(brief, 'error')).toContain('fonts.body')
    })

    it('warns about a font outside fonts.js', () => {
        const brief = exampleBrief()
        brief.fonts.body = {
            family: 'Open Thing',
            weights: '',
            licence: 'OFL 1.1',
            fallback: 'sans-serif',
        }
        expect(messages(brief).join()).toMatch(/isn’t in fonts\.js/)
    })

    it('warns about a size that is not a CSS length', () => {
        const brief = exampleBrief()
        brief.layout.width = 'wide'
        brief.layout.radius.card = '12'
        expect(fieldsOf(brief, 'warn')).toEqual(
            expect.arrayContaining(['layout.width', 'layout.radius.card'])
        )
    })

    it('ignores the blocks step until it is switched on', () => {
        const brief = exampleBrief()
        brief.blocks[0]!.slug = ''
        expect(fieldsOf(brief, 'error')).not.toContain('blocks.0.slug')
        brief.blocksOn = true
        expect(fieldsOf(brief, 'error')).toContain('blocks.0.slug')
    })

    it('warns when a block’s fields never reach Markdown', () => {
        const brief = exampleBrief()
        brief.blocksOn = true
        expect(messages(brief).join()).toMatch(/driftwire\.cta: only the intro/)
    })
})

describe('headlineLines', () => {
    it('wraps words to the phone width', () => {
        const brief = exampleBrief()
        brief.headline = 'x'.repeat(30)
        expect(headlineLines(brief, measure)).toBe(1)
        brief.headline = `${'x'.repeat(30)} ${'y'.repeat(30)}`
        expect(headlineLines(brief, measure)).toBe(2)
    })

    it('returns null until there is a font and a mobile size', () => {
        const brief = blankBrief()
        brief.headline = 'Anything'
        expect(headlineLines(brief, measure)).toBeNull()
    })

    it('raises a warning past three lines', () => {
        const brief = exampleBrief()
        brief.headline = Array(4).fill('x'.repeat(30)).join(' ')
        expect(fieldsOf(brief, 'warn')).toContain('scale.0.mobile')
    })
})
