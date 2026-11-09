import { isHex } from '../colour'
import type { Brief } from '../model'
import type { Issue } from '.'

const COLOUR_WORD =
    /(^|-)(red|blue|green|yellow|orange|purple|violet|pink|teal|cyan|magenta|navy|black|white|grey|gray|brown|beige|indigo|lime|amber|crimson)($|-)/

export const checkSwatches = (brief: Brief): Issue[] => {
    const issues: Issue[] = []
    const add = (severity: Issue['severity'], field: string, message: string) =>
        issues.push({ step: 'swatches', severity, field, message })

    if (!brief.swatches.length) {
        add(
            'warn',
            'swatches',
            'Add the palette. Each named colour is one swatch.'
        )
    }

    const seen = new Set<string>()
    brief.swatches.forEach((swatch, index) => {
        const label = swatch.name || 'A swatch'
        const full = `${brief.px}-${swatch.slug}`
        if (!isHex(swatch.hex)) {
            add(
                'error',
                `swatches.${index}.hex`,
                `${label} needs a six-digit hex.`
            )
        }
        if (!swatch.slug) {
            add('error', `swatches.${index}.slug`, `${label} needs a slug.`)
            return
        }
        if (COLOUR_WORD.test(swatch.slug)) {
            add(
                'warn',
                `swatches.${index}.slug`,
                `${full} names a colour. A recolour would make it wrong, so name its role.`
            )
        }
        if (seen.has(swatch.slug)) {
            add(
                'error',
                `swatches.${index}.slug`,
                `${full} is used twice. Slugs must be unique.`
            )
        }
        seen.add(swatch.slug)
    })
    return issues
}
