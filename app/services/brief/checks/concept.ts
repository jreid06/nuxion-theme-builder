import type { Brief } from '../model'
import type { Issue } from '.'

export const checkConcept = (brief: Brief): Issue[] => {
    const issues: Issue[] = []
    const add = (severity: Issue['severity'], field: string, message: string) =>
        issues.push({ step: 'concept', severity, field, message })

    if (!brief.title) add('error', 'title', 'Give the theme a name.')
    if (brief.name && !/^[a-z][a-z0-9-]*$/.test(brief.name)) {
        add(
            'error',
            'name',
            'The codename must be lowercase letters, digits and hyphens.'
        )
    }
    if (brief.title && !/^[a-z]{2,3}$/.test(brief.px)) {
        add(
            'error',
            'px',
            'The CSS prefix needs two or three lowercase letters.'
        )
    }
    if (!brief.mood) {
        add(
            'warn',
            'mood',
            'Write one line of mood. Every later decision gets judged against it.'
        )
    }
    return issues
}
