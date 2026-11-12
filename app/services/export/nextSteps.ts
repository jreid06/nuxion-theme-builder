import type { Brief } from '../brief/model'
import { blockType, themeName, themeTitle } from '../brief/names'
import {
    chromeCommands,
    createDatasetCommand,
    CSS_COMPILE,
    missingFonts,
    plannedExtraBlocks,
    scaffoldBlockCommand,
    scaffoldThemeCommand,
} from './renderCommands'
import {
    anyStudioOption,
    studioContentPath,
    studioImportCommand,
    studioOptionOn,
} from './studioContent'

/** The numbered hand-off on Review and export, tailored to this brief. */

export interface NextStep {
    /** The checkbox's key in `brief.next`. */
    id: string
    where: string
    title: string
    body?: string
    items?: string[]
    command?: string
    /** What the author can see once this step is done. */
    milestone?: string
}

const plural = (count: number, word: string) =>
    `${count} ${word}${count === 1 ? '' : 's'}`

const studioStep = (brief: Brief): NextStep => {
    const on = (key: Parameters<typeof studioOptionOn>[1]) =>
        studioOptionOn(brief, key)
    const title = themeTitle(brief)
    const importing = anyStudioOption(brief)
    const canvas = brief.themes[0]?.key ?? 'canvas'
    const items: string[] = []

    if (importing) {
        items.push(
            `Save the exported Studio content as ${studioContentPath(brief)}, then run the import below. Run npx sanity login inside studio/ first if you haven’t signed in.`,
            'Importing publishes everything straight away, so check your swatch slugs before you run it. Only an administrator can change a published slug.'
        )
    }
    if (!on('colours')) {
        items.push(
            `Themes → +: create a palette named ${title}, then add your ${brief.swatches.length} swatches under Colours.`
        )
    }
    if (!on('themes')) {
        items.push(
            `Text & Background Themes: add your ${plural(brief.themes.length, 'Color Theme')}.`
        )
    }
    if (!on('buttons')) {
        items.push(
            `Link & Button Styles: add your ${plural(brief.buttons.length, 'preset')}.`
        )
    }
    if (!on('settings')) {
        items.push(
            `Site Settings: set Default Site Theme to ${canvas}, Site theme to ${title}, and your fonts. If ${title} isn’t offered, restart npm run dev:all.`
        )
    }
    if (!on('home')) {
        items.push(
            'Create a page in the Studio and choose it as the Homepage in Site Settings, which requires one.'
        )
    }
    items.push(
        'Compile the colours into CSS with the last command. Run it again after any colour change.'
    )

    const handled = (
        ['colours', 'themes', 'buttons', 'settings', 'home'] as const
    ).every(on)
    return {
        id: 'colours',
        where: !importing
            ? 'Studio'
            : handled
              ? 'Terminal'
              : 'Terminal, then Studio',
        title: importing
            ? 'Import your Studio content'
            : 'Enter your colours and buttons',
        items,
        command: [importing && studioImportCommand(brief), CSS_COMPILE]
            .filter(Boolean)
            .join('\n'),
        milestone: on('home')
            ? 'Your theme is now visible on the home page: colours, type, width and corners.'
            : 'Your theme is switched on. Every page you build will use it.',
    }
}

export const nextSteps = (brief: Brief): NextStep[] => {
    const name = themeName(brief)
    const title = themeTitle(brief)
    const extra = plannedExtraBlocks(brief)
    const chrome = chromeCommands(brief)
    const fonts = missingFonts(brief)
    const { blocksOn, restyled, art } = brief

    const steps: NextStep[] = [
        {
            id: 'place',
            where: 'Files',
            title: 'Save your brief',
            body: `Create the folder themes/${name}/ in your Nuxion repo and save the exported BRIEF.md inside it.`,
        },
        {
            id: 'dataset',
            where: 'Terminal',
            title: 'Make a dataset to build in',
            body: `A separate Sanity dataset keeps this theme’s content apart from everything else. Afterwards, set SANITY_STUDIO_DATASET=${name} in both .env files (the root one and studio/.env).`,
            command: createDatasetCommand(name),
        },
        {
            id: 'skeleton',
            where: 'Terminal',
            title: blocksOn
                ? 'Create the theme and its block files'
                : 'Create the theme’s folders',
            body: `This writes the code folders, enables the theme in code and adds a starter ${name}.hero block${extra.length ? `, plus starter files for ${plural(extra.length, 'more block')}` : ''}. Start Nuxion afterwards with npm run dev:all.`,
            command: [
                scaffoldThemeCommand(brief),
                ...extra.map((block) =>
                    scaffoldBlockCommand(blockType(brief, block), name)
                ),
                ...chrome,
            ].join('\n'),
        },
        fonts.length
            ? {
                  id: 'fonts',
                  where: 'Code',
                  title: 'Add your fonts',
                  body: `Add ${fonts.join(', ')} to fonts.js, then generate the font CSS.`,
                  command: 'npm run fonts:generate',
              }
            : {
                  id: 'fonts',
                  where: 'Nothing to do',
                  title: 'Fonts',
                  body: 'All your fonts already ship with Nuxion.',
              },
        {
            id: 'css',
            where: 'Files',
            title: 'Drop in your stylesheet',
            body: `Replace themes/${name}/app/theme.css with the exported theme.css. The one the scaffold wrote only holds placeholder comments.`,
        },
        studioStep(brief),
        {
            id: 'look',
            where: 'Code',
            title: 'Finish the site-wide look',
            body:
                blocksOn && restyled.length
                    ? `In theme.css, write the section frame and the ${plural(restyled.length, 'restyled block')}, which export as empty rules. Then check a page in light and dark.`
                    : 'In theme.css, write the section frame and adjust any of Nuxion’s shipped blocks that need it. Then check a page in light and dark.',
        },
        {
            id: 'art',
            where: 'Code',
            title: 'Make the art',
            body: `Write ${plural(art.primitives.length, 'CSS primitive')}, build ${plural(art.elements.length, 'Vue element')} and create the image files listed in your brief.`,
        },
        blocksOn
            ? {
                  id: 'blocks',
                  where: 'Code',
                  title: 'Build the theme blocks',
                  body: 'The commands in step 3 created each block with its fields. Write each layout, and add anything the scaffolder can’t make, such as an icon picker or a reference to another document.',
                  milestone: `Your blocks are finished and in the page builder, under Theme: ${title}.`,
              }
            : {
                  id: 'blocks',
                  where: 'When you’re ready',
                  title: 'Add more blocks',
                  body: `You have a starter ${name}.hero to work from. Once you’ve planned the rest, add each block with this command and write its layout. You can also come back to the Blocks step to plan them here.`,
                  command: scaffoldBlockCommand(`${name}.<block>`, name),
              },
    ]

    if (blocksOn) {
        steps.push({
            id: 'chrome',
            where: 'Code',
            title: 'Navigation and footer',
            body: chrome.length
                ? 'Write the layout of the bar or footer created in step 3, and restyle whichever one you kept from Nuxion.'
                : 'Restyle the shipped navigation and footer in theme.css.',
        })
    }

    steps.push({
        id: 'check',
        where: 'Terminal',
        title: 'Run the checks',
        body: 'Run the checks, set Site theme to None and confirm the site looks as it did before. Add tests for any helpers, update themes/README.md and the CHANGELOG, then finish the QA list below.',
        command: 'npm run check',
    })
    return steps
}
