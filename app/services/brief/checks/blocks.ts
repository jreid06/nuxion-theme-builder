import type { Brief } from '../model'
import { blockType, parseFields } from '../names'
import { markdownRole } from '../nuxion'
import type { Issue } from '.'

const reachesMarkdownAsContent = (field: string) => {
    const role = markdownRole(field)
    return role !== undefined && role !== 'Heading'
}

export const checkBlocks = (brief: Brief): Issue[] => {
    if (!brief.blocksOn) return []

    const issues: Issue[] = []
    const add = (severity: Issue['severity'], field: string, message: string) =>
        issues.push({ step: 'blocks', severity, field, message })

    brief.blocks.forEach((block, index) => {
        if (!block.slug)
            add('error', `blocks.${index}.slug`, 'Name this block.')
        const fields = parseFields(block.fields)
        if (fields.length && !fields.some(reachesMarkdownAsContent)) {
            add(
                'warn',
                `blocks.${index}.fields`,
                `${blockType(brief, block)}: only the intro reaches Markdown. Leave its description empty and the Markdown test fails.`
            )
        }
    })

    if (brief.chrome.nav === 'theme' && !brief.chrome.safari) {
        add(
            'warn',
            'chrome.safari',
            'A custom navigation bar needs the touch-device tint rule for iOS Safari.'
        )
    }
    return issues
}
