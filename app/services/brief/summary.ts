import { runChecks, type TextMeasure } from './checks'
import { isHex } from './colour'
import type { SavedBrief } from './persistence'
import { coreSteps, stepStatus } from './steps'
import { describeDirection } from '../inspire/direction'

/** What a brief's card on the Your briefs screen shows. */

export interface BriefSummary {
    id: string
    title: string
    codename: string
    status: string
    direction: string
    mood: string
    colours: string[]
    stepsDone: number
    stepsTotal: number
    blocking: number
    toReview: number
    updatedAt: number
    example: boolean
}

const MAX_COLOURS = 10

export const summariseBrief = (
    saved: SavedBrief,
    measure: TextMeasure
): BriefSummary => {
    const { brief } = saved
    const issues = runChecks(brief, measure)
    const blocking = issues.filter((issue) => issue.severity === 'error').length
    return {
        id: saved.id,
        title: brief.title || 'Untitled theme',
        codename: brief.name,
        status: brief.status,
        direction: describeDirection(brief),
        mood: brief.mood,
        colours: brief.swatches
            .map((swatch) => swatch.hex)
            .filter(isHex)
            .slice(0, MAX_COLOURS),
        stepsDone: coreSteps.filter(
            (step) => stepStatus(step, brief, issues) === 'done'
        ).length,
        stepsTotal: coreSteps.length,
        blocking,
        toReview: issues.length - blocking,
        updatedAt: saved.updatedAt,
        example: brief.example,
    }
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const plural = (count: number, unit: string) =>
    `${count} ${unit}${count === 1 ? '' : 's'} ago`

/** "Edited just now", "Edited 5 minutes ago", … then a date. */
export const describeEdited = (updatedAt: number, now: number) => {
    const elapsed = Math.max(0, now - updatedAt)
    if (elapsed < MINUTE) return 'Edited just now'
    if (elapsed < HOUR)
        return `Edited ${plural(Math.floor(elapsed / MINUTE), 'minute')}`
    if (elapsed < DAY)
        return `Edited ${plural(Math.floor(elapsed / HOUR), 'hour')}`
    if (elapsed < 2 * DAY) return 'Edited yesterday'
    return `Edited ${new Date(updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })}`
}
