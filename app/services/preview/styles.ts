import { readableInk } from '../brief/colour'
import type {
    Brief,
    ButtonPreset,
    ColorSlots,
    RenderScheme,
    TypeRow,
} from '../brief/model'
import { fontStack } from '../brief/names'
import { swatchHex } from '../brief/resolve'

/** Inline styles that show a brief's choices. Used only inside previews. */

export type InlineStyle = Record<string, string | number | undefined>

const buttonRadius = (brief: Brief, preset: ButtonPreset) => {
    if (preset.shape === 'rounded') return '999px'
    return (
        brief.metrics.radius || (preset.shape === 'rounded-soft' ? '6px' : '0')
    )
}

export const buttonStyle = (
    brief: Brief,
    preset: ButtonPreset,
    theme: ColorSlots,
    scheme: RenderScheme
): InlineStyle => {
    const fill =
        scheme === 'dark'
            ? preset.dark.fill || preset.light.fill
            : preset.light.fill
    const text =
        scheme === 'dark'
            ? preset.dark.text || preset.light.text
            : preset.light.text
    const base: InlineStyle = {
        borderRadius: buttonRadius(brief, preset),
        borderWidth: brief.metrics.border || '1px',
    }

    if (preset.style === 'default') {
        return {
            ...base,
            padding: 0,
            border: 0,
            background: 'transparent',
            color: swatchHex(brief, text) || theme.text,
            textDecoration: 'underline',
        }
    }
    if (preset.style === 'outline') {
        return {
            ...base,
            background: 'transparent',
            color: theme.text,
            borderColor:
                preset.source === 'inherit'
                    ? theme.text
                    : swatchHex(brief, fill),
        }
    }

    const background =
        preset.source === 'inherit' ? theme.accent : swatchHex(brief, fill)
    const manualInk =
        preset.source === 'manual' ? swatchHex(brief, text) : undefined
    return {
        ...base,
        background: background || '#888888',
        color: manualInk || readableInk(background),
        borderColor: background || '#888888',
    }
}

export const typeStyle = (
    brief: Brief,
    row: TypeRow,
    mobile: boolean
): InlineStyle => {
    const font = /paragraph/.test(row.cls)
        ? brief.fonts.body
        : /eyebrow|label/.test(row.cls)
          ? brief.fonts.code
          : brief.fonts.heading
    return {
        fontFamily: fontStack(font) || 'inherit',
        fontSize:
            (mobile ? row.mobile : row.desktop) || row.desktop || row.mobile,
        lineHeight: row.lh || undefined,
        letterSpacing: row.tracking || undefined,
        fontWeight: row.weight || undefined,
        textTransform: /eyebrow/.test(row.cls) ? 'uppercase' : undefined,
    }
}
