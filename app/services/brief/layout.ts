import { isHex } from './colour'
import type { Brief, CornerKey, SpacingPreset } from './model'

/** Nuxion's site-wide tokens, and which of them this brief overrides. */

/** Phone, tablet and desktop values of `--spacing-section`. */
export const SPACING: Record<SpacingPreset, [string, string, string]> = {
    compact: ['2rem', '2.5rem', '3.5rem'],
    default: ['3rem', '4rem', '5rem'],
    spacious: ['4rem', '6rem', '8rem'],
}

export const CORNER_PRESETS: Record<string, Record<CornerKey, string>> = {
    default: { card: '', panel: '', media: '', input: '' },
    sharp: { card: '0', panel: '0', media: '0', input: '0' },
    soft: {
        card: '0.5rem',
        panel: '0.75rem',
        media: '0.375rem',
        input: '0.375rem',
    },
    round: {
        card: '1.25rem',
        panel: '2rem',
        media: '1rem',
        input: '0.75rem',
    },
}

export const CORNERS: {
    key: CornerKey
    title: string
    /** Form fields have no token; the export writes a scoped rule for them. */
    token?: string
    shipped: string
    used: string
}[] = [
    {
        key: 'card',
        title: 'Card',
        token: '--radius-card',
        shipped: '1rem',
        used: 'Feature grids, testimonials, stats, pricing and blog cards',
    },
    {
        key: 'panel',
        title: 'Panel',
        token: '--radius-panel',
        shipped: '1.5rem',
        used: 'The large CTA banner',
    },
    {
        key: 'media',
        title: 'Media',
        token: '--radius-media',
        shipped: '0.5rem',
        used: 'Hero images and one gallery style',
    },
    {
        key: 'input',
        title: 'Form field',
        shipped: '6px',
        used: 'Text boxes, text areas and dropdowns',
    },
]

export const MEASURES = [
    { key: 'lead', shipped: '36rem', use: 'A section’s intro paragraph' },
    { key: 'intro', shipped: '42rem', use: 'A block’s own intro' },
    {
        key: 'narrow',
        shipped: '48rem',
        use: 'Reading width: FAQ, a post’s body',
    },
    {
        key: 'medium',
        shipped: '56rem',
        use: 'A framed card, such as the CTA banner',
    },
    { key: 'wide', shipped: '64rem', use: 'The hero' },
    { key: 'ultra', shipped: '80rem', use: 'The widest text container' },
] as const

export const measureToken = (key: string) => `--container-measure-${key}`

/** The token overrides this brief writes, in stylesheet order. */
export const layoutTokens = (brief: Brief): [string, string][] => {
    const { width, radius, depth, measure } = brief.layout
    const tokens: [string, string][] = []
    if (width) tokens.push(['--container-8xl', width])
    for (const { key } of MEASURES) {
        const value = measure[key]
        if (value) tokens.push([measureToken(key), value])
    }
    for (const corner of CORNERS) {
        if (corner.token && radius[corner.key]) {
            tokens.push([corner.token, radius[corner.key]])
        }
    }
    if (depth === 'flat') tokens.push(['--shadow-media', 'none'])
    return tokens
}

export const activeCornerPreset = (brief: Brief) =>
    Object.keys(CORNER_PRESETS).find((name) =>
        CORNERS.every(
            ({ key }) =>
                brief.layout.radius[key] === CORNER_PRESETS[name]?.[key]
        )
    ) ?? ''

export interface ThemeVariable {
    name: string
    value: string
    used: string
}

/** The theme-local variables every theme gets, plus one per art swatch. */
export const themeVariables = (brief: Brief): ThemeVariable[] => {
    const px = brief.px || 'xx'
    return [
        {
            name: `--${px}-ground`,
            value: 'var(--studio-nuxt-body-color)',
            used: 'the section’s background',
        },
        {
            name: `--${px}-ink`,
            value: 'var(--studio-nuxt-text-color)',
            used: 'the section’s text',
        },
        {
            name: `--${px}-line`,
            value: 'color-mix(in oklab, currentColor 11%, transparent)',
            used: 'hairlines',
        },
        {
            name: `--${px}-line-strong`,
            value: 'color-mix(in oklab, currentColor 20%, transparent)',
            used: 'ruled edges',
        },
        {
            name: `--${px}-muted`,
            value: 'color-mix(in oklab, currentColor 76%, transparent)',
            used: 'secondary text',
        },
        ...brief.swatches
            .filter(({ slug, hex }) => /^art(-|$)/.test(slug) && isHex(hex))
            .map(({ slug, hex }) => ({
                name: `--${px}-${slug}`,
                value: `var(--studio-nuxt-${px}-${slug}, ${hex.toLowerCase()})`,
                used: 'art',
            })),
    ]
}
