import { layoutTokens, SPACING, themeVariables } from '../brief/layout'
import type { Brief } from '../brief/model'
import { typeClass } from '../brief/names'

/** A starter theme.css, in the same section order as Driftwire's. */

const tokenLines = (brief: Brief) => {
    const { metrics, layout } = brief
    const lines = layoutTokens(brief).map(
        ([token, value]) => `    ${token}: ${value};`
    )
    if (metrics.radius) lines.push(`    --radius-button: ${metrics.radius};`)
    if (metrics.border) {
        lines.push(`    --button-border-width: ${metrics.border};`)
    }
    for (const size of ['sm', 'md', 'lg'] as const) {
        const step = metrics[size]
        if (step.py) lines.push(`    --button-py-${size}: ${step.py};`)
        if (step.px) lines.push(`    --button-px-${size}: ${step.px};`)
        if (step.text) lines.push(`    --button-text-${size}: ${step.text};`)
    }
    const headingWeight = parseInt(brief.scale[0]?.weight ?? '')
    if (headingWeight) lines.push(`    --heading-weight: ${headingWeight};`)

    if (layout.spacing !== 'default') {
        const [phone, tablet, desktop] = SPACING[layout.spacing]
        lines.push(
            `    --spacing-section: ${phone};`,
            '',
            `    @variant sm {\n        --spacing-section: ${tablet};\n    }`,
            '',
            `    @variant lg {\n        --spacing-section: ${desktop};\n    }`
        )
    }
    return lines
}

const declarations = (selector: string, lines: string[]) =>
    lines.length ? [`${selector} {\n${lines.join('\n')}\n}`] : []

const typeRules = (brief: Brief, scope: string) =>
    brief.scale
        .filter((row) => row.mobile || row.desktop)
        .map((row) => {
            const body = [
                row.mobile && `        font-size: ${row.mobile};`,
                row.lh && `        line-height: ${row.lh};`,
                row.tracking && `        letter-spacing: ${row.tracking};`,
                row.desktop &&
                    row.desktop !== row.mobile &&
                    `\n        @variant md {\n            font-size: ${row.desktop};\n        }`,
            ].filter(Boolean)
            return `    ${scope} ${typeClass(brief, row)} {\n${body.join('\n')}\n    }`
        })
        .join('\n\n')

export const renderThemeCss = (brief: Brief) => {
    const name = brief.name || 'name'
    const px = brief.px || 'xx'
    const scope = `[data-nuxion-theme='${name}']`
    const variables = themeVariables(brief).map(
        (variable) => `    ${variable.name}: ${variable.value};`
    )
    const inputRadius = brief.layout.radius.input
    const restyled = brief.blocksOn ? brief.restyled : []
    const typeRows = typeRules(brief, scope)

    return `${[
        `/*
 * ${[brief.title || name, brief.mood].filter(Boolean).join(' — ')}
 *
 * Starter generated from the theme brief. Sections match Driftwire's:
 *   1. Tokens  2. Frame  3. Art primitives  4. Type and buttons  5. Shipped blocks
 *
 * Every site-wide rule starts with ${scope}.
 */`,
        `@reference '../../../app/assets/css/main.css';`,
        '/* ── 1. Tokens ── */',
        ...declarations(scope, tokenLines(brief)),
        ...declarations(
            ':root',
            variables.filter((line) => !line.includes('currentColor'))
        ),
        ...declarations(
            `.${px}`,
            variables.filter((line) => line.includes('currentColor'))
        ),
        '/* ── 2. Frame ── */',
        '/* ── 3. Art primitives ── */',
        ...brief.art.primitives.map(
            (primitive) =>
                `/* ${primitive.draws} */\n.${px}-${primitive.cls} {\n}`
        ),
        '/* ── 4. Type and buttons ── */',
        ...(typeRows ? [`@layer components {\n${typeRows}\n}`] : []),
        '/* ── 5. Shipped blocks, restyled ── */',
        ...(inputRadius
            ? [
                  `/* Form field corners */\n${scope}\n    [data-block='form.block']\n    :is(input, textarea, [role='combobox']) {\n    border-radius: ${inputRadius};\n}`,
              ]
            : []),
        ...restyled.map(
            (block) =>
                `/* ${block.treatment} */\n${scope} [data-block='${block.type}'] {\n}`
        ),
    ].join('\n\n')}\n`
}
