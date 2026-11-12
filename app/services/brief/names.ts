import type { Brief, FontChoice, ThemeBlock, TypeRow } from './model'

/** Every name derived from another one: slugs, prefixes, file names. */

export const slugify = (value: unknown) =>
    String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

/** The theme's first letter and its next consonant: `driftwire` → `dr`. */
export const prefixFor = (title: string) => {
    const letters = slugify(title).replace(/-/g, '')
    if (!letters) return ''
    const consonant = /[bcdfghjklmnpqrstvwxyz]/.exec(letters.slice(1))?.[0]
    return `${letters[0]}${consonant ?? letters[1] ?? ''}`
}

export const pascalCase = (value: string) =>
    value
        .split(/[.-]/)
        .filter(Boolean)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join('')

export const themeName = (brief: Brief) => brief.name || '<name>'
export const themeTitle = (brief: Brief) => brief.title || '<Theme>'

export const blockType = (brief: Brief, block: ThemeBlock) =>
    `${brief.name || 'theme'}.${block.slug}`

export const fontStack = (font: FontChoice) =>
    font.family ? `'${font.family}', ${font.fallback || 'sans-serif'}` : ''

export const typeClass = (brief: Brief, row: TypeRow) =>
    row.cls.replace('{px}', brief.px || 'xx')
