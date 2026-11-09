import { layoutTokens, themeVariables } from '../brief/layout'
import type { Brief } from '../brief/model'
import { themeName } from '../brief/names'
import { plannedExtraBlocks, renderCommands } from './renderCommands'
import { renderBrief } from './renderBrief'
import { renderThemeCss } from './renderThemeCss'
import {
    renderStudioContent,
    STUDIO_OPTIONS,
    studioContentPath,
    studioOptionOn,
} from './studioContent'

/** The four things Review and export hands over, and what each one contains. */

export type ExportKey = 'brief' | 'css' | 'studio' | 'commands'

export interface ExportItem {
    key: ExportKey
    label: string
    job: string
    destination: string
    /** What a download of this item is called. */
    filename: string
    text: string
    filled: string[]
    leftForYou: string[]
}

const present = (items: (string | false)[]) =>
    items.filter((item): item is string => Boolean(item))

export const exportKit = (brief: Brief): ExportItem[] => {
    const name = themeName(brief)
    const { metrics, layout, blocksOn } = brief
    const tokenCount =
        layoutTokens(brief).length +
        (metrics.radius ? 1 : 0) +
        (metrics.border ? 1 : 0) +
        (layout.spacing === 'default' ? 0 : 1)
    const typeRows = brief.scale.filter(
        (row) => row.mobile || row.desktop
    ).length
    const extraBlocks = plannedExtraBlocks(brief).length

    return [
        {
            key: 'brief',
            label: 'BRIEF.md',
            job: 'The written plan: every decision you made here, for you and anyone helping you build. Nuxion itself never reads this file.',
            destination: `Save as themes/${name}/BRIEF.md`,
            filename: 'BRIEF.md',
            text: renderBrief(brief),
            filled: [
                'Every answer from the earlier steps, in the layout of Nuxion’s template',
                'The build order and QA checklist, with your theme’s name filled in',
            ],
            leftForYou: [
                blocksOn
                    ? 'Nothing. Keep it up to date as the design changes'
                    : 'The Blocks and Demo site sections, marked as not planned yet',
            ],
        },
        {
            key: 'css',
            label: 'theme.css',
            job: 'The stylesheet that sets the site’s width, corners and type. It takes effect once Site theme is switched on.',
            destination: `Replaces themes/${name}/app/theme.css`,
            filename: 'theme.css',
            text: renderThemeCss(brief),
            filled: [
                `${tokenCount} width, shape and button tokens`,
                `${themeVariables(brief).length} variables generated from your palette`,
                `${typeRows} type scale rows`,
            ],
            leftForYou: present([
                `${brief.art.primitives.length} art classes, as empty rules`,
                blocksOn &&
                    `${brief.restyled.length} restyled blocks, as empty rules`,
                'The section frame, as a heading comment',
            ]),
        },
        {
            key: 'studio',
            label: 'Studio content',
            job: 'Real Sanity documents built from your answers, ready to import: colours, Color Themes, buttons, Site Settings and a Home page.',
            destination: `Save as ${studioContentPath(brief)}`,
            filename: 'studio-content.ndjson',
            text: renderStudioContent(brief) || 'Nothing selected.',
            filled: STUDIO_OPTIONS.filter(({ key }) =>
                studioOptionOn(brief, key)
            ).map((option) => option.title),
            leftForYou: [
                'Your other pages and the navigation menu',
                'Images: logo, favicon and social image',
                'Footer links',
            ],
        },
        {
            key: 'commands',
            label: 'Commands',
            job: 'The terminal lines that set up the dataset, the theme’s folders, the Studio import and the checks.',
            destination: 'Run from your Nuxion repo root',
            filename: 'commands.sh',
            text: renderCommands(brief),
            filled: present([
                'The dataset and theme setup, with a starter hero block',
                extraBlocks > 0 &&
                    `${extraBlocks} more block scaffold line${extraBlocks === 1 ? '' : 's'}`,
                'The Studio import, colour compile and checks',
            ]),
            leftForYou: [
                blocksOn
                    ? 'Each block’s layout. The commands create a starter component to finish'
                    : 'Blocks beyond the hero, once you’ve planned them',
            ],
        },
    ]
}
