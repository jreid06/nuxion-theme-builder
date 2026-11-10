import { describe, expect, it } from 'vitest'
import type { Issue } from '~/services/brief/checks'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief } from '~/services/brief/model'
import {
    coreSteps,
    STEPS,
    stepNavigation,
    stepStatus,
} from '~/services/brief/steps'

const step = (id: string) => STEPS.find((item) => item.id === id)!

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
