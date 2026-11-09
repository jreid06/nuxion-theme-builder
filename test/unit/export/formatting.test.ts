import { format, type Options } from 'prettier'
import { describe, expect, it } from 'vitest'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief, type Brief } from '~/services/brief/model'
import { renderBrief } from '~/services/export/renderBrief'
import { renderThemeCss } from '~/services/export/renderThemeCss'

/**
 * Exports land in a Nuxion repo, whose `npm run check` runs `prettier --check`,
 * so they have to come out already formatted under its config.
 */
const NUXION_PRETTIER: Options = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
}

const planned = () => {
    const brief = exampleBrief()
    brief.blocksOn = true
    return brief
}

const briefs: [string, () => Brief][] = [
    ['the example', exampleBrief],
    ['the example with blocks planned', planned],
    ['a blank brief', blankBrief],
]

describe.each(briefs)('formatting of %s', (_, makeBrief) => {
    it('produces a BRIEF.md Prettier leaves alone', async () => {
        const markdown = renderBrief(makeBrief())
        expect(
            await format(markdown, { ...NUXION_PRETTIER, parser: 'markdown' })
        ).toBe(markdown)
    })

    it('produces a theme.css Prettier leaves alone', async () => {
        const css = renderThemeCss(makeBrief())
        expect(await format(css, { ...NUXION_PRETTIER, parser: 'css' })).toBe(
            css
        )
    })
})
