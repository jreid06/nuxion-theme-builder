import { describe, expect, it } from 'vitest'
import {
    contrastRatio,
    readableInk,
    sanityColor,
} from '~/services/brief/colour'
import { contrastGrid } from '~/services/brief/contrast'
import { exampleBrief } from '~/services/brief/example'
import {
    activeCornerPreset,
    CORNER_PRESETS,
    layoutTokens,
    themeVariables,
} from '~/services/brief/layout'
import { blankBrief } from '~/services/brief/model'
import {
    blockType,
    parseFields,
    pascalCase,
    prefixFor,
    slugify,
    typeClass,
} from '~/services/brief/names'
import { markdownRole } from '~/services/brief/nuxion'
import { schemesOf, slotSwatch, themeColors } from '~/services/brief/resolve'

describe('colour', () => {
    it('matches the ratios Driftwire’s brief measured', () => {
        expect(contrastRatio('#13233B', '#F5EFE3')).toBeCloseTo(13.78, 1)
        expect(contrastRatio('#FFFFFF', '#B02A1A')).toBeCloseTo(6.58, 1)
    })

    it('returns null for an unfinished colour', () => {
        expect(contrastRatio('#abc', '#FFFFFF')).toBeNull()
    })

    it('picks the readable ink for a fill', () => {
        expect(readableInk('#0E1C2F')).toBe('#FFFFFF')
        expect(readableInk('#F5EFE3')).toBe('#111111')
    })

    it('stores every form of a colour the way the Studio does', () => {
        const value = sanityColor('#FF0000')
        expect(value.rgb).toMatchObject({ r: 255, g: 0, b: 0, a: 1 })
        expect(value.hsl).toMatchObject({ h: 0, s: 1, l: 0.5 })
        expect(value.hsv).toMatchObject({ h: 0, s: 1, v: 1 })
    })
})

describe('names', () => {
    it('derives a slug and a prefix from a title', () => {
        expect(slugify('Salt Marsh!')).toBe('salt-marsh')
        expect(prefixFor('Salt Marsh')).toBe('sl')
        expect(prefixFor('')).toBe('')
    })

    it('names components the way TypeGen does', () => {
        expect(pascalCase('acme.logo-cloud')).toBe('AcmeLogoCloud')
    })

    it('parses a field list', () => {
        expect(parseFields(' cells, title ,, body')).toEqual([
            'cells',
            'title',
            'body',
        ])
    })

    it('fills the prefix into a type class', () => {
        const brief = exampleBrief()
        expect(
            typeClass(brief, { ...brief.scale[0]!, cls: '.{px}-eyebrow' })
        ).toBe('.dw-eyebrow')
    })

    it('namespaces a block', () => {
        const brief = exampleBrief()
        expect(blockType(brief, brief.blocks[6]!)).toBe('driftwire.pricing')
    })
})

describe('markdownRole', () => {
    it('reads roles from Nuxion’s field lists', () => {
        expect(markdownRole('heading')).toBe('Heading')
        expect(markdownRole('monthly')).toBe('Figure')
        expect(markdownRole('body')).toBe('Plain')
        expect(markdownRole('cells')).toBe('Items')
        expect(markdownRole('consoleFlags')).toBeUndefined()
    })
})

describe('resolve', () => {
    it('reuses a light colour when a dark slot is empty', () => {
        const night = exampleBrief().themes[2]!
        expect(slotSwatch(night, 'dark', 'bg')).toBe(night.light.bg)
    })

    it('only offers dark when the theme has a dark scheme', () => {
        const brief = exampleBrief()
        expect(schemesOf(brief)).toEqual(['light', 'dark'])
        brief.dark = 'none'
        expect(schemesOf(brief)).toEqual(['light'])
    })

    it('turns slots into colours', () => {
        const brief = exampleBrief()
        expect(themeColors(brief, brief.themes[0]!, 'dark').bg).toBe('#0E1C2F')
    })
})

describe('contrastGrid', () => {
    it('marks the pairs a theme uses and leaves the rest unused', () => {
        const grid = contrastGrid(exampleBrief())
        expect(grid.backgrounds).toEqual(['paper', 'ground', 'mist', 'panel'])
        expect(grid.cell('paper', 'inkl')).toMatchObject({
            used: true,
            required: 4.5,
            fails: false,
        })
        expect(grid.cell('paper', 'ink').used).toBe(false)
    })

    it('holds an accent pair to 3:1', () => {
        expect(contrastGrid(exampleBrief()).cell('paper', 'a1').required).toBe(
            3
        )
    })

    it('is empty until swatches are assigned', () => {
        expect(contrastGrid(blankBrief()).backgrounds).toEqual([])
    })
})

describe('layout', () => {
    it('writes nothing for an untouched brief', () => {
        expect(layoutTokens(blankBrief())).toEqual([])
    })

    it('writes only what the brief sets', () => {
        const brief = blankBrief()
        brief.layout.width = '70rem'
        brief.layout.measure.lead = '40rem'
        brief.layout.radius.card = '0'
        brief.layout.radius.input = '2px'
        brief.layout.depth = 'flat'
        expect(layoutTokens(brief)).toEqual([
            ['--container-8xl', '70rem'],
            ['--container-measure-lead', '40rem'],
            ['--radius-card', '0'],
            ['--shadow-media', 'none'],
        ])
    })

    it('recognises a preset and a custom set', () => {
        const brief = blankBrief()
        expect(activeCornerPreset(brief)).toBe('default')
        Object.assign(brief.layout.radius, CORNER_PRESETS.round)
        expect(activeCornerPreset(brief)).toBe('round')
        brief.layout.radius.card = '3px'
        expect(activeCornerPreset(brief)).toBe('')
    })

    it('generates one variable per art swatch, never a bare hex', () => {
        const variables = themeVariables(exampleBrief())
        expect(variables.map((item) => item.name)).toContain('--dw-art-6')
        expect(variables.map((item) => item.name)).not.toContain('--dw-paper')
        for (const { value } of variables) {
            expect(value.replace(/var\([^()]*\)/g, '')).not.toMatch(
                /#[0-9a-f]/i
            )
        }
    })
})
