import {
    blankBrief,
    buttonPreset as button,
    colorTheme,
    typeRow,
    type Brief,
    type ColorSlots,
    type Swatch,
} from './model'

/** Driftwire, the theme Nuxion ships, as the worked example the app opens on. */

const swatch = (
    id: string,
    name: string,
    hex: string,
    slug: string,
    role: string,
    readBy: string
): Swatch => ({ id, name, hex, slug, role, readBy })

const slots = (bg: string, text: string, accent: string): ColorSlots => ({
    bg,
    text,
    accent,
})

export const exampleBrief = (): Brief => ({
    ...blankBrief(),
    example: true,
    autoName: false,
    title: 'Driftwire',
    name: 'driftwire',
    px: 'dw',
    mood: 'A ship’s chart room: paper, navy ink and signal flags, where every release is a flag you hoist and can lower again.',
    scheme: 'light',
    dark: 'full',
    status: 'demo',
    release: '1.10',
    direction: {
        vibes: ['editorial', 'technical', 'calm'],
        sector: 'software',
    },
    positioning:
        'Marketing sites for software and developer tools that would rather look considered than look like every other dark SaaS page.',
    audience:
        'Developers and agencies building a product site on Nuxion, comfortable in a Nuxt repo.',
    features: [
        {
            text: 'A chart-border scale bar across the top of each section',
            kind: 'site',
            ref: 'theme.css §2 Frame',
        },
        {
            text: 'A signal board in the hero, where flags visibly hoist and lower',
            kind: 'block',
            ref: 'driftwire.hero + DriftwireConsole',
        },
        {
            text: 'Signal-flag art: bold geometric panels instead of gradients',
            kind: 'art',
            ref: 'theme.css §3 + DriftwireArt',
        },
        {
            text: 'Chart contour lines',
            kind: 'art',
            ref: 'theme.css §3 + scripts/dataset/art/',
        },
        {
            text: 'Serif display headlines on warm paper',
            kind: 'site',
            ref: '§3.4 fonts and type scale',
        },
        {
            text: 'The changelog as a ship’s log',
            kind: 'block',
            ref: 'driftwire.timeline',
        },
    ],
    refs: 'None. The concept comes from the product: a feature flag as a signal flag, raised and lowered on a mast.',
    originality: [true, false, true, true, true, true, true],
    identity:
        'The page is a working chart: warm paper, navy ink, ruled edges and the graduated border every sea chart carries. Colour isn’t ambient. It arrives only as signal flags, in the flat primary colours flags use so they can be read from a distance, which gives the theme large areas of quiet paper and a few loud, geometric moments.\n\nDepth comes from tone and ruled lines, never from glow, blur or drop shadow. There are no gradients anywhere. The recognisable tension is an old-fashioned serif headline set against precise engineering detail: monospaced labels, tick marks and code.',
    rules: [
        {
            rule: 'No gradients, mesh, grain or glow',
            keep: 'block',
            how: 'the art options offer only flags and contours; no gradient swatch or button preset ships',
        },
        {
            rule: 'No vertical rails or corner crosses',
            keep: 'token',
            how: 'theme.css §2 draws only the horizontal scale bar',
        },
        {
            rule: 'Dark is navy, never neutral black',
            keep: 'token',
            how: 'the only dark swatches are ground and panel',
        },
        {
            rule: 'Signal colours appear only in art and the accent button',
            keep: 'block',
            how: 'no text field offers them; theme.css reads them only as --dw-art-*',
        },
        {
            rule: 'Headings left-aligned on Driftwire blocks',
            keep: 'block',
            how: 'block templates default to left',
        },
        {
            rule: 'Buttons are rectangles, never pills',
            keep: 'token',
            how: 'every Link Style sets one shape, and --radius-button sets the corner',
        },
    ],
    swatches: [
        swatch(
            'paper',
            'Paper',
            '#F5EFE3',
            'paper',
            'light canvas',
            'canvas bg'
        ),
        swatch('mist', 'Chart', '#EADFCB', 'mist', 'light panel', 'raised bg'),
        swatch(
            'inkl',
            'Navy ink',
            '#13233B',
            'ink-light',
            'light text',
            'canvas, raised text'
        ),
        swatch(
            'ground',
            'Deep navy',
            '#0E1C2F',
            'ground',
            'dark canvas',
            'canvas dark bg, night bg'
        ),
        swatch(
            'panel',
            'Night panel',
            '#172A43',
            'panel',
            'dark panel',
            'raised dark bg'
        ),
        swatch(
            'line',
            'Night line',
            '#2B4060',
            'line',
            'dark hairline',
            'outline border'
        ),
        swatch(
            'ink',
            'Chalk',
            '#F3EDE0',
            'ink',
            'dark text',
            'canvas, raised dark text'
        ),
        swatch(
            'muted',
            'Fog',
            '#B7BFCB',
            'muted',
            'dark secondary text',
            '--dw-muted, footer links'
        ),
        swatch(
            'faint',
            'Haze',
            '#919DAE',
            'faint',
            'dark labels',
            'generated images'
        ),
        swatch(
            'a1',
            'Signal red',
            '#B02A1A',
            'art-1',
            'accent (light), art',
            'canvas accent, --dw-art-1'
        ),
        swatch('a2', 'Signal blue', '#1D4F91', 'art-2', 'art', '--dw-art-2'),
        swatch('a3', 'Signal yellow', '#F2B62B', 'art-3', 'art', '--dw-art-3'),
        swatch(
            'a4',
            'Bunting',
            '#FBF7EE',
            'art-4',
            'art, the flags’ white',
            '--dw-art-4'
        ),
        swatch(
            'a5',
            'Deep water',
            '#1B6F6F',
            'art-5',
            'art, contours',
            '--dw-art-5'
        ),
        swatch(
            'a6',
            'Sand',
            '#D8C8A4',
            'art-6',
            'art, contours on dark',
            '--dw-art-6'
        ),
        swatch(
            'flare',
            'Flare',
            '#FF8A6B',
            'flare',
            'accent (dark)',
            'canvas dark accent'
        ),
        swatch(
            'white',
            'White',
            '#FFFFFF',
            'white',
            'button label',
            'Accent button'
        ),
    ],
    gradients: 'None.',
    themes: [
        colorTheme(
            'canvas',
            'site default',
            'Site Settings default',
            slots('paper', 'inkl', 'a1'),
            slots('ground', 'ink', 'flare')
        ),
        colorTheme(
            'raised',
            'panel',
            'panels, comparison table',
            slots('mist', 'inkl', 'a1'),
            slots('panel', 'ink', 'flare')
        ),
        colorTheme(
            'night',
            'always dark',
            'footer and closing call to action',
            slots('ground', 'ink', 'flare')
        ),
    ],
    buttons: [
        button(
            'Primary',
            'button',
            'rounded-soft',
            'seed',
            'default action',
            { fill: 'inkl', text: '' },
            { fill: 'ink', text: '' }
        ),
        button(
            'Accent',
            'button',
            'rounded-soft',
            'manual',
            'the one main action',
            { fill: 'a1', text: 'white' },
            { fill: 'flare', text: 'ground' }
        ),
        button(
            'Secondary',
            'button',
            'rounded-soft',
            'manual',
            'supporting action',
            { fill: 'mist', text: 'inkl' },
            { fill: 'panel', text: 'ink' }
        ),
        button('Outline', 'outline', 'rounded-soft', 'inherit', 'quiet action'),
        button('Text link', 'default', 'default', 'inherit', 'inline links'),
        button(
            'Muted',
            'default',
            'default',
            'manual',
            'footer links',
            { fill: '', text: 'muted' },
            { fill: '', text: 'muted' }
        ),
    ],
    metrics: {
        ...blankBrief().metrics,
        radius: '2px',
        border: '1px',
        note: 'Inter 500, no letter-spacing.',
    },
    fonts: {
        heading: {
            family: 'Playfair Display',
            weights: '500',
            licence: 'OFL 1.1',
            fallback: 'serif',
        },
        body: {
            family: 'Inter',
            weights: '400–600',
            licence: 'OFL 1.1',
            fallback: 'sans-serif',
        },
        code: {
            family: 'JetBrains Mono',
            weights: '400–500',
            licence: 'OFL 1.1',
            fallback: 'monospace',
        },
    },
    scale: [
        typeRow(
            '.heading-1',
            'display',
            '2.5rem',
            '4.5rem',
            '1.08',
            '-0.01em',
            '500'
        ),
        typeRow(
            '.heading-2',
            'section',
            '2rem',
            '3.25rem',
            '1.12',
            '-0.005em',
            '500'
        ),
        typeRow('.heading-3', 'panel', '1.5rem', '1.875rem', '1.2', '0', '500'),
        typeRow('.heading-4', 'item', '1.25rem', '1.5rem', '1.25', '0', '500'),
        typeRow(
            '.nuxion-paragraph',
            'body',
            '1rem',
            '1.0625rem',
            '1.6',
            '0',
            '400'
        ),
        typeRow(
            '.{px}-eyebrow',
            'label',
            '0.75rem',
            '0.75rem',
            '1.4',
            '0.08em',
            '500'
        ),
    ],
    headline: 'Ship every change. Lower any of them.',
    layout: {
        ...blankBrief().layout,
        width: '76rem',
        radius: {
            card: '0.25rem',
            panel: '0.25rem',
            media: '0.125rem',
            input: '2px',
        },
        depth: 'flat',
    },
    art: {
        policy: 'generated abstract',
        note: 'Generated, flat, geometric. Everything is drawn from the palette by our own code, and no third-party image ships.',
        primitives: [
            {
                cls: 'scale',
                draws: 'alternating graduated blocks, as on a chart’s border',
                variants: '',
                motion: 'none',
            },
            {
                cls: 'flag',
                draws: 'flat signal-flag panels in hard-edged geometry',
                variants:
                    '--quartered, --saltire, --bordered, --pennant, --split',
                motion: 'none',
            },
            {
                cls: 'contours',
                draws: 'chart depth lines, on a light ground',
                variants: '--sand, --shallows',
                motion: 'none',
            },
        ],
        elements: [
            {
                name: 'DriftwireArt',
                draws: 'one art option as a panel',
                used: 'CTA, bento, stories',
            },
            {
                name: 'DriftwireConsole',
                draws: 'the signal board: pennants on a mast, hoist and lower',
                used: 'hero',
            },
            {
                name: 'DriftwireBentoVisual',
                draws: 'small product scenes in the new palette',
                used: 'bento',
            },
        ],
        assets: [
            {
                name: 'Logo light / dark (SVG)',
                count: '2',
                size: '',
                notes: 'pennant-on-a-mast mark; serif wordmark',
            },
            {
                name: 'Favicon + apple-touch-icon',
                count: '2',
                size: '',
                notes: 'the pennant',
            },
            {
                name: 'OG default',
                count: '1',
                size: '1200×630',
                notes: 'paper, contours, one flag',
            },
            {
                name: 'Blog covers',
                count: '',
                size: '',
                notes: 'flags and contours',
            },
            {
                name: 'Author avatars',
                count: '',
                size: '',
                notes: 'flat, drawn, on signal colours',
            },
            {
                name: 'Customer wordmarks',
                count: '',
                size: '',
                notes: 'recoloured only',
            },
            {
                name: 'Diagrams',
                count: '',
                size: '',
                notes: 'navy line work on paper',
            },
        ],
    },
    restyled: [
        {
            type: 'faq',
            treatment:
                'Ruled lines between items; Questions in the heading font',
        },
        {
            type: 'testimonials',
            treatment:
                'Quote in the heading font; Flat, no shadows; chart panels',
        },
        {
            type: 'grid.base',
            treatment: 'Real gaps between cells; chart panels',
        },
        {
            type: 'form.block',
            treatment: 'Underlined inputs, no boxes; 2px corners',
        },
    ],
    blocks: [
        {
            slug: 'hero',
            purpose:
                'two columns, text left and signal board right; logos a plain row below',
            fields: 'announcement, consoleFlags, logos',
            projection: true,
            fullWidth: true,
        },
        {
            slug: 'bento',
            purpose: 'asymmetric panels with gaps',
            fields: 'cells, title, body, metric',
            projection: false,
            fullWidth: true,
        },
        {
            slug: 'code-window',
            purpose: 'code left, intro right, light panel in the light scheme',
            fields: 'tabs, points, title, body',
            projection: false,
            fullWidth: true,
        },
        {
            slug: 'stories',
            purpose: 'editorial quote list with ruled separators',
            fields: 'stories, name, role, quote, company, result',
            projection: true,
            fullWidth: true,
        },
        {
            slug: 'metrics',
            purpose: 'logbook figures in a ruled row',
            fields: 'stats, value, label, note',
            projection: false,
            fullWidth: true,
        },
        {
            slug: 'logo-cloud',
            purpose: 'ruled table of integration categories',
            fields: 'items, name, icon',
            projection: true,
            fullWidth: true,
        },
        {
            slug: 'pricing',
            purpose: 'ledger columns, billing switch and comparison table',
            fields: 'tiers, name, monthly, blurb, includes, groups',
            projection: true,
            fullWidth: true,
        },
        {
            slug: 'timeline',
            purpose: 'ship’s-log entries',
            fields: 'releases, version, title, notes, tags, date',
            projection: true,
            fullWidth: true,
        },
        {
            slug: 'cta',
            purpose: 'flag-art panel on night, left-aligned',
            fields: 'art, install',
            projection: true,
            fullWidth: true,
        },
    ],
    chrome: {
        nav: 'shipped',
        navTheme: 'night',
        navNote:
            'always navy, because the shipped logo can’t switch by colour scheme',
        footer: 'shipped',
        footerTheme: 'night',
        footerNote: 'always navy, like a chart’s title block',
        safari: 'the bar keeps the touch-device --studio-nuxt-body-color rule, and a blur must not be reintroduced',
    },
    qa: { '1-0': true, '1-2': true },
    questions: [
        {
            question:
                'A trademark search and an IP lawyer’s view before 1.10 ships.',
            owner: 'Owner',
        },
        {
            question: 'Mobile Safari status and toolbar tint, on a device.',
            owner: 'Owner',
        },
    ],
})
