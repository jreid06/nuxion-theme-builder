import {
    BUILD_PLAN,
    fillNames,
    KEEP_WORDS,
    ORIGINALITY_CHECKS,
    QA_GROUPS,
} from '../brief/content'
import {
    CORNERS,
    layoutTokens,
    MEASURES,
    measureToken,
    SPACING,
    themeVariables,
} from '../brief/layout'
import type {
    Brief,
    ButtonPreset,
    ColorTheme,
    FontChoice,
    RenderScheme,
} from '../brief/model'
import { blockType, pascalCase, typeClass } from '../brief/names'
import { swatchName } from '../brief/resolve'
import type { StepId } from '../brief/steps'
import { inlineCode as code, markdownTable as table } from './markdown'

/** The brief as Markdown, section by section, in the template's layout. */

export interface BriefSection {
    /** The wizard step this section belongs to, if any. */
    step: StepId | 'demo'
    text: string
}

const check = (done: boolean | undefined) => `[${done ? 'x' : ' '}]`

const header = (brief: Brief) => {
    const name = brief.name || '<name>'
    const px = brief.px || '<px>'
    return `# ${brief.title || '<Theme name>'} — Theme brief

> ${brief.mood || '<One line of mood.>'}

${table(
    ['', ''],
    [
        [
            '**Codename / namespace**',
            `${code(name)} — every block is ${code(`${name}.*`)}, every class and variable ${code(`.${px}-*`)} / ${code(`--${px}-*`)}`,
        ],
        ['**CSS prefix**', code(px)],
        ['**Default scheme**', brief.scheme],
        ['**Dark scheme**', brief.dark],
        ['**Status**', brief.status],
        ['**Target release**', `Nuxion v${brief.release || '<x.y>'}`],
    ]
)}`
}

const product = (brief: Brief) => `---

## 1. Product

**Positioning** — ${brief.positioning}

**Audience** — ${brief.audience}

**Signature features**

${table(
    ['Feature', 'Delivered by'],
    brief.features.map((feature) => [feature.text, feature.ref])
)}

**Reference brands** — ${brief.refs}

### Originality

${ORIGINALITY_CHECKS.map(
    (item, index) => `- ${check(brief.originality[index])} ${item.text}`
).join('\n')}`

const identity = (brief: Brief) => `---

## 2. Identity

${brief.identity}

### Rules

${table(
    ['Rule', 'Kept by'],
    brief.rules.map((rule) => [rule.rule, rule.how || KEEP_WORDS[rule.keep]])
)}`

const swatches = (brief: Brief) => `---

## 3. Tokens → Nuxion

### 3.1 Swatches

${table(
    ['Name', 'Hex', 'Slug', 'Role', 'Read by'],
    brief.swatches.map((swatch) => [
        swatch.name,
        code(swatch.hex),
        code(`${brief.px || '<px>'}-${swatch.slug}`),
        swatch.role,
        swatch.readBy,
    ])
)}

**Gradients and effects** — ${brief.gradients || 'none'}`

const slotNames = (brief: Brief, theme: ColorTheme, scheme: RenderScheme) =>
    (['bg', 'text', 'accent'] as const)
        .map((role) => swatchName(brief, theme[scheme][role]))
        .filter(Boolean)
        .join(' / ')

const themes = (brief: Brief) => `### 3.2 Color Themes (canvases)

${table(
    [
        'Theme',
        'Light: bg / text / accent',
        'Dark: bg / text / accent',
        'Used on',
    ],
    brief.themes.map((theme) => [
        `${code(theme.key)} — ${theme.note}`,
        slotNames(brief, theme, 'light'),
        slotNames(brief, theme, 'dark') || '(leave empty)',
        theme.used,
    ])
)}`

const presetColours = (
    brief: Brief,
    preset: ButtonPreset,
    scheme: RenderScheme
) => {
    const { fill, text } = preset[scheme]
    if (preset.source === 'seed') return swatchName(brief, fill)
    return (
        [swatchName(brief, fill), swatchName(brief, text)]
            .filter(Boolean)
            .join(' on ') || 'auto'
    )
}

const buttonSteps = (brief: Brief) =>
    (['sm', 'md', 'lg'] as const).flatMap((size) => {
        const step = brief.metrics[size]
        return [
            step.py && `    --button-py-${size}: ${step.py};`,
            step.px && `    --button-px-${size}: ${step.px};`,
            step.text && `    --button-text-${size}: ${step.text};`,
        ].filter(Boolean)
    })

const buttons = (brief: Brief) => {
    const { metrics } = brief
    const lines = [
        ...buttonSteps(brief),
        metrics.border && `    --button-border-width: ${metrics.border};`,
        metrics.radius && `    --radius-button: ${metrics.radius};`,
    ].filter(Boolean)
    return `### 3.3 Button presets

${table(
    [
        'Preset',
        '`style`',
        '`shape`',
        '`colorSource`',
        'Colours (light / dark)',
        'Use',
    ],
    brief.buttons.map((preset) => [
        preset.name,
        preset.style,
        preset.shape,
        preset.source,
        preset.source === 'inherit'
            ? 'follows the theme'
            : [
                  presetColours(brief, preset, 'light'),
                  presetColours(brief, preset, 'dark'),
              ]
                  .filter(Boolean)
                  .join(' / '),
        preset.use,
    ])
)}

**Button metrics**${metrics.note ? ` — ${metrics.note}` : ''}

\`\`\`css
[data-nuxion-theme='${brief.name || '<name>'}'] {
${lines.join('\n')}
}
\`\`\``
}

const fontRow = (role: string, font: FontChoice) => [
    role,
    font.family,
    font.family,
    font.licence,
    font.weights,
    code(font.fallback),
]

const typography = (brief: Brief) => `### 3.4 Typography

${table(
    ['Role', 'Family', '`fonts.js` key', 'Licence', 'Weights', 'Fallback'],
    [
        fontRow('Heading', brief.fonts.heading),
        fontRow('Body', brief.fonts.body),
        fontRow('Code / labels', brief.fonts.code),
    ]
)}

**Type scale**

${table(
    [
        'Nuxion class',
        'Reference role',
        'Mobile size',
        'Desktop size',
        'Line height',
        'Tracking',
        'Weight',
    ],
    brief.scale.map((row) => [
        code(typeClass(brief, row)),
        row.role,
        row.mobile,
        row.desktop,
        row.lh,
        row.tracking,
        row.weight,
    ])
)}`

const shape = (brief: Brief) => {
    const { layout, metrics } = brief
    const tokens = Object.fromEntries(layoutTokens(brief))
    const flat = layout.depth === 'flat'
    return `### 3.5 Width, shape and depth

${table(
    ['Token', 'Shipped', 'Theme', 'Note'],
    [
        [
            code('--container-8xl'),
            '88rem',
            layout.width,
            'nav, sections and footer all read it',
        ],
        ...MEASURES.map(({ key, shipped, use }) => [
            code(measureToken(key)),
            shipped,
            layout.measure[key] ?? '',
            use,
        ]),
        ...CORNERS.filter((corner) => corner.token).map((corner) => [
            code(corner.token ?? ''),
            corner.shipped,
            layout.radius[corner.key],
            corner.used,
        ]),
        [
            code('--shadow-media'),
            'drop shadow',
            tokens['--shadow-media'] ? code('none') : '',
            flat ? 'flat system' : 'keeps Nuxion’s shadow',
        ],
        ['Button corners', 'per preset', metrics.radius, '`--radius-button`'],
        [
            'Input corners',
            '`rounded-md` (6px)',
            layout.radius.input,
            "scoped `[data-block='form.block']` rule",
        ],
    ]
)}

**Depth model** — ${flat ? 'flat, no shadows' : 'shadows'}.

### 3.6 Spacing and rhythm

${table(
    ['', 'Value', 'Where'],
    [
        [
            'Section rhythm',
            `${layout.spacing} (${SPACING[layout.spacing].join(' → ')})`,
            '`--spacing-section`, scoped in `theme.css`',
        ],
    ]
)}

### 3.7 Theme-local variables

Generated from the palette.

${table(
    ['Variable', 'Value', 'Used by'],
    themeVariables(brief).map((variable) => [
        code(variable.name),
        code(variable.value),
        variable.used,
    ])
)}`
}

const art = (brief: Brief) => `---

## 4. Art and imagery

**Imagery policy** — ${[brief.art.policy, brief.art.note].filter(Boolean).join('. ')}

### Art primitives (CSS)

${table(
    ['Class', 'What it draws', 'Variants', 'Motion'],
    brief.art.primitives.map((primitive) => [
        code(`.${brief.px || '<px>'}-${primitive.cls}`),
        primitive.draws,
        primitive.variants,
        primitive.motion,
    ])
)}

### Art elements (Vue)

${table(
    ['Component', 'What it draws', 'Used in'],
    brief.art.elements.map((element) => [
        element.name,
        element.draws,
        element.used,
    ])
)}

### Generated assets

${table(
    ['Asset', 'Count', 'Size', 'Notes'],
    brief.art.assets.map((asset) => [
        asset.name,
        asset.count,
        asset.size,
        asset.notes,
    ])
)}`

const chromeChoice = (kind: string, theme: string) =>
    `${kind}${theme ? `, on ${code(theme)}` : ''}`

const blocks = (brief: Brief) => {
    if (!brief.blocksOn) {
        return `---

## 5. Blocks

Not planned in this brief yet.`
    }
    const { chrome } = brief
    return `---

## 5. Blocks

### 5.1 Shipped blocks, restyled

${table(
    ['`_type`', 'Treatment'],
    brief.restyled.map((block) => [code(block.type), block.treatment])
)}

### 5.2 Theme blocks

${table(
    [
        '`_type`',
        'Component',
        'Purpose',
        'Key fields',
        'Links / PT → projection',
        'In a grid column?',
    ],
    brief.blocks.map((block) => {
        const type = blockType(brief, block)
        return [
            code(type),
            `${pascalCase(type)}.vue`,
            block.purpose,
            block.fields,
            block.projection ? 'yes' : 'no',
            block.fullWidth ? 'no → `fullWidthBlocks`' : 'yes',
        ]
    })
)}

### 5.3 Chrome

${table(
    ['', 'Choice', 'Notes'],
    [
        [
            'Navigation',
            chromeChoice(
                chrome.nav === 'theme' ? 'theme bar' : 'shipped',
                chrome.navTheme
            ),
            chrome.navNote,
        ],
        [
            'Footer',
            chromeChoice(
                chrome.footer === 'theme' ? 'theme footer' : 'shipped',
                chrome.footerTheme
            ),
            chrome.footerNote,
        ],
        ['Mobile Safari tint', '', chrome.safari],
    ]
)}`
}

const demo = () => `---

## 6. Demo site

Not planned in this brief.`

const review = (brief: Brief) => {
    const fill = (text: string) =>
        fillNames(text, brief.name || '<name>', brief.title || '<Theme name>')
    const plan = BUILD_PLAN.map((row, index) => {
        const command = row.command ? ` — \`${fill(row.command)}\`` : ''
        return `${index + 1}. ${check(brief.next[row.step])} **${row.title}** — ${fill(row.detail)}${command}`
    }).join('\n')
    const qa = QA_GROUPS.map(
        (group, groupIndex) =>
            `**${group.title}**\n\n${group.items
                .map(
                    (item, itemIndex) =>
                        `- ${check(brief.qa[`${groupIndex}-${itemIndex}`])} ${fill(item)}`
                )
                .join('\n')}`
    ).join('\n\n')
    const questions =
        brief.questions
            .map(
                ({ question, owner }) =>
                    `- ${question}${owner ? ` (${owner})` : ''}`
            )
            .join('\n') || '- None yet.'
    return `---

## 7. Build plan

${plan}

---

## 8. QA before release

${qa}

---

## Open questions

${questions}`
}

export const renderBriefSections = (brief: Brief): BriefSection[] => [
    { step: 'concept', text: header(brief) },
    { step: 'product', text: product(brief) },
    { step: 'identity', text: identity(brief) },
    { step: 'swatches', text: swatches(brief) },
    { step: 'themes', text: themes(brief) },
    { step: 'buttons', text: buttons(brief) },
    { step: 'type', text: typography(brief) },
    { step: 'shape', text: shape(brief) },
    { step: 'art', text: art(brief) },
    { step: 'blocks', text: blocks(brief) },
    { step: 'demo', text: demo() },
    { step: 'review', text: review(brief) },
]

export const renderBrief = (brief: Brief) =>
    `${renderBriefSections(brief)
        .map((section) => section.text)
        .join('\n\n')
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')}\n`
