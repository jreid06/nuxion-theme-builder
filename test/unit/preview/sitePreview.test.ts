import { describe, expect, it } from 'vitest'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief } from '~/services/brief/model'
import {
    DESKTOP_WIDTH,
    PHONE_WIDTH,
    sitePreview,
} from '~/services/preview/sitePreview'

const feature = (text: string) => ({ text, kind: '' as const, ref: '' })

describe('sitePreview', () => {
    it('shows every signature feature that has text', () => {
        const brief = exampleBrief()
        brief.features = ['One', 'Two', ' ', 'Three', 'Four', 'Five'].map(
            feature
        )
        expect(sitePreview(brief, 'light', PHONE_WIDTH).features).toEqual([
            'One',
            'Two',
            'Three',
            'Four',
            'Five',
        ])
    })

    it('shows placeholders until a feature is written', () => {
        const brief = blankBrief()
        brief.features = [feature('')]
        expect(sitePreview(brief, 'light', PHONE_WIDTH).features).toHaveLength(
            3
        )
    })

    it('lets every column shrink below its longest word', () => {
        for (const width of [PHONE_WIDTH, DESKTOP_WIDTH]) {
            const site = sitePreview(blankBrief(), 'light', width)
            for (const columns of [site.heroColumns, site.featureColumns]) {
                const bare = columns.replace(/minmax\(0, [\d.]+fr\)/g, '')
                expect(bare).not.toMatch(/fr/)
            }
        }
    })
})
