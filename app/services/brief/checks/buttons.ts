import type { Brief } from '../model'
import type { Issue } from '.'

export const checkButtons = (brief: Brief): Issue[] => {
    const issues: Issue[] = []
    const add = (severity: Issue['severity'], field: string, message: string) =>
        issues.push({ step: 'buttons', severity, field, message })

    if (!brief.buttons.some((preset) => preset.style === 'button')) {
        add(
            'warn',
            'buttons',
            'Add at least one filled button for the main call to action.'
        )
    }

    brief.buttons.forEach((preset, index) => {
        if (preset.source === 'seed' && !preset.light.fill) {
            add(
                'error',
                `buttons.${index}`,
                `${preset.name} derives from one colour, so pick its seed swatch.`
            )
        }
        if (
            preset.source === 'manual' &&
            preset.style === 'button' &&
            !preset.light.text
        ) {
            add(
                'warn',
                `buttons.${index}`,
                `${preset.name} has no label colour. Pick one so its Link Style is complete.`
            )
        }
    })
    return issues
}
