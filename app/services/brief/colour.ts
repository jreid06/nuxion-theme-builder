/** Colour maths: pure, and only ever fed six-digit hex. */

export const BODY_CONTRAST = 4.5
export const UI_CONTRAST = 3

export const isHex = (value?: string): value is string =>
    /^#[0-9a-f]{6}$/i.test(value ?? '')

const channels = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
]

const luminance = (hex: string) => {
    const [r, g, b] = channels(hex).map((value) => {
        const unit = value / 255
        return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4
    }) as [number, number, number]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** The WCAG contrast ratio, or null when either colour isn't valid yet. */
export const contrastRatio = (a?: string, b?: string): number | null => {
    if (!isHex(a) || !isHex(b)) return null
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
        number,
        number,
    ]
    return (high + 0.05) / (low + 0.05)
}

/** White or near-black, whichever reads better on this fill. */
export const readableInk = (fill: string) =>
    (contrastRatio(fill, '#FFFFFF') ?? 0) >=
    (contrastRatio(fill, '#111111') ?? 0)
        ? '#FFFFFF'
        : '#111111'

const round = (value: number) => Math.round(value * 1e4) / 1e4

/** A value as Sanity's colour input stores it: hex plus hsl, hsv and rgb. */
export const sanityColor = (hex: string) => {
    const [r, g, b] = channels(hex)
    const [rn, gn, bn] = [r / 255, g / 255, b / 255]
    const max = Math.max(rn, gn, bn)
    const min = Math.min(rn, gn, bn)
    const delta = max - min
    const lightness = (max + min) / 2
    let hue = 0
    if (delta) {
        if (max === rn) hue = ((gn - bn) / delta) % 6
        else if (max === gn) hue = (bn - rn) / delta + 2
        else hue = (rn - gn) / delta + 4
        hue *= 60
        if (hue < 0) hue += 360
    }
    const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0
    return {
        _type: 'color',
        alpha: 1,
        hex,
        hsl: {
            _type: 'hslaColor',
            h: round(hue),
            s: round(saturation),
            l: round(lightness),
            a: 1,
        },
        hsv: {
            _type: 'hsvaColor',
            h: round(hue),
            s: round(max ? delta / max : 0),
            v: round(max),
            a: 1,
        },
        rgb: { _type: 'rgbaColor', r, g, b, a: 1 },
    }
}
