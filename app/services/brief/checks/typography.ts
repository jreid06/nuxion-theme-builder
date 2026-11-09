import type { Brief, FontRole } from '../model'
import { fontStack } from '../names'
import { catalogFont } from '../nuxion'
import type { Issue } from '.'

/** Measures a string's width in px for a CSS font shorthand. */
export type TextMeasure = (text: string, font: string) => number

/** A 375px phone less the page gutters. */
export const PHONE_TEXT_WIDTH = 343
const MAX_HEADLINE_LINES = 3

const ROLE_LABEL: Record<FontRole, string> = {
    heading: 'Heading',
    body: 'Body',
    code: 'Code',
}

export const lengthInPx = (value: string): number | null => {
    const match = /^([\d.]+)(rem|px)$/.exec(value.trim())
    if (!match) return null
    return Number(match[1]) * (match[2] === 'rem' ? 16 : 1)
}

/** How many lines the longest headline takes on a phone, or null if unknown. */
export const headlineLines = (
    brief: Brief,
    measure: TextMeasure
): number | null => {
    const row = brief.scale[0]
    const size = row ? lengthInPx(row.mobile) : null
    if (!row || !size || !brief.headline || !brief.fonts.heading.family) {
        return null
    }

    const font = `${row.weight || 400} ${size}px ${fontStack(brief.fonts.heading)}`
    const tracking = (parseFloat(row.tracking) || 0) * size
    const width = (text: string) => measure(text, font) + tracking * text.length

    let lines = 1
    let current = ''
    for (const word of brief.headline.split(/\s+/)) {
        const candidate = current ? `${current} ${word}` : word
        if (current && width(candidate) > PHONE_TEXT_WIDTH) {
            lines += 1
            current = word
        } else {
            current = candidate
        }
    }
    return lines
}

export const checkTypography = (
    brief: Brief,
    measure: TextMeasure
): Issue[] => {
    const issues: Issue[] = []
    const add = (severity: Issue['severity'], field: string, message: string) =>
        issues.push({ step: 'type', severity, field, message })

    for (const role of ['heading', 'body', 'code'] as const) {
        const font = brief.fonts[role]
        const field = `fonts.${role}`
        if (!font.family) {
            add(
                'warn',
                field,
                `Choose a ${ROLE_LABEL[role].toLowerCase()} font.`
            )
            continue
        }
        if (!catalogFont(font.family)) {
            add(
                'warn',
                field,
                `${font.family} isn’t in fonts.js. It needs one entry there and npm run fonts:generate, in the same release as the theme.`
            )
        }
        if (!/ofl|apache/i.test(font.licence)) {
            add(
                'error',
                field,
                `${font.family} must be licensed for self-hosting (OFL or Apache).`
            )
        }
    }

    const lines = headlineLines(brief, measure)
    if (lines !== null && lines > MAX_HEADLINE_LINES) {
        add(
            'warn',
            'scale.0.mobile',
            `The longest headline runs to ${lines} lines at 375px. Aim for three.`
        )
    }
    return issues
}
