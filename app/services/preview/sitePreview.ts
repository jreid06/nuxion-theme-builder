import { isHex } from '../brief/colour'
import { layoutTokens, SPACING } from '../brief/layout'
import type {
    Brief,
    ButtonPreset,
    ColorSlots,
    ColorTheme,
    RenderScheme,
} from '../brief/model'
import { fontStack } from '../brief/names'
import { themeColors } from '../brief/resolve'
import { buttonStyle, typeStyle, type InlineStyle } from './styles'

/** Everything the live preview draws, worked out from the brief. */

export const PHONE_WIDTH = 375
export const DESKTOP_WIDTH = 1280

const NEUTRAL: ColorSlots = {
    bg: '#FFFFFF',
    text: '#1B2329',
    accent: '#55636E',
}

const NAV_LINKS = ['Features', 'Pricing', 'Blog', 'Contact']

const PLACEHOLDER_FEATURES = [
    'Signature feature one',
    'Signature feature two',
    'Signature feature three',
]

const SHIPPED_HEADINGS: Record<string, { phone: string; desktop: string }> = {
    '.heading-1': { phone: '1.875rem', desktop: '3.75rem' },
    '.heading-2': { phone: '1.5rem', desktop: '2.25rem' },
    '.heading-4': { phone: '1.25rem', desktop: '1.25rem' },
}

export interface PreviewButton {
    label: string
    style: InlineStyle
}

/** Fills colours a theme doesn't set yet, so nothing renders invisibly. */
const withFallback = (
    colors: ColorSlots,
    fallback: ColorSlots
): ColorSlots => ({
    bg: colors.bg || fallback.bg,
    text: colors.text || fallback.text,
    accent: colors.accent || fallback.accent,
})

export const sitePreview = (
    brief: Brief,
    scheme: RenderScheme,
    width: number
) => {
    const phone = width === PHONE_WIDTH
    const themeNamed = (key: string) =>
        brief.themes.find((theme) => theme.key === key)
    const colorsOf = (theme: ColorTheme | undefined) =>
        theme ? themeColors(brief, theme, scheme) : { ...NEUTRAL }
    const first = brief.themes[0]
    const ready = Boolean(first?.light.bg && first.light.text)

    const canvas = ready ? withFallback(colorsOf(first), NEUTRAL) : NEUTRAL
    const raised = ready
        ? withFallback(colorsOf(themeNamed('raised') ?? first), canvas)
        : { ...NEUTRAL, bg: '#EEF1F3' }
    const night = ready
        ? withFallback(colorsOf(themeNamed('night') ?? first), canvas)
        : { bg: '#1B2329', text: '#FFFFFF', accent: '#9BAAB5' }
    const pick = (key: string, fallback: ColorSlots) => {
        const theme = key ? themeNamed(key) : undefined
        return theme ? withFallback(colorsOf(theme), fallback) : fallback
    }

    const headingFont = fontStack(brief.fonts.heading) || 'inherit'
    const heading = (cls: string): InlineStyle => {
        const row = brief.scale.find((item) => item.cls === cls)
        if (row) return typeStyle(brief, row, phone)
        const shipped = SHIPPED_HEADINGS[cls]
        return {
            fontFamily: headingFont,
            fontWeight: 600,
            fontSize: phone ? shipped?.phone : shipped?.desktop,
        }
    }
    const bodyRow = brief.scale.find((row) => row.cls === '.nuxion-paragraph')
    const eyebrowRow = brief.scale.find((row) => /eyebrow/.test(row.cls))

    const tokens = Object.fromEntries(layoutTokens(brief))
    const spacing = SPACING[brief.layout.spacing]
    const sectionSpace = phone ? spacing[0] : spacing[2]

    const hexSwatches = brief.swatches.filter((swatch) => isHex(swatch.hex))
    const artSwatches = hexSwatches
        .filter((swatch) => /art|accent/.test(swatch.slug))
        .slice(0, 6)

    const asButton =
        (colors: ColorSlots) =>
        (preset: ButtonPreset): PreviewButton => ({
            label: preset.name,
            style: buttonStyle(brief, preset, colors, scheme),
        })
    const features = brief.features
        .map((feature) => feature.text.trim())
        .filter(Boolean)
    const filled = brief.buttons.filter((preset) => preset.style !== 'default')
    const closing = brief.buttons[1] ?? brief.buttons[0]

    return {
        phone,
        ready,
        canvas,
        raised,
        night,
        nav: pick(brief.chrome.navTheme, canvas),
        footer: pick(brief.chrome.footerTheme, night),
        navLinks: phone ? [] : NAV_LINKS,
        headingFont,
        codeFont: fontStack(brief.fonts.code) || 'monospace',
        body: bodyRow
            ? typeStyle(brief, bodyRow, phone)
            : { fontFamily: fontStack(brief.fonts.body) || 'inherit' },
        h1: heading('.heading-1'),
        h2: heading('.heading-2'),
        h4: heading('.heading-4'),
        eyebrow: eyebrowRow ? typeStyle(brief, eyebrowRow, phone) : undefined,
        maxWidth: phone ? 'none' : (tokens['--container-8xl'] ?? '88rem'),
        cardRadius: tokens['--radius-card'] ?? '1rem',
        panelRadius: tokens['--radius-panel'] ?? '1.5rem',
        mediaRadius: tokens['--radius-media'] ?? '0.5rem',
        mediaShadow:
            tokens['--shadow-media'] === 'none'
                ? 'none'
                : '0 12px 28px rgba(0, 0, 0, 0.2)',
        sectionPadding: phone ? `${sectionSpace} 20px` : `${sectionSpace} 32px`,
        closingPadding: phone
            ? `8px 20px ${sectionSpace}`
            : `0 32px ${sectionSpace}`,
        art: artSwatches.length ? artSwatches : hexSwatches.slice(0, 5),
        heroButtons: filled.slice(0, phone ? 2 : 3).map(asButton(canvas)),
        closingButton: closing ? asButton(night)(closing) : undefined,
        /** Columns can shrink below their longest word, so nothing spills off a phone. */
        heroColumns: phone
            ? 'minmax(0, 1fr)'
            : 'minmax(0, 1.15fr) minmax(0, 1fr)',
        featureColumns: phone ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))',
        features: features.length ? features : PLACEHOLDER_FEATURES,
    }
}
