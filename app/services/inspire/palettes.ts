import {
    contrastRatio,
    isHex,
    BODY_CONTRAST,
    UI_CONTRAST,
} from '../brief/colour'
import {
    blankBrief,
    colorTheme,
    type Brief,
    type ColorTheme,
    type Swatch,
} from '../brief/model'
import { schemesOf, themeColors } from '../brief/resolve'
import type { Tagged } from './direction'

/**
 * Whole palettes: ten role-named colours that become the swatches and the
 * three Color Themes. Presets and Claude's palettes share this shape, so both
 * are checked and applied the same way.
 */

export const PALETTE_ROLES = [
    'paper',
    'raised',
    'ink',
    'ground',
    'panel',
    'chalk',
    'accent',
    'accentDark',
    'art1',
    'art2',
] as const

export type PaletteRole = (typeof PALETTE_ROLES)[number]
export type PaletteColours = Record<PaletteRole, string>

export interface Palette extends Tagged {
    name: string
    note: string
    colours: PaletteColours
}

const SWATCH_ROLES: Record<
    PaletteRole,
    { name: string; slug: string; role: string; readBy: string }
> = {
    paper: {
        name: 'Paper',
        slug: 'paper',
        role: 'light canvas',
        readBy: 'canvas bg',
    },
    raised: {
        name: 'Raised',
        slug: 'raised',
        role: 'light panel',
        readBy: 'raised bg',
    },
    ink: {
        name: 'Ink',
        slug: 'ink-light',
        role: 'light text',
        readBy: 'canvas, raised text',
    },
    ground: {
        name: 'Ground',
        slug: 'ground',
        role: 'dark canvas',
        readBy: 'canvas dark bg, night bg',
    },
    panel: {
        name: 'Panel',
        slug: 'panel',
        role: 'dark panel',
        readBy: 'raised dark bg',
    },
    chalk: {
        name: 'Chalk',
        slug: 'ink',
        role: 'dark text',
        readBy: 'canvas, raised dark text',
    },
    accent: {
        name: 'Accent',
        slug: 'accent',
        role: 'accent (light)',
        readBy: 'canvas accent',
    },
    accentDark: {
        name: 'Accent (dark)',
        slug: 'accent-dark',
        role: 'accent (dark)',
        readBy: 'canvas dark accent',
    },
    art1: { name: 'Art 1', slug: 'art-1', role: 'art', readBy: '--<px>-art-1' },
    art2: { name: 'Art 2', slug: 'art-2', role: 'art', readBy: '--<px>-art-2' },
}

export const paletteSwatches = (colours: PaletteColours): Swatch[] =>
    PALETTE_ROLES.map((role) => ({
        id: role,
        ...SWATCH_ROLES[role],
        hex: colours[role].toUpperCase(),
    }))

export const paletteThemes = (): ColorTheme[] => [
    colorTheme(
        'canvas',
        'site default',
        'Site Settings default',
        { bg: 'paper', text: 'ink', accent: 'accent' },
        { bg: 'ground', text: 'chalk', accent: 'accentDark' }
    ),
    colorTheme(
        'raised',
        'panel',
        'cards, inverted bands',
        { bg: 'raised', text: 'ink', accent: 'accent' },
        { bg: 'panel', text: 'chalk', accent: 'accentDark' }
    ),
    colorTheme('night', 'always dark', 'nav and footer', {
        bg: 'ground',
        text: 'chalk',
        accent: 'accentDark',
    }),
]

/**
 * Replaces the brief's swatches and Color Themes, then points any button
 * colour that named a swatch which no longer exists at the new palette.
 */
export const applyPalette = (brief: Brief, colours: PaletteColours) => {
    brief.swatches = paletteSwatches(colours)
    brief.themes = paletteThemes()
    const exists = (id: string) =>
        brief.swatches.some((swatch) => swatch.id === id)
    for (const preset of brief.buttons) {
        for (const scheme of ['light', 'dark'] as const) {
            const slot = preset[scheme]
            const dark = scheme === 'dark'
            if (preset.style === 'button' && preset.source !== 'inherit') {
                if (!exists(slot.fill))
                    slot.fill = dark ? 'accentDark' : 'accent'
                if (preset.source === 'manual' && !exists(slot.text)) {
                    slot.text = dark ? 'ground' : 'paper'
                }
            } else {
                if (slot.fill && !exists(slot.fill)) slot.fill = ''
                if (slot.text && !exists(slot.text)) slot.text = ''
            }
        }
    }
}

export interface PaletteContrast {
    total: number
    passing: number
    /** Plain-language descriptions, also sent back to Claude on a retry. */
    failures: string[]
}

/** Every text and accent pair the palette's Color Themes use, in both schemes. */
export const paletteContrast = (
    colours: PaletteColours,
    dark: Brief['dark'] = 'full'
): PaletteContrast => {
    const brief = { ...blankBrief(), swatches: paletteSwatches(colours), dark }
    const result: PaletteContrast = { total: 0, passing: 0, failures: [] }
    for (const theme of paletteThemes()) {
        for (const scheme of schemesOf(brief)) {
            const colors = themeColors(brief, theme, scheme)
            for (const [role, needed] of [
                ['text', BODY_CONTRAST],
                ['accent', UI_CONTRAST],
            ] as const) {
                const ratio = contrastRatio(colors[role], colors.bg)
                result.total += 1
                if (ratio !== null && ratio >= needed) {
                    result.passing += 1
                } else {
                    result.failures.push(
                        `${theme.key} (${scheme}): ${role} ${colors[role] || 'missing'} on ${colors.bg || 'missing'} is ${ratio?.toFixed(2) ?? 'unreadable'}:1, needs ${needed}:1`
                    )
                }
            }
        }
    }
    return result
}

export const isCompletePalette = (colours: Partial<PaletteColours>) =>
    PALETTE_ROLES.every((role) => isHex(colours[role]))

const palette = (
    name: string,
    note: string,
    tags: Palette['tags'],
    hexes: [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
    ]
): Palette => ({
    name,
    note,
    tags,
    colours: Object.fromEntries(
        PALETTE_ROLES.map((role, index) => [role, hexes[index]])
    ) as PaletteColours,
})

export const PALETTE_PRESETS: Palette[] = [
    palette(
        'Kiln',
        'Fired clay and ash glaze',
        ['warm', 'creative', 'hospitality'],
        [
            '#F7F1EA',
            '#EBDFD1',
            '#2A1E18',
            '#1C1410',
            '#2B201A',
            '#F4EADF',
            '#A63D1E',
            '#F0885C',
            '#C98A2B',
            '#5B7A6B',
        ]
    ),
    palette(
        'Fjord',
        'Cold water and pale rock',
        ['calm', 'natural', 'technical', 'software'],
        [
            '#EEF4F6',
            '#DCE8EC',
            '#10242E',
            '#0B1A22',
            '#14303D',
            '#E6F1F5',
            '#0F6C8C',
            '#5CC2E0',
            '#2E8F7A',
            '#C9A227',
        ]
    ),
    palette(
        'Orchard',
        'Young leaves and ripe fruit',
        ['natural', 'playful', 'nonprofit', 'retail'],
        [
            '#F6F7EC',
            '#E6EAD3',
            '#232B16',
            '#171D0E',
            '#262F18',
            '#F0F3DF',
            '#55700F',
            '#B5D548',
            '#B4472F',
            '#D9A521',
        ]
    ),
    palette(
        'Terrazzo',
        'Polished stone and bright chips',
        ['bold', 'playful', 'creative', 'luxurious'],
        [
            '#FAF7F2',
            '#EFE8DD',
            '#26222B',
            '#1B1820',
            '#2A2632',
            '#F3EEE6',
            '#7A2E8C',
            '#D79BE6',
            '#E0663F',
            '#2F8F8F',
        ]
    ),
    palette(
        'Signal',
        'Almost mono, one sharp blue',
        ['technical', 'software', 'editorial', 'services'],
        [
            '#FFFFFF',
            '#F0F1F3',
            '#111318',
            '#0B0C10',
            '#1A1C22',
            '#F2F3F5',
            '#1F4FE0',
            '#8AA8FF',
            '#9BA3AF',
            '#4B5563',
        ]
    ),
    palette(
        'Dusk',
        'Late light over a city',
        ['bold', 'luxurious', 'hospitality', 'editorial'],
        [
            '#F5F0F6',
            '#E7DFEA',
            '#251C2E',
            '#1A1424',
            '#2A2138',
            '#F1EAF5',
            '#B0266C',
            '#F280B6',
            '#E8A33D',
            '#4C6FBF',
        ]
    ),
]
