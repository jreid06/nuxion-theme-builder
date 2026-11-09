import { describe, expect, it } from 'vitest'
import facts from '~~/data/nuxion.generated.json'
import { exampleBrief } from '~/services/brief/example'
import { blankBrief, type Brief } from '~/services/brief/model'
import { exportKit } from '~/services/export/kit'
import { markdownTable } from '~/services/export/markdown'
import { nextSteps } from '~/services/export/nextSteps'
import { renderBrief } from '~/services/export/renderBrief'
import { renderCommands } from '~/services/export/renderCommands'
import { renderThemeCss } from '~/services/export/renderThemeCss'
import {
    renderStudioContent,
    studioDocuments,
    studioOptionOn,
} from '~/services/export/studioContent'

const planned = () => {
    const brief = exampleBrief()
    brief.blocksOn = true
    return brief
}
const docsOfType = (brief: Brief, type: string) =>
    studioDocuments(brief).filter((document) => document._type === type)
const headingsOf = (markdown: string) =>
    [...markdown.matchAll(/^#{2,3} .+$/gm)].map((match) => match[0])

describe('markdownTable', () => {
    it('pads columns and escapes pipes', () => {
        expect(markdownTable(['A', 'B'], [['one|two', 'x']])).toBe(
            [
                '| A        | B   |',
                '| -------- | --- |',
                '| one\\|two | x   |',
            ].join('\n')
        )
    })
})

describe('renderBrief', () => {
    it('matches the stored Driftwire output', () => {
        expect(renderBrief(planned())).toMatchSnapshot()
    })

    it('keeps every heading of Nuxion’s template, bar the demo’s own', () => {
        const emitted = headingsOf(renderBrief(planned()))
        const demoOnly = [
            '### Brand',
            '### Cast',
            '### Pages',
            '### Blog',
            '### Settings and forms',
        ]
        for (const heading of facts.briefHeadings) {
            if (!demoOnly.includes(heading)) expect(emitted).toContain(heading)
        }
    })

    it('emits only headings Nuxion’s template has', () => {
        for (const heading of headingsOf(renderBrief(planned()))) {
            expect(facts.briefHeadings).toContain(heading)
        }
    })

    it('marks blocks and the demo as not planned', () => {
        const markdown = renderBrief(exampleBrief())
        expect(markdown).toContain(
            '## 5. Blocks\n\nNot planned in this brief yet.'
        )
        expect(markdown).not.toContain('### 5.2 Theme blocks')
        expect(markdown).toContain(
            '## 6. Demo site\n\nNot planned in this brief.'
        )
    })

    it('renders an empty brief without crashing', () => {
        expect(renderBrief(blankBrief())).toContain(
            '<Theme name> — Theme brief'
        )
    })

    it('ticks the build plan from the next steps', () => {
        const brief = exampleBrief()
        brief.next.skeleton = true
        expect(renderBrief(brief)).toContain('2. [x] **Skeleton**')
    })
})

describe('renderThemeCss', () => {
    it('matches the stored Driftwire output', () => {
        expect(renderThemeCss(planned())).toMatchSnapshot()
    })

    it('leaves the default section spacing to Nuxion', () => {
        expect(renderThemeCss(exampleBrief())).not.toContain(
            '--spacing-section'
        )
    })

    it('writes all three spacing steps for a preset', () => {
        const brief = exampleBrief()
        brief.layout.spacing = 'spacious'
        const css = renderThemeCss(brief)
        expect(css).toContain('--spacing-section: 4rem;')
        expect(css).toMatch(/@variant sm \{\s+--spacing-section: 6rem;/)
        expect(css).toMatch(/@variant lg \{\s+--spacing-section: 8rem;/)
    })

    it('exports line lengths and the form field rule', () => {
        const brief = exampleBrief()
        brief.layout.measure.lead = '40rem'
        const css = renderThemeCss(brief)
        expect(css).toContain('--container-measure-lead: 40rem;')
        expect(css).toContain("[data-block='form.block']")
        expect(css).toContain('border-radius: 2px;')
    })

    it('omits restyle rules while blocks are skipped', () => {
        expect(renderThemeCss(exampleBrief())).not.toContain(
            "[data-block='faq']"
        )
        expect(renderThemeCss(planned())).toContain("[data-block='faq']")
    })

    it('scopes every site-wide token block', () => {
        expect(renderThemeCss(exampleBrief())).toContain(
            "[data-nuxion-theme='driftwire'] {\n    --container-8xl: 76rem;"
        )
    })
})

describe('studioDocuments', () => {
    it('creates one document per item', () => {
        const brief = exampleBrief()
        expect(docsOfType(brief, 'color.palette')).toHaveLength(1)
        expect(docsOfType(brief, 'color.theme.single')).toHaveLength(17)
        expect(docsOfType(brief, 'color.theme')).toHaveLength(3)
        expect(docsOfType(brief, 'link.styles')).toHaveLength(6)
        expect(docsOfType(brief, 'page')).toHaveLength(1)
        expect(docsOfType(brief, 'siteSettings')).toHaveLength(1)
    })

    it('points references at documents in the same file', () => {
        const documents = studioDocuments(exampleBrief())
        const ids = new Set(documents.map((document) => document._id))
        const walk = (value: unknown): void => {
            if (Array.isArray(value)) return value.forEach(walk)
            if (!value || typeof value !== 'object') return
            const reference = (value as { _ref?: string })._ref
            if (reference) expect(ids).toContain(reference)
            Object.values(value).forEach(walk)
        }
        walk(documents)
    })

    it('uses ids with no dots, which would make them private', () => {
        for (const { _id } of studioDocuments(exampleBrief())) {
            expect(_id).not.toContain('.')
        }
    })

    it('switches the theme on and sets its homepage', () => {
        const [settings] = docsOfType(exampleBrief(), 'siteSettings')
        expect(settings).toMatchObject({
            siteTheme: 'driftwire',
            frontpage: { _ref: 'driftwire-page-home' },
            theme: { _ref: 'driftwire-theme-canvas' },
        })
    })

    it('drops dependants when an option they need is off', () => {
        const brief = exampleBrief()
        brief.studio.colours = false
        expect(studioOptionOn(brief, 'themes')).toBe(false)
        expect(docsOfType(brief, 'color.theme')).toHaveLength(0)
        expect(docsOfType(brief, 'link.styles')).toHaveLength(0)
    })

    it('omits the homepage reference with no home page', () => {
        const brief = exampleBrief()
        brief.studio.home = false
        expect(docsOfType(brief, 'siteSettings')[0]?.frontpage).toBeUndefined()
    })

    it('falls back to light when a one-scheme theme says system', () => {
        const brief = exampleBrief()
        brief.dark = 'none'
        brief.scheme = 'system'
        expect(docsOfType(brief, 'siteSettings')[0]?.colorScheme).toBe('light')
    })

    it('writes no dark slots for a one-scheme theme', () => {
        const brief = exampleBrief()
        brief.dark = 'none'
        expect(docsOfType(brief, 'color.theme')[0]).not.toHaveProperty(
            'backgroundDark'
        )
    })

    it('writes one parseable JSON document per line', () => {
        const lines = renderStudioContent(exampleBrief()).split('\n')
        expect(lines).toHaveLength(29)
        lines.forEach((line) => expect(() => JSON.parse(line)).not.toThrow())
    })
})

describe('renderCommands', () => {
    it('creates the theme with only the hero when blocks are skipped', () => {
        const commands = renderCommands(exampleBrief())
        expect(commands).toContain(
            'npm run scaffold:theme -- driftwire --title "Driftwire"'
        )
        expect(commands).not.toContain('scaffold:component')
    })

    it('adds a line per block, leaving the hero to the theme scaffold', () => {
        const commands = renderCommands(planned())
        expect(commands).toContain(
            'npm run scaffold:component -- driftwire.pricing --theme driftwire'
        )
        expect(commands).not.toContain('scaffold:component -- driftwire.hero')
    })

    it('adds navigation and footer scaffolds only when chosen', () => {
        const brief = planned()
        brief.chrome.nav = 'theme'
        expect(renderCommands(brief)).toContain('--kind navigation')
        expect(renderCommands(brief)).not.toContain('--kind footer')
    })

    it('only generates fonts when one is missing from Nuxion', () => {
        const brief = exampleBrief()
        expect(renderCommands(brief)).not.toContain('fonts:generate')
        brief.fonts.body.family = 'Open Thing'
        expect(renderCommands(brief)).toContain('npm run fonts:generate')
    })

    it('skips the import with nothing to import', () => {
        const brief = exampleBrief()
        brief.studio.colours = false
        brief.studio.settings = false
        expect(renderCommands(brief)).not.toContain('dataset import')
    })
})

describe('nextSteps', () => {
    const ids = (brief: Brief) => nextSteps(brief).map((step) => step.id)

    it('follows the order the theme guide sets out', () => {
        expect(ids(exampleBrief())).toEqual([
            'place',
            'dataset',
            'skeleton',
            'fonts',
            'css',
            'colours',
            'look',
            'art',
            'blocks',
            'check',
        ])
    })

    it('adds navigation and footer once blocks are planned', () => {
        expect(ids(planned())).toContain('chrome')
    })

    it('imports when it can and falls back to manual Studio steps', () => {
        const brief = exampleBrief()
        const find = () =>
            nextSteps(brief).find((step) => step.id === 'colours')!
        expect(find().title).toBe('Import your Studio content')
        expect(find().command).toContain('dataset import')

        brief.studio.colours = false
        brief.studio.settings = false
        expect(find().title).toBe('Enter your colours and buttons')
        expect(find().command).toBe('npm run cssvars:generate')
        expect(find().items?.join()).toMatch(/create a palette named Driftwire/)
    })

    it('says to create a homepage when the file will not', () => {
        const brief = exampleBrief()
        brief.studio.home = false
        expect(
            nextSteps(brief)
                .find((step) => step.id === 'colours')
                ?.items?.join()
        ).toMatch(/choose it as the Homepage/)
    })
})

describe('exportKit', () => {
    it('hands over exactly four items', () => {
        expect(exportKit(exampleBrief()).map((item) => item.key)).toEqual([
            'brief',
            'css',
            'studio',
            'commands',
        ])
    })

    it('says plainly when no Studio content is selected', () => {
        const brief = exampleBrief()
        brief.studio.colours = false
        brief.studio.settings = false
        expect(exportKit(brief)[2]?.text).toBe('Nothing selected.')
    })
})
