import { describe, expect, it } from 'vitest'
import {
    extractBriefHeadings,
    extractFonts,
    extractMarkdownFields,
    extractShippedBlocks,
} from '../../../scripts/syncNuxion'

describe('extractFonts', () => {
    it('reads names and fallbacks', () => {
        const source = `export const fontOptions = {
    inter: {
        name: 'Inter',
        fallback: 'sans-serif',
    },
}
`
        expect(extractFonts(source)).toEqual([
            { name: 'Inter', fallback: 'sans-serif' },
        ])
    })

    it('fails loudly if the file changes shape', () => {
        expect(() => extractFonts('export const other = {}')).toThrow(
            /fontOptions/
        )
    })
})

describe('extractMarkdownFields', () => {
    const source = `
const TITLE_FIELDS = ['title', 'heading'] as const
const FIGURE_FIELDS = ['value'] as const
const PROSE_FIELDS = ['body'] as const
const TEXT_FIELDS = [
    'intro',
    'bio',
] as const
const LIST_FIELDS = ['includes'] as const
const NESTED_FIELDS = ['items'] as const
`
    it('reads each role', () => {
        expect(extractMarkdownFields(source)).toEqual({
            title: ['title', 'heading'],
            figure: ['value'],
            prose: ['body'],
            text: ['intro', 'bio'],
            list: ['includes'],
            nested: ['items'],
        })
    })

    it('names the constant it could not find', () => {
        expect(() => extractMarkdownFields('')).toThrow(/TITLE_FIELDS/)
    })
})

describe('extractShippedBlocks', () => {
    it('reads plain and quoted registry keys', () => {
        const source = `
        faq: lazy(() => import('./Faq.vue')),
        'cta-banner': lazy(() => import('./CtaBanner.vue')),
        notABlock: somethingElse,`
        expect(extractShippedBlocks(source)).toEqual(['faq', 'cta-banner'])
    })
})

describe('extractBriefHeadings', () => {
    it('reads level two and three headings only', () => {
        expect(
            extractBriefHeadings('# One\n## Two\n### Three\n#### Four')
        ).toEqual(['## Two', '### Three'])
    })
})
