import type {
    Brief,
    ColorRole,
    ColorSlots,
    ColorTheme,
    RenderScheme,
} from './model'

/** Turns swatch ids in a brief into colours. */

/** The schemes a theme has slots for. A one-scheme theme uses its light set. */
export const schemesOf = (brief: Brief): RenderScheme[] =>
    brief.dark === 'full' ? ['light', 'dark'] : ['light']

export const swatchById = (brief: Brief, id: string) =>
    brief.swatches.find((swatch) => swatch.id === id)

export const swatchHex = (brief: Brief, id: string) =>
    swatchById(brief, id)?.hex ?? ''

export const swatchName = (brief: Brief, id: string) =>
    swatchById(brief, id)?.name ?? ''

/** The swatch id in a slot: a dark slot left empty reuses its light colour. */
export const slotSwatch = (
    theme: ColorTheme,
    scheme: RenderScheme,
    role: ColorRole
) => (scheme === 'dark' && theme.dark[role]) || theme.light[role]

export const themeColors = (
    brief: Brief,
    theme: ColorTheme,
    scheme: RenderScheme
): ColorSlots => ({
    bg: swatchHex(brief, slotSwatch(theme, scheme, 'bg')),
    text: swatchHex(brief, slotSwatch(theme, scheme, 'text')),
    accent: swatchHex(brief, slotSwatch(theme, scheme, 'accent')),
})
