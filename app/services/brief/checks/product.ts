import { ORIGINALITY_CHECKS } from '../content'
import type { Brief } from '../model'
import type { Issue } from '.'

const openOriginalityChecks = (brief: Brief) =>
    ORIGINALITY_CHECKS.filter(
        (check, index) => !('demoOnly' in check) && !brief.originality[index]
    ).length

export const checkProduct = (brief: Brief): Issue[] => {
    const issues: Issue[] = []
    const add = (severity: Issue['severity'], field: string, message: string) =>
        issues.push({ step: 'product', severity, field, message })

    if (!brief.positioning) {
        add('warn', 'positioning', 'Say who builds what with this theme.')
    }

    const count = brief.features.length
    if (!count) {
        add(
            'warn',
            'features',
            'Add the three to five things that make the theme recognisable.'
        )
    } else if (count < 3 || count > 5) {
        add(
            'warn',
            'features',
            `The brief asks for three to five signature features. This has ${count}.`
        )
    }

    brief.features.forEach((feature, index) => {
        if (feature.text && (!feature.kind || !feature.ref)) {
            add(
                'error',
                `features.${index}.ref`,
                `“${feature.text}” has no delivery. If it isn’t a block, art primitive or site-wide treatment, it isn’t built yet.`
            )
        }
    })

    const open = openOriginalityChecks(brief)
    if (open) {
        add(
            'warn',
            'originality',
            `${open} originality check${open > 1 ? 's are' : ' is'} still open.`
        )
    }
    return issues
}
