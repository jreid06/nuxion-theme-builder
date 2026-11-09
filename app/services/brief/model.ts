/** The whole brief: one plain, JSON-safe object the store owns and saves. */

export const SCHEMA_VERSION = 1

export type DefaultScheme = 'light' | 'dark' | 'system'
export type DarkMode = 'full' | 'none' | 'pinned'
export type ColorRole = 'bg' | 'text' | 'accent'
export type RenderScheme = 'light' | 'dark'
export type FontRole = 'heading' | 'body' | 'code'

export interface Feature {
    text: string
    kind: '' | 'block' | 'art' | 'site'
    ref: string
}

export type KeepStrength = 'token' | 'block' | 'studio' | 'readme'

export interface DesignRule {
    rule: string
    keep: KeepStrength
    how: string
}

export interface Swatch {
    /** Stable across renames, so a slug edit can't break a Color Theme. */
    id: string
    name: string
    hex: string
    /** Without the theme's prefix: `art-1`, not `dw-art-1`. */
    slug: string
    role: string
    readBy: string
}

export type ColorSlots = Record<ColorRole, string>

export interface ColorTheme {
    key: string
    note: string
    light: ColorSlots
    /** An empty slot reuses its light colour. */
    dark: ColorSlots
    used: string
}

export interface ButtonColors {
    fill: string
    text: string
}

export interface ButtonPreset {
    name: string
    style: 'button' | 'outline' | 'default'
    shape: 'default' | 'rounded-soft' | 'rounded'
    source: 'seed' | 'manual' | 'inherit'
    light: ButtonColors
    dark: ButtonColors
    use: string
}

export interface ButtonStep {
    py: string
    px: string
    text: string
}

export interface ButtonMetrics {
    radius: string
    border: string
    sm: ButtonStep
    md: ButtonStep
    lg: ButtonStep
    note: string
}

export interface FontChoice {
    family: string
    weights: string
    licence: string
    fallback: string
}

export interface TypeRow {
    /** May hold `{px}`, replaced by the theme's CSS prefix. */
    cls: string
    role: string
    mobile: string
    desktop: string
    lh: string
    tracking: string
    weight: string
}

export type CornerKey = 'card' | 'panel' | 'media' | 'input'
export type SpacingPreset = 'compact' | 'default' | 'spacious'

export interface Layout {
    width: string
    radius: Record<CornerKey, string>
    depth: 'shadows' | 'flat'
    spacing: SpacingPreset
    measure: Record<string, string>
}

export interface ArtPrimitive {
    cls: string
    draws: string
    variants: string
    motion: string
}

export interface ArtElement {
    name: string
    draws: string
    used: string
}

export interface ArtAsset {
    name: string
    count: string
    size: string
    notes: string
}

export type ImageryPolicy =
    | ''
    | 'photography'
    | 'illustration'
    | 'generated abstract'
    | 'product UI'
    | 'none'

export interface Art {
    policy: ImageryPolicy
    note: string
    primitives: ArtPrimitive[]
    elements: ArtElement[]
    assets: ArtAsset[]
}

export interface RestyledBlock {
    type: string
    treatment: string
}

export interface ThemeBlock {
    /** Without the theme's namespace: `pricing`, not `acme.pricing`. */
    slug: string
    purpose: string
    fields: string
    projection: boolean
    fullWidth: boolean
}

export interface Chrome {
    nav: 'shipped' | 'theme'
    navTheme: string
    navNote: string
    footer: 'shipped' | 'theme'
    footerTheme: string
    footerNote: string
    safari: string
}

export type StudioOption =
    'colours' | 'themes' | 'buttons' | 'settings' | 'home' | 'siteSeo'

export interface OpenQuestion {
    question: string
    owner: string
}

export interface Brief {
    v: typeof SCHEMA_VERSION
    example: boolean
    /** While true, the name and prefix follow the theme's title. */
    autoName: boolean
    title: string
    name: string
    px: string
    mood: string
    scheme: DefaultScheme
    dark: DarkMode
    status: string
    release: string
    positioning: string
    audience: string
    features: Feature[]
    refs: string
    /** Keyed by the index into ORIGINALITY_CHECKS. */
    originality: boolean[]
    identity: string
    rules: DesignRule[]
    swatches: Swatch[]
    gradients: string
    themes: ColorTheme[]
    buttons: ButtonPreset[]
    metrics: ButtonMetrics
    fonts: Record<FontRole, FontChoice>
    scale: TypeRow[]
    headline: string
    layout: Layout
    art: Art
    blocksOn: boolean
    restyled: RestyledBlock[]
    blocks: ThemeBlock[]
    chrome: Chrome
    studio: Record<StudioOption, boolean>
    siteSeo: { title: string; description: string }
    next: Record<string, boolean>
    qa: Record<string, boolean>
    questions: OpenQuestion[]
}

export const emptySlots = (): ColorSlots => ({ bg: '', text: '', accent: '' })

export const colorTheme = (
    key: string,
    note: string,
    used: string,
    light: ColorSlots = emptySlots(),
    dark: ColorSlots = emptySlots()
): ColorTheme => ({ key, note, light, dark, used })

export const buttonPreset = (
    name: string,
    style: ButtonPreset['style'],
    shape: ButtonPreset['shape'],
    source: ButtonPreset['source'],
    use = '',
    light: ButtonColors = { fill: '', text: '' },
    dark: ButtonColors = { fill: '', text: '' }
): ButtonPreset => ({ name, style, shape, source, light, dark, use })

export const typeRow = (
    cls: string,
    role = '',
    mobile = '',
    desktop = '',
    lh = '',
    tracking = '',
    weight = ''
): TypeRow => ({ cls, role, mobile, desktop, lh, tracking, weight })

export const defaultStudioOptions = (): Brief['studio'] => ({
    colours: true,
    themes: true,
    buttons: true,
    settings: true,
    home: true,
    siteSeo: true,
})

const emptyStep = (): ButtonStep => ({ py: '', px: '', text: '' })

const emptyFont = (fallback = ''): FontChoice => ({
    family: '',
    weights: '',
    licence: '',
    fallback,
})

export const blankLayout = (): Layout => ({
    width: '',
    radius: { card: '', panel: '', media: '', input: '' },
    depth: 'shadows',
    spacing: 'default',
    measure: {},
})

export const blankBrief = (): Brief => ({
    v: SCHEMA_VERSION,
    example: false,
    autoName: true,
    title: '',
    name: '',
    px: '',
    mood: '',
    scheme: 'system',
    dark: 'full',
    status: 'brief',
    release: '',
    positioning: '',
    audience: '',
    features: [],
    refs: '',
    originality: [false, false, false, false, false, false, false],
    identity: '',
    rules: [],
    swatches: [],
    gradients: '',
    themes: [
        colorTheme('canvas', 'site default', 'Site Settings default'),
        colorTheme('raised', 'panel', 'cards, inverted bands'),
        colorTheme('night', 'always dark', 'nav and footer'),
    ],
    buttons: [
        buttonPreset('Primary', 'button', 'rounded', 'seed', 'main CTA'),
        buttonPreset('Secondary', 'outline', 'rounded', 'inherit'),
        buttonPreset(
            'Text link',
            'default',
            'default',
            'inherit',
            'inline links'
        ),
    ],
    metrics: {
        radius: '',
        border: '1px',
        sm: emptyStep(),
        md: emptyStep(),
        lg: emptyStep(),
        note: '',
    },
    fonts: {
        heading: emptyFont(),
        body: emptyFont(),
        code: emptyFont('monospace'),
    },
    scale: [
        typeRow('.heading-1', 'display'),
        typeRow('.heading-2', 'heading-lg'),
        typeRow('.heading-3', 'heading'),
        typeRow('.heading-4', 'heading-sm'),
        typeRow('.heading-5', 'subheading'),
        typeRow('.heading-6'),
        typeRow('.nuxion-paragraph', 'body'),
        typeRow('.{px}-eyebrow', 'caption / label'),
    ],
    headline: '',
    layout: blankLayout(),
    art: {
        policy: '',
        note: '',
        primitives: [],
        elements: [],
        assets: [
            {
                name: 'Logo light / dark (SVG)',
                count: '2',
                size: '',
                notes: '',
            },
            {
                name: 'Favicon + apple-touch-icon',
                count: '2',
                size: '',
                notes: '',
            },
            { name: 'OG default', count: '1', size: '1200×630', notes: '' },
            { name: 'Blog covers', count: '', size: '', notes: '' },
            { name: 'Author avatars', count: '', size: '', notes: '' },
        ],
    },
    blocksOn: false,
    restyled: [],
    blocks: [],
    chrome: {
        nav: 'shipped',
        navTheme: '',
        navNote: '',
        footer: 'shipped',
        footerTheme: '',
        footerNote: '',
        safari: '',
    },
    studio: defaultStudioOptions(),
    siteSeo: { title: '', description: '' },
    next: {},
    qa: {},
    questions: [],
})
