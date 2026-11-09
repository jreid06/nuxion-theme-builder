import type { Brief } from '../brief/model'
import { blockType, themeName, themeTitle } from '../brief/names'
import { catalogFont } from '../brief/nuxion'
import {
    anyStudioOption,
    studioImportCommand,
    studioContentPath,
} from './studioContent'

/** Each exact terminal line the brief needs, built from one set of helpers. */

export const createDatasetCommand = (dataset: string) =>
    `(cd studio && npx sanity dataset create ${dataset})`

export const scaffoldThemeCommand = (brief: Brief) =>
    `npm run scaffold:theme -- ${themeName(brief)} --title "${themeTitle(brief)}"`

export const scaffoldBlockCommand = (type: string, name: string) =>
    `npm run scaffold:component -- ${type} --theme ${name}`

export const CSS_COMPILE = 'npm run cssvars:generate'

/** Blocks needing a scaffold line. `scaffold:theme` already creates the hero. */
export const plannedExtraBlocks = (brief: Brief) =>
    brief.blocksOn
        ? brief.blocks.filter((block) => block.slug && block.slug !== 'hero')
        : []

export const chromeCommands = (brief: Brief) => {
    if (!brief.blocksOn) return []
    const name = themeName(brief)
    return [
        brief.chrome.nav === 'theme' &&
            `npm run scaffold:component -- ${name}.nav --theme ${name} --kind navigation`,
        brief.chrome.footer === 'theme' &&
            `npm run scaffold:component -- ${name}.footer --theme ${name} --kind footer`,
    ].filter((command): command is string => Boolean(command))
}

export const missingFonts = (brief: Brief) =>
    Object.values(brief.fonts)
        .map((font) => font.family)
        .filter((family) => family && !catalogFont(family))

export const renderCommands = (brief: Brief) => {
    const name = themeName(brief)
    const lines = [
        '# Run from your Nuxion repo root.',
        '',
        '# A dataset of its own, so this theme’s content stays separate',
        createDatasetCommand(name),
        `# Then set SANITY_STUDIO_DATASET=${name} in .env and studio/.env`,
        '',
    ]

    const fonts = missingFonts(brief)
    if (fonts.length) {
        lines.push(
            `# Add ${fonts.join(', ')} to fonts.js first, then:`,
            'npm run fonts:generate',
            ''
        )
    }

    lines.push(
        '# Skeleton: folders, enabling lines and a first hero block',
        scaffoldThemeCommand(brief),
        ''
    )

    const extra = plannedExtraBlocks(brief)
    if (extra.length) {
        lines.push('# One line per theme block')
        for (const block of extra) {
            lines.push(scaffoldBlockCommand(blockType(brief, block), name))
            if (block.fields) lines.push(`#   then add fields: ${block.fields}`)
        }
        lines.push('')
    }

    const chrome = chromeCommands(brief)
    if (chrome.length) lines.push(...chrome, '')

    if (anyStudioOption(brief)) {
        lines.push(
            `# Import your Studio content, saved as ${studioContentPath(brief)}`,
            studioImportCommand(brief),
            ''
        )
    }

    lines.push(
        '# Compile the colours into CSS. Run again after any colour change',
        CSS_COMPILE,
        '',
        '# Before release',
        'npm run check'
    )
    return `${lines.join('\n')}\n`
}
