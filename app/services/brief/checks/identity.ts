import type { Brief } from '../model'
import type { Issue } from '.'

export const checkIdentity = (brief: Brief): Issue[] => {
    const issues: Issue[] = []
    if (!brief.identity) {
        issues.push({
            step: 'identity',
            severity: 'warn',
            field: 'identity',
            message:
                'Describe the metaphor, where colour comes from and how depth is made.',
        })
    }
    brief.rules.forEach((rule, index) => {
        if (rule.keep === 'readme') {
            issues.push({
                step: 'identity',
                severity: 'warn',
                field: `rules.${index}.keep`,
                message: `“${rule.rule}” is only written down. The first editor will break it. Find a token or block that keeps it.`,
            })
        }
    })
    return issues
}
