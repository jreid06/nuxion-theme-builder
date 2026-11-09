import { BODY_CONTRAST, contrastRatio, UI_CONTRAST } from './colour'
import type { Brief } from './model'
import { schemesOf, slotSwatch, swatchHex } from './resolve'

/** The grid on the Swatches step: every ground against every text colour. */

export interface ContrastCell {
    ratio: number | null
    /** A pair some Color Theme actually uses. */
    used: boolean
    required: number
    fails: boolean
}

export interface ContrastGrid {
    backgrounds: string[]
    foregrounds: string[]
    cell: (background: string, foreground: string) => ContrastCell
}

export const contrastGrid = (brief: Brief): ContrastGrid => {
    const backgrounds = new Set<string>()
    const foregrounds = new Set<string>()
    const required = new Map<string, number>()
    const pairKey = (background: string, foreground: string) =>
        `${background}|${foreground}`

    for (const theme of brief.themes) {
        for (const scheme of schemesOf(brief)) {
            const background = slotSwatch(theme, scheme, 'bg')
            if (background) backgrounds.add(background)
            for (const role of ['text', 'accent'] as const) {
                const foreground = slotSwatch(theme, scheme, role)
                if (foreground) foregrounds.add(foreground)
                if (!background || !foreground) continue
                const key = pairKey(background, foreground)
                const needed = role === 'text' ? BODY_CONTRAST : UI_CONTRAST
                required.set(key, Math.max(required.get(key) ?? 0, needed))
            }
        }
    }

    return {
        backgrounds: [...backgrounds],
        foregrounds: [...foregrounds],
        cell(background, foreground) {
            const ratio = contrastRatio(
                swatchHex(brief, foreground),
                swatchHex(brief, background)
            )
            const needed = required.get(pairKey(background, foreground))
            return {
                ratio,
                used: needed !== undefined,
                required: needed ?? BODY_CONTRAST,
                fails: needed !== undefined && ratio !== null && ratio < needed,
            }
        },
    }
}
