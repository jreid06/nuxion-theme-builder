import { BODY_CONTRAST, contrastRatio, UI_CONTRAST } from '../colour'
import type { Brief } from '../model'
import { schemesOf, themeColors } from '../resolve'
import type { Issue } from '.'

/** Stays one colour in both schemes, so its dark slots are meant to be empty. */
const ALWAYS_DARK_THEME = 'night'

export const checkThemes = (brief: Brief): Issue[] => {
    const issues: Issue[] = []

    brief.themes.forEach((theme, index) => {
        const field = `themes.${index}`
        const add = (severity: Issue['severity'], message: string) =>
            issues.push({ step: 'themes', severity, field, message })

        const missing = (['bg', 'text'] as const).filter(
            (role) => !theme.light[role]
        )
        if (missing.length) {
            add(
                'error',
                `${theme.key} is missing its ${missing.join(' and ')}.`
            )
        }

        const hasEmptyDark = (['bg', 'text'] as const).some(
            (role) => theme.light[role] && !theme.dark[role]
        )
        if (
            brief.dark === 'full' &&
            theme.key !== ALWAYS_DARK_THEME &&
            hasEmptyDark
        ) {
            add(
                'warn',
                `${theme.key} has empty dark slots, so it will look the same in dark.`
            )
        }

        for (const scheme of schemesOf(brief)) {
            const colors = themeColors(brief, theme, scheme)
            const text = contrastRatio(colors.text, colors.bg)
            if (text !== null && text < BODY_CONTRAST) {
                add(
                    'error',
                    `${theme.key} (${scheme}): text on background is ${text.toFixed(2)}:1. Body text needs ${BODY_CONTRAST}:1.`
                )
            }
            const accent = contrastRatio(colors.accent, colors.bg)
            if (accent !== null && accent < UI_CONTRAST) {
                add(
                    'error',
                    `${theme.key} (${scheme}): accent on background is ${accent.toFixed(2)}:1. UI and large text need ${UI_CONTRAST}:1.`
                )
            }
        }
    })
    return issues
}
