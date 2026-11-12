import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Regenerates data/nuxion.generated.json from a Nuxion checkout, so the facts
 * the wizard relies on are read from Nuxion rather than copied by hand:
 *
 *   npm run sync:nuxion -- ../nuxion-base
 *
 * Each extractor is pure: it takes a file's text and returns what it found, and
 * throws when the file no longer looks the way it expects.
 */

export interface NuxionFacts {
    fonts: { name: string; fallback: string }[]
    markdownFields: Record<MarkdownRole, string[]>
    shippedBlocks: string[]
    briefHeadings: string[]
    scaffoldFields: ScaffoldFields
}

/** What `scaffold:component --fields` accepts, read from its own source. */
export interface ScaffoldFields {
    types: string[]
    /** Not allowed as a block's own field name. */
    reserved: string[]
    /** Only allowed as a block's own field when it is a link.group. */
    linkGroupNames: string[]
    /** Every theme block already has these. */
    intro: string[]
}

type MarkdownRole = 'title' | 'figure' | 'prose' | 'text' | 'list' | 'nested'

const MARKDOWN_CONSTANTS: Record<MarkdownRole, string> = {
    title: 'TITLE_FIELDS',
    figure: 'FIGURE_FIELDS',
    prose: 'PROSE_FIELDS',
    text: 'TEXT_FIELDS',
    list: 'LIST_FIELDS',
    nested: 'NESTED_FIELDS',
}

const quoted = (text: string) =>
    [...text.matchAll(/'([^']+)'/g)].map((match) => match[1] as string)

export const extractFonts = (source: string): NuxionFacts['fonts'] => {
    const block = /fontOptions = \{([\s\S]*?)\n\}/.exec(source)?.[1]
    if (!block) throw new Error('fonts.js: fontOptions not found')
    const fonts = [
        ...block.matchAll(/name: '([^']+)',\s+fallback: '([^']+)'/g),
    ].map((match) => ({
        name: match[1] as string,
        fallback: match[2] as string,
    }))
    if (!fonts.length) throw new Error('fonts.js: no fonts found')
    return fonts
}

export const extractMarkdownFields = (
    source: string
): NuxionFacts['markdownFields'] => {
    const read = (constant: string) => {
        const body = new RegExp(`const ${constant} = \\[([\\s\\S]*?)\\]`).exec(
            source
        )?.[1]
        if (!body) throw new Error(`pageToMarkdown.ts: ${constant} not found`)
        return quoted(body)
    }
    return Object.fromEntries(
        Object.entries(MARKDOWN_CONSTANTS).map(([role, constant]) => [
            role,
            read(constant),
        ])
    ) as NuxionFacts['markdownFields']
}

export const extractShippedBlocks = (source: string): string[] => {
    const blocks = [
        ...source.matchAll(/^\s+'?([a-z][a-zA-Z.-]*)'?: lazy\(/gm),
    ].map((match) => match[1] as string)
    if (!blocks.length) throw new Error('ui/index.ts: no blocks found')
    return blocks
}

export const extractBriefHeadings = (source: string): string[] => {
    const headings = [...source.matchAll(/^#{2,3} .+$/gm)].map(
        (match) => match[0]
    )
    if (!headings.length) throw new Error('THEME_BRIEF.md: no headings found')
    return headings
}

const quotedList = (source: string, constant: string, file: string) => {
    const body = new RegExp(`const ${constant} = \\[([\\s\\S]*?)\\]`).exec(
        source
    )?.[1]
    if (!body) throw new Error(`${file}: ${constant} not found`)
    return quoted(body)
}

export const extractScaffoldFields = (
    fieldsSource: string,
    themeSource: string,
    fragmentsSource: string
): ScaffoldFields => {
    const table = /export const FIELD_TYPES = \{([\s\S]*?)\n\}/.exec(
        fieldsSource
    )?.[1]
    if (!table) throw new Error('scaffold/fields.js: FIELD_TYPES not found')
    const types = [...table.matchAll(/^ {4}'?([a-z.-]+)'?: \{$/gm)].map(
        (match) => match[1] as string
    )
    if (!types.length) throw new Error('scaffold/fields.js: no field types')
    return {
        types,
        reserved: quotedList(
            fieldsSource,
            'RESERVED_NAMES',
            'scaffold/fields.js'
        ),
        linkGroupNames: quotedList(
            fragmentsSource,
            'LINK_GROUPS_BY_FIELD',
            'groq-fragments.ts'
        ),
        intro: quotedList(themeSource, 'INTRO_FIELDS', 'scaffold/theme.js'),
    }
}

export const collectFacts = (checkout: string): NuxionFacts => {
    const read = (file: string) =>
        fs.readFileSync(path.join(checkout, file), 'utf8')
    return {
        fonts: extractFonts(read('fonts.js')),
        markdownFields: extractMarkdownFields(
            read('app/services/content/pageToMarkdown.ts')
        ),
        shippedBlocks: extractShippedBlocks(read('app/components/ui/index.ts')),
        briefHeadings: extractBriefHeadings(read('themes/THEME_BRIEF.md')),
        scaffoldFields: extractScaffoldFields(
            read('scripts/scaffold/fields.js'),
            read('scripts/scaffold/theme.js'),
            read('shared/groq-fragments.ts')
        ),
    }
}

const main = () => {
    const checkout = process.argv[2]
    if (!checkout) {
        console.error(
            'Usage: npm run sync:nuxion -- <path to a Nuxion checkout>'
        )
        process.exit(1)
    }
    const target = new URL('../data/nuxion.generated.json', import.meta.url)
    fs.writeFileSync(
        target,
        `${JSON.stringify(collectFacts(checkout), null, 4)}\n`
    )
    console.log(`Wrote ${target.pathname}`)
}

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    main()
}
