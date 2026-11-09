import facts from '~~/data/nuxion.generated.json'

/**
 * The facts read out of Nuxion (`npm run sync:nuxion`), shaped for the wizard.
 * Licences are the one thing fonts.js doesn't record, so they live here: a
 * family with no entry has to have its licence typed in.
 */

const LICENCES: Record<string, string> = {
    'Playfair Display': 'OFL 1.1',
    Questrial: 'OFL 1.1',
    Lora: 'OFL 1.1',
    Roboto: 'OFL or Apache 2.0',
    Inter: 'OFL 1.1',
    Geist: 'OFL 1.1',
    'Geist Mono': 'OFL 1.1',
    'JetBrains Mono': 'OFL 1.1',
}

export interface CatalogFont {
    name: string
    fallback: string
    licence: string
}

export const FONT_CATALOG: CatalogFont[] = facts.fonts.map((font) => ({
    ...font,
    licence: LICENCES[font.name] ?? '',
}))

export const catalogFont = (family: string) =>
    FONT_CATALOG.find((font) => font.name === family)

export const SHIPPED_BLOCKS: string[] = facts.shippedBlocks

const FIELD_ROLES: [string, string[]][] = [
    ['Heading', facts.markdownFields.title],
    ['Figure', facts.markdownFields.figure],
    ['Plain', facts.markdownFields.text],
    ['Rich', facts.markdownFields.prose],
    ['List', facts.markdownFields.list],
    ['Items', facts.markdownFields.nested],
]

/** How a block field reaches the Markdown pages, or undefined if it doesn't. */
export const markdownRole = (field: string) =>
    FIELD_ROLES.find(([, names]) => names.includes(field))?.[0]
